//go:build js

package network

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"tailscale.com/ipn"
	"tailscale.com/types/logger"
)

// localStorageStore is the default ipn.StateStore, backed by browser localStorage.
type localStorageStore struct {
	prefix string
	logf   logger.Logf
}

func newLocalStorageStore(prefix string, logf logger.Logf) *localStorageStore {
	return &localStorageStore{prefix: prefix, logf: logf}
}

func (s *localStorageStore) storageKey(id ipn.StateKey) string {
	return fmt.Sprintf("%s_%s", s.prefix, id)
}

func (s *localStorageStore) ReadState(id ipn.StateKey) ([]byte, error) {
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

func (s *localStorageStore) WriteState(id ipn.StateKey, data []byte) error {
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
