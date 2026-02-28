//go:build js

package jsutil

import "syscall/js"

// ToBytes converts a JS value to a Go byte slice.
// Accepts strings, Uint8Array, or any ArrayBufferView.
func ToBytes(v js.Value) []byte {
	if v.Type() == js.TypeString {
		return []byte(v.String())
	}
	length := v.Get("length")
	if length.IsUndefined() {
		length = v.Get("byteLength")
	}
	buf := make([]byte, length.Int())
	js.CopyBytesToGo(buf, v)
	return buf
}

// ToUint8Array copies a Go byte slice into a JS Uint8Array.
func ToUint8Array(data []byte) js.Value {
	arr := js.Global().Get("Uint8Array").New(len(data))
	js.CopyBytesToJS(arr, data)
	return arr
}

// ObjectToMap converts a plain JS object's string keys/values into a Go map.
func ObjectToMap(v js.Value) map[string]string {
	keys := js.Global().Get("Object").Call("keys", v)
	n := keys.Get("length").Int()
	m := make(map[string]string, n)
	for i := 0; i < n; i++ {
		k := keys.Index(i).String()
		m[k] = v.Get(k).String()
	}
	return m
}

// NewObject creates a new empty JS Object.
func NewObject() js.Value {
	return js.Global().Get("Object").New()
}
