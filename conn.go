//go:build js

package main

import (
	"net"
	"syscall/js"

	"github.com/adrianosela/tailscale-web/pkg/jsutil"
)

// newJSConn wraps a net.Conn in a JS object { write(data), onData(fn), close() }
// and starts a goroutine that pumps reads back to the onData callback.
func newJSConn(conn net.Conn) js.Value {
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

	return jsConn
}
