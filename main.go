//go:build js

package main

import (
	"context"
	"fmt"
	"log"
	"syscall/js"

	"github.com/adrianosela/tailscale-web/internal/network"
	"github.com/adrianosela/tailscale-web/pkg/jsutil"
	"github.com/adrianosela/tailscale-web/pkg/promise"
	"github.com/adrianosela/tailscale-web/pkg/storage"
)

var tsNet *network.Network

func main() {
	ns := jsutil.NewObject()
	ns.Set("setStorage", js.FuncOf(setStorageFn))
	ns.Set("init", js.FuncOf(initFn))
	ns.Set("ping", js.FuncOf(pingFn))
	ns.Set("dial", js.FuncOf(dialFn))
	ns.Set("fetch", js.FuncOf(fetchFn))
	js.Global().Set("__tailscaleWeb", ns)

	log.Println("tailscale-web: WASM ready")
	select {}
}

// setStorage configures the state store used on the next init() call.
// Pass an object with get(key)/set(key,val) methods for a custom backend,
// or null/undefined to revert to the default localStorage store.
func setStorageFn(this js.Value, args []js.Value) any {
	if len(args) < 1 || args[0].IsNull() || args[0].IsUndefined() {
		network.SetCustomStore(nil)
		return nil
	}
	obj := args[0]
	network.SetCustomStore(storage.NewJSStore(obj.Get("get"), obj.Get("set")))
	return nil
}

// init(options?) → Promise<void>
//
//	options: {
//	  hostname?:        string   — device name on the tailnet
//	  storagePrefix?:   string   — localStorage key prefix (default "tailscale-web")
//	  controlUrl?:      string   — custom coordination server URL
//	  onAuthRequired?:  (url: string) => void
//	  onAuthComplete?:  () => void
//	}
func initFn(this js.Value, args []js.Value) any {
	return promise.New(func(resolve, reject func(any)) {
		cfg := network.Config{Hostname: "tailscale-web"}
		var onAuthRequired network.OnAuthRequired
		var onAuthComplete network.OnAuthComplete

		if len(args) > 0 && !args[0].IsNull() && !args[0].IsUndefined() {
			opts := args[0]
			if v := opts.Get("hostname"); v.Type() == js.TypeString {
				cfg.Hostname = v.String()
			}
			if v := opts.Get("storagePrefix"); v.Type() == js.TypeString {
				cfg.StoragePrefix = v.String()
			}
			if v := opts.Get("controlUrl"); v.Type() == js.TypeString {
				cfg.ControlURL = v.String()
			}
			if fn := opts.Get("onAuthRequired"); fn.Type() == js.TypeFunction {
				onAuthRequired = func(url string) { fn.Invoke(url) }
			}
			if fn := opts.Get("onAuthComplete"); fn.Type() == js.TypeFunction {
				onAuthComplete = func() { fn.Invoke() }
			}
		}

		net, err := network.Connect(context.Background(), cfg, onAuthRequired, onAuthComplete)
		if err != nil {
			reject(err)
			return
		}
		tsNet = net
		resolve(js.Undefined())
	})
}

// ping(addr) → Promise<{ alive: bool, rttMs: number }>
//
// addr may be "host" (port 443 assumed) or "host:port".
func pingFn(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return promise.Reject("ping: address required")
	}
	addr := args[0].String()
	return promise.New(func(resolve, reject func(any)) {
		if tsNet == nil {
			reject(fmt.Errorf("not initialized — call init() first"))
			return
		}
		result, err := tsNet.Ping(context.Background(), addr)
		if err != nil {
			reject(err)
			return
		}
		obj := jsutil.NewObject()
		obj.Set("alive", result.Alive)
		obj.Set("rttMs", result.RttMs)
		resolve(obj)
	})
}

// dial(addr) → Promise<Connection>
//
// Returns a connection object: { onData(fn), write(data), close() }
func dialFn(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return promise.Reject("dial: address required")
	}
	addr := args[0].String()
	return promise.New(func(resolve, reject func(any)) {
		if tsNet == nil {
			reject(fmt.Errorf("not initialized — call init() first"))
			return
		}
		conn, err := tsNet.Dial(context.Background(), "tcp", addr)
		if err != nil {
			reject(err)
			return
		}

		var onDataCb js.Value

		var writeFn, onDataFn, closeFn js.Func

		writeFn = js.FuncOf(func(this js.Value, args []js.Value) any {
			if len(args) > 0 {
				go conn.Write(jsutil.ToBytes(args[0]))
			}
			return nil
		})

		onDataFn = js.FuncOf(func(this js.Value, args []js.Value) any {
			if len(args) > 0 && args[0].Type() == js.TypeFunction {
				onDataCb = args[0]
			}
			return nil
		})

		closeFn = js.FuncOf(func(this js.Value, args []js.Value) any {
			conn.Close()
			writeFn.Release()
			onDataFn.Release()
			closeFn.Release()
			return nil
		})

		jsConn := jsutil.NewObject()
		jsConn.Set("write", writeFn)
		jsConn.Set("onData", onDataFn)
		jsConn.Set("close", closeFn)

		// Pump reads back to JS.
		go func() {
			buf := make([]byte, 32*1024)
			for {
				n, err := conn.Read(buf)
				if n > 0 && onDataCb.Type() == js.TypeFunction {
					onDataCb.Invoke(jsutil.ToUint8Array(buf[:n]))
				}
				if err != nil {
					break
				}
			}
		}()

		resolve(jsConn)
	})
}

// fetch(url, init?) → Promise<{ status, statusText, ok, headers, body: Uint8Array }>
//
// init: { method?, headers?, body? }  — mirrors the browser Fetch API init object.
func fetchFn(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return promise.Reject("fetch: URL required")
	}
	url := args[0].String()

	opts := network.FetchOptions{Method: "GET"}
	if len(args) > 1 && !args[1].IsNull() && !args[1].IsUndefined() {
		o := args[1]
		if v := o.Get("method"); v.Type() == js.TypeString {
			opts.Method = v.String()
		}
		if v := o.Get("headers"); v.Type() == js.TypeObject {
			opts.Headers = jsutil.ObjectToMap(v)
		}
		if v := o.Get("body"); !v.IsNull() && !v.IsUndefined() {
			opts.BodyBytes = jsutil.ToBytes(v)
		}
	}

	return promise.New(func(resolve, reject func(any)) {
		if tsNet == nil {
			reject(fmt.Errorf("not initialized — call init() first"))
			return
		}
		result, err := tsNet.Fetch(context.Background(), url, opts)
		if err != nil {
			reject(err)
			return
		}

		hdrs := jsutil.NewObject()
		for k, v := range result.Headers {
			hdrs.Set(k, v)
		}

		resp := jsutil.NewObject()
		resp.Set("status", result.Status)
		resp.Set("statusText", result.StatusText)
		resp.Set("ok", result.Status >= 200 && result.Status < 300)
		resp.Set("headers", hdrs)
		resp.Set("body", jsutil.ToUint8Array(result.Body))
		resolve(resp)
	})
}
