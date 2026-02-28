//go:build js

package promise

import "syscall/js"

// New returns a JS Promise whose executor runs fn in a goroutine.
// fn receives resolve and reject callbacks; call exactly one of them.
func New(fn func(resolve, reject func(any))) js.Value {
	var handler js.Func
	handler = js.FuncOf(func(this js.Value, args []js.Value) any {
		resolve, reject := args[0], args[1]
		go func() {
			defer handler.Release()
			fn(
				func(v any) { resolve.Invoke(v) },
				func(v any) { reject.Invoke(Error(v)) },
			)
		}()
		return nil
	})
	return js.Global().Get("Promise").New(handler)
}

// Reject returns an already-rejected Promise with the given message.
func Reject(msg string) js.Value {
	return js.Global().Get("Promise").Call("reject", Error(msg))
}

// Error returns a JS Error object.
func Error(v any) js.Value {
	return js.Global().Get("Error").New(v)
}
