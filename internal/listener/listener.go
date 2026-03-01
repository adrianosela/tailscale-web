package listener

import (
	"fmt"
	"math/rand"
	"net"
	"net/netip"
	"sync"
)

// Registry tracks active TCP listeners and provides the netstack dispatch handler.
type Registry struct {
	mu        sync.Mutex
	listeners map[uint16]*tcpListener
}

// New returns an empty Registry.
func New() *Registry {
	return &Registry{listeners: make(map[uint16]*tcpListener)}
}

// Listen opens a TCP listener on the given port. Pass 0 to have an ephemeral
// port assigned automatically from the range 49152–65535.
func (r *Registry) Listen(port int) (net.Listener, error) {
	if port < 0 || port > 65535 {
		return nil, fmt.Errorf("invalid port %d", port)
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if port == 0 {
		for range 100 {
			p := uint16(49152 + rand.Intn(16384))
			if _, taken := r.listeners[p]; !taken {
				port = int(p)
				break
			}
		}
		if port == 0 {
			return nil, fmt.Errorf("no available ephemeral ports")
		}
	}

	if _, taken := r.listeners[uint16(port)]; taken {
		return nil, fmt.Errorf("already listening on port %d", port)
	}

	ln := &tcpListener{
		r:      r,
		port:   uint16(port),
		connCh: make(chan net.Conn, 16),
		closed: make(chan struct{}),
	}
	r.listeners[uint16(port)] = ln
	return ln, nil
}

// TCPHandler returns the GetTCPHandlerForFlow callback to assign to a
// netstack.Impl, routing inbound TCP connections to the matching listener.
func (r *Registry) TCPHandler() func(src, dst netip.AddrPort) (func(net.Conn), bool) {
	return func(src, dst netip.AddrPort) (func(net.Conn), bool) {
		r.mu.Lock()
		ln, ok := r.listeners[dst.Port()]
		r.mu.Unlock()
		if !ok {
			return nil, false
		}
		return func(c net.Conn) {
			select {
			case ln.connCh <- c:
			case <-ln.closed:
				c.Close()
			}
		}, true
	}
}

// tcpListener implements net.Listener for inbound Tailscale TCP connections.
type tcpListener struct {
	r      *Registry
	port   uint16
	connCh chan net.Conn
	closed chan struct{}
	once   sync.Once
}

func (ln *tcpListener) Accept() (net.Conn, error) {
	select {
	case c := <-ln.connCh:
		return c, nil
	case <-ln.closed:
		return nil, fmt.Errorf("listen tcp :%d: %w", ln.port, net.ErrClosed)
	}
}

func (ln *tcpListener) Close() error {
	ln.once.Do(func() {
		close(ln.closed)
		ln.r.mu.Lock()
		delete(ln.r.listeners, ln.port)
		ln.r.mu.Unlock()
	})
	return nil
}

func (ln *tcpListener) Addr() net.Addr {
	return &net.TCPAddr{Port: int(ln.port)}
}
