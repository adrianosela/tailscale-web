//go:build js

// Package storage provides ipn.StateStore implementations for use in
// browser-based Tailscale nodes. Pass one of these to network.SetCustomStore
// before calling network.Init.
package storage

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"tailscale.com/ipn"
)

// LocalStorageStore implements ipn.StateStore using browser localStorage.
// Keys are namespaced with a prefix to avoid collisions with other data.
type LocalStorageStore struct {
	prefix string
}

// NewLocalStorageStore creates a localStorage-backed store with the given key prefix.
func NewLocalStorageStore(prefix string) *LocalStorageStore {
	return &LocalStorageStore{prefix: prefix}
}

func (s *LocalStorageStore) storageKey(id ipn.StateKey) string {
	return fmt.Sprintf("%s_%s", s.prefix, id)
}

func (s *LocalStorageStore) ReadState(id ipn.StateKey) ([]byte, error) {
	ls := js.Global().Get("localStorage")
	if ls.IsUndefined() {
		return nil, fmt.Errorf("localStorage not available")
	}
	v := ls.Call("getItem", s.storageKey(id))
	if v.IsNull() || v.String() == "" {
		return nil, ipn.ErrStateNotExist
	}
	var data []byte
	if err := json.Unmarshal([]byte(v.String()), &data); err != nil {
		return nil, ipn.ErrStateNotExist
	}
	return data, nil
}

func (s *LocalStorageStore) WriteState(id ipn.StateKey, data []byte) error {
	ls := js.Global().Get("localStorage")
	if ls.IsUndefined() {
		return fmt.Errorf("localStorage not available")
	}
	encoded, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to encode state: %w", err)
	}
	ls.Call("setItem", s.storageKey(id), string(encoded))
	return nil
}

// JSStore implements ipn.StateStore using caller-provided JS get/set functions.
// Use this to plug in any storage backend from JavaScript
// (IndexedDB, sessionStorage, a remote API, etc.).
type JSStore struct {
	getFn js.Value // (key: string) => string | null
	setFn js.Value // (key: string, value: string) => void
}

// NewJSStore creates a store backed by JavaScript get/set functions.
func NewJSStore(getFn, setFn js.Value) *JSStore {
	return &JSStore{getFn: getFn, setFn: setFn}
}

func (s *JSStore) ReadState(id ipn.StateKey) ([]byte, error) {
	v := s.getFn.Invoke(string(id))
	if v.IsNull() || v.IsUndefined() || v.String() == "" {
		return nil, ipn.ErrStateNotExist
	}
	var data []byte
	if err := json.Unmarshal([]byte(v.String()), &data); err != nil {
		return nil, ipn.ErrStateNotExist
	}
	return data, nil
}

func (s *JSStore) WriteState(id ipn.StateKey, data []byte) error {
	encoded, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to encode state: %w", err)
	}
	s.setFn.Invoke(string(id), string(encoded))
	return nil
}
