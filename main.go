//go:build js

package main

import (
	"context"
	"crypto/x509"
	"fmt"
	"log"
	"net"
	"syscall/js"

	"github.com/adrianosela/tailscale-web/internal/network"
	"github.com/adrianosela/tailscale-web/pkg/jsutil"
	"github.com/adrianosela/tailscale-web/pkg/promise"
	"github.com/adrianosela/tailscale-web/pkg/storage"
	"github.com/breml/rootcerts/embedded"
)

func init() {
	// In the WASM environment there is no OS certificate store, so the Go TLS
	// stack has no root CAs and rejects every HTTPS connection. Register the
	// Mozilla root CA bundle as the fallback pool so that certificate chains
	// signed by any publicly-trusted CA verify correctly.
	pool := x509.NewCertPool()
	pool.AppendCertsFromPEM([]byte(embedded.MozillaCACertificatesPEM()))
	x509.SetFallbackRoots(pool)
}

var tsNet *network.Network

func main() {
	ns := jsutil.NewObject()
	ns.Set("init", js.FuncOf(initFn))
	ns.Set("ping", js.FuncOf(pingFn))
	ns.Set("dialTCP", js.FuncOf(dialFn))
	ns.Set("listenTCP", js.FuncOf(listenFn))
	ns.Set("fetch", js.FuncOf(fetchFn))
	ns.Set("getPrefs", js.FuncOf(getPrefsFn))
	ns.Set("setAcceptRoutes", js.FuncOf(setAcceptRoutesFn))
	ns.Set("listExitNodes", js.FuncOf(listExitNodesFn))
	ns.Set("setExitNode", js.FuncOf(setExitNodeFn))
	ns.Set("getRoutes", js.FuncOf(getRoutesFn))
	ns.Set("getDNS", js.FuncOf(getDNSFn))
	js.Global().Set("__tailscaleWeb", ns)

	log.Println("tailscale-web: WASM ready")
	select {}
}

// init(options?) → Promise<void>
//
//	options: {
//	  hostname?:        string   — device name on the tailnet
//	  storage?:         { get(key): string|null, set(key, val): void } — custom state store
//	  storagePrefix?:   string   — key prefix for the default store (default "tailscale-web")
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
			if v := opts.Get("storage"); v.Type() == js.TypeObject {
				cfg.Store = storage.NewJSStore(v.Get("get"), v.Get("set"))
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
		obj.Set("nodeName", result.NodeName)
		obj.Set("nodeIP", result.NodeIP)
		obj.Set("endpoint", result.Endpoint)
		obj.Set("derpRegionCode", result.DERPRegionCode)
		obj.Set("err", result.Err)
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
		resolve(newJSConn(conn))
	})
}

// listenTCP(port, onConnection)
//
// Listens on the given Tailscale TCP port and calls onConnection(conn) for
// each accepted connection. Pass port 0 for an ephemeral port.
// Returns a Promise<{ port: number, close() }>.
func listenFn(this js.Value, args []js.Value) any {
	if len(args) < 2 {
		return promise.Reject("listenTCP: port and onConnection required")
	}
	port := args[0].Int()
	onConnection := args[1]
	if onConnection.Type() != js.TypeFunction {
		return promise.Reject("listenTCP: onConnection must be a function")
	}
	return promise.New(func(resolve, reject func(any)) {
		if tsNet == nil {
			reject(fmt.Errorf("not initialized — call init() first"))
			return
		}
		ln, err := tsNet.Listen(port)
		if err != nil {
			reject(err)
			return
		}

		var closeFn js.Func
		closeFn = js.FuncOf(func(this js.Value, args []js.Value) any {
			ln.Close()
			closeFn.Release()
			return nil
		})

		jsListener := jsutil.NewObject()
		jsListener.Set("port", ln.Addr().(*net.TCPAddr).Port)
		jsListener.Set("close", closeFn)

		go func() {
			for {
				conn, err := ln.Accept()
				if err != nil {
					break
				}
				onConnection.Invoke(newJSConn(conn))
			}
		}()

		resolve(jsListener)
	})
}

// getPrefs() → { acceptRoutes: bool, exitNodeId: string }
func getPrefsFn(this js.Value, args []js.Value) any {
	if tsNet == nil {
		return promise.Reject("not initialized — call init() first")
	}
	p := tsNet.GetPrefs()
	obj := jsutil.NewObject()
	obj.Set("acceptRoutes", p.AcceptRoutes)
	obj.Set("exitNodeId", p.ExitNodeID)
	return obj
}

// setAcceptRoutes(accept: bool) → Promise<void>
func setAcceptRoutesFn(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return promise.Reject("setAcceptRoutes: boolean argument required")
	}
	accept := args[0].Bool()
	return promise.New(func(resolve, reject func(any)) {
		if tsNet == nil {
			reject(fmt.Errorf("not initialized — call init() first"))
			return
		}
		if err := tsNet.SetAcceptRoutes(accept); err != nil {
			reject(err)
			return
		}
		resolve(js.Undefined())
	})
}

// listExitNodes() → [{ id, hostName, dnsName, tailscaleIP, active, online }]
func listExitNodesFn(this js.Value, args []js.Value) any {
	if tsNet == nil {
		return js.Global().Get("Array").New()
	}
	nodes := tsNet.ListExitNodes()
	arr := js.Global().Get("Array").New(len(nodes))
	for i, n := range nodes {
		obj := jsutil.NewObject()
		obj.Set("id", n.ID)
		obj.Set("hostName", n.HostName)
		obj.Set("dnsName", n.DNSName)
		obj.Set("tailscaleIP", n.TailscaleIP)
		obj.Set("active", n.Active)
		obj.Set("online", n.Online)
		arr.SetIndex(i, obj)
	}
	return arr
}

// setExitNode(id: string) → Promise<void>
//
// Pass an empty string to clear the exit node.
func setExitNodeFn(this js.Value, args []js.Value) any {
	id := ""
	if len(args) > 0 && args[0].Type() == js.TypeString {
		id = args[0].String()
	}
	return promise.New(func(resolve, reject func(any)) {
		if tsNet == nil {
			reject(fmt.Errorf("not initialized — call init() first"))
			return
		}
		if err := tsNet.SetExitNode(id); err != nil {
			reject(err)
			return
		}
		resolve(js.Undefined())
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

// getRoutes() → [{ prefix, via, isPrimary, isExitRoute }]
func getRoutesFn(this js.Value, args []js.Value) any {
	if tsNet == nil {
		return js.Global().Get("Array").New()
	}
	routes := tsNet.GetRoutes()
	arr := js.Global().Get("Array").New(len(routes))
	for i, r := range routes {
		obj := jsutil.NewObject()
		obj.Set("prefix", r.Prefix)
		obj.Set("via", r.Via)
		obj.Set("isPrimary", r.IsPrimary)
		obj.Set("isExitRoute", r.IsExitRoute)
		arr.SetIndex(i, obj)
	}
	return arr
}

// getDNS() → { resolvers, routes, domains, extraRecords, magicDNS }
func getDNSFn(this js.Value, args []js.Value) any {
	if tsNet == nil {
		return jsutil.NewObject()
	}
	d := tsNet.GetDNS()

	resolvers := js.Global().Get("Array").New(len(d.Resolvers))
	for i, r := range d.Resolvers {
		resolvers.SetIndex(i, r)
	}

	domains := js.Global().Get("Array").New(len(d.Domains))
	for i, dom := range d.Domains {
		domains.SetIndex(i, dom)
	}

	routes := jsutil.NewObject()
	for suffix, addrs := range d.Routes {
		arr := js.Global().Get("Array").New(len(addrs))
		for i, a := range addrs {
			arr.SetIndex(i, a)
		}
		routes.Set(suffix, arr)
	}

	extraRecords := js.Global().Get("Array").New(len(d.ExtraRecords))
	for i, rec := range d.ExtraRecords {
		obj := jsutil.NewObject()
		obj.Set("name", rec.Name)
		obj.Set("type", rec.Type)
		obj.Set("value", rec.Value)
		extraRecords.SetIndex(i, obj)
	}

	obj := jsutil.NewObject()
	obj.Set("resolvers", resolvers)
	obj.Set("routes", routes)
	obj.Set("domains", domains)
	obj.Set("extraRecords", extraRecords)
	obj.Set("magicDNS", d.MagicDNS)
	return obj
}
