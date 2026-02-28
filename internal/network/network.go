//go:build js

package network

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/netip"
	"strings"
	"time"

	"tailscale.com/ipn"
	"tailscale.com/ipn/ipnlocal"
	"tailscale.com/logpolicy"
	"tailscale.com/logtail"
	"tailscale.com/net/netns"
	"tailscale.com/net/tsdial"
	"tailscale.com/tsd"
	"tailscale.com/types/logger"
	"tailscale.com/wgengine"
	"tailscale.com/wgengine/netstack"
)

// customStore is set via SetCustomStore before Connect is called.
var customStore ipn.StateStore

// SetCustomStore sets a custom state store to use on the next Connect call.
// Pass nil to revert to the default localStorage-backed store.
func SetCustomStore(s ipn.StateStore) {
	customStore = s
}

// Config holds configuration for the Tailscale node.
type Config struct {
	// Hostname is the name this device will appear as on the tailnet.
	Hostname string

	// StoragePrefix is the localStorage key namespace when using the default store.
	// Defaults to "tailscale-web".
	StoragePrefix string

	// ControlURL overrides the Tailscale coordination server URL.
	// Defaults to the public Tailscale control server.
	ControlURL string
}

// OnAuthRequired is called with the OAuth URL when interactive login is needed.
type OnAuthRequired func(url string)

// OnAuthComplete is called once the device is authenticated and connected.
type OnAuthComplete func()

// Network manages a Tailscale node running in the browser.
type Network struct {
	backend    *ipnlocal.LocalBackend
	dialer     *tsdial.Dialer
	httpClient *http.Client
}

// PingResult is the result of a TCP connectivity probe.
type PingResult struct {
	Alive bool
	RttMs float64
}

// FetchOptions mirrors the subset of the Fetch API init object we support.
type FetchOptions struct {
	Method    string
	Headers   map[string]string
	BodyBytes []byte
}

// FetchResponse is the result of a Fetch call.
type FetchResponse struct {
	Status     int
	StatusText string
	Headers    map[string]string
	Body       []byte
}

// Connect starts a Tailscale node and returns a ready Network.
// If the node has persisted state from a previous session it reconnects
// automatically; otherwise it triggers the OAuth flow via onAuthRequired.
func Connect(ctx context.Context, cfg Config, onAuthRequired OnAuthRequired, onAuthComplete OnAuthComplete) (*Network, error) {
	netns.SetEnabled(false)
	logf := logger.Logf(log.Printf)

	log.Println("tailscale-web: starting...")

	n := &Network{}
	sys := tsd.NewSystem()

	// Resolve the state store: prefer custom, fall back to localStorage.
	store := customStore
	if store == nil {
		prefix := cfg.StoragePrefix
		if prefix == "" {
			prefix = "tailscale-web"
		}
		store = newLocalStorageStore(prefix, logf)
	}
	sys.Set(store)

	dialer := &tsdial.Dialer{Logf: logf}
	n.dialer = dialer

	eng, err := wgengine.NewUserspaceEngine(logf, wgengine.Config{
		Dialer:        dialer,
		SetSubsystem:  sys.Set,
		ControlKnobs:  sys.ControlKnobs(),
		HealthTracker: sys.HealthTracker(),
		Metrics:       sys.UserMetricsRegistry(),
		EventBus:      sys.Bus.Get(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create WireGuard engine: %w", err)
	}
	sys.Set(eng)

	ns, err := netstack.Create(logf, sys.Tun.Get(), eng, sys.MagicSock.Get(), dialer, sys.DNSManager.Get(), sys.ProxyMapper())
	if err != nil {
		return nil, fmt.Errorf("failed to create netstack: %w", err)
	}
	sys.Set(ns)
	ns.ProcessLocalIPs = true
	ns.ProcessSubnets = true

	dialer.UseNetstackForIP = func(ip netip.Addr) bool { return true }
	dialer.NetstackDialTCP = func(ctx context.Context, dst netip.AddrPort) (net.Conn, error) {
		return ns.DialContextTCP(ctx, dst)
	}
	dialer.NetstackDialUDP = func(ctx context.Context, dst netip.AddrPort) (net.Conn, error) {
		return ns.DialContextUDP(ctx, dst)
	}
	sys.NetstackRouter.Set(true)
	sys.Tun.Get().Start()

	lpc := logpolicy.NewConfig(logtail.CollectionNode)
	backend, err := ipnlocal.NewLocalBackend(logf, lpc.PublicID, sys, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to create backend: %w", err)
	}
	n.backend = backend

	if err := ns.Start(backend); err != nil {
		return nil, fmt.Errorf("failed to start netstack: %w", err)
	}

	loginURLCh := make(chan string, 1)
	backend.SetNotifyCallback(func(notif ipn.Notify) {
		if notif.State != nil {
			log.Printf("tailscale-web: state=%s", *notif.State)
		}
		if notif.ErrMessage != nil {
			log.Printf("tailscale-web: notice: %s", *notif.ErrMessage)
		}
		if notif.BrowseToURL != nil && *notif.BrowseToURL != "" {
			url := *notif.BrowseToURL
			log.Printf("tailscale-web: auth URL ready")
			if onAuthRequired != nil {
				onAuthRequired(url)
			}
			select {
			case loginURLCh <- url:
			default:
			}
		}
	})

	prefs := ipn.NewPrefs()
	prefs.WantRunning = true
	prefs.Hostname = cfg.Hostname
	if cfg.ControlURL != "" {
		prefs.ControlURL = cfg.ControlURL
	} else {
		prefs.ControlURL = ipn.DefaultControlURL
	}

	if err := backend.Start(ipn.Options{UpdatePrefs: prefs}); err != nil {
		backend.Shutdown()
		return nil, fmt.Errorf("failed to start backend: %w", err)
	}

	// Give the backend a moment to load persisted state.
	time.Sleep(500 * time.Millisecond)
	for start := time.Now(); time.Since(start) < 5*time.Second; {
		st := backend.Status()
		if len(st.TailscaleIPs) > 0 && !backend.NodeKey().IsZero() {
			log.Printf("tailscale-web: restored from persisted state, IPs=%v", st.TailscaleIPs)
			if onAuthComplete != nil {
				onAuthComplete()
			}
			n.httpClient = n.newHTTPClient()
			return n, nil
		}
		if st.BackendState == "Running" || st.BackendState == "NeedsLogin" {
			break
		}
		time.Sleep(200 * time.Millisecond)
	}

	// Need interactive login.
	log.Println("tailscale-web: no persisted auth, starting OAuth flow...")
	backend.StartLoginInteractive(ctx)

	select {
	case <-loginURLCh:
		log.Println("tailscale-web: auth URL dispatched")
	case <-time.After(60 * time.Second):
		backend.Shutdown()
		return nil, fmt.Errorf("timeout waiting for auth URL")
	}

	if err := waitForAuth(ctx, backend, onAuthComplete); err != nil {
		backend.Shutdown()
		return nil, err
	}

	n.httpClient = n.newHTTPClient()
	return n, nil
}

func waitForAuth(ctx context.Context, backend *ipnlocal.LocalBackend, onAuthComplete OnAuthComplete) error {
	log.Println("tailscale-web: waiting for user to complete auth...")
	timeout := time.After(300 * time.Second)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-timeout:
			return fmt.Errorf("timeout waiting for authentication")
		case <-ticker.C:
			st := backend.Status()
			if len(st.TailscaleIPs) > 0 && !backend.NodeKey().IsZero() {
				log.Printf("tailscale-web: authenticated, IPs=%v", st.TailscaleIPs)
				if onAuthComplete != nil {
					onAuthComplete()
				}
				return nil
			}
		}
	}
}

func (n *Network) newHTTPClient() *http.Client {
	return &http.Client{
		Transport: &http.Transport{
			DialContext: n.dialer.UserDial,
		},
		Timeout: 30 * time.Second,
	}
}

// Dial opens a TCP connection through the Tailscale network.
func (n *Network) Dial(ctx context.Context, network, addr string) (net.Conn, error) {
	return n.dialer.UserDial(ctx, network, addr)
}

// Ping probes TCP connectivity to addr and measures round-trip time.
// addr may be "host" (port 443 assumed) or "host:port".
func (n *Network) Ping(ctx context.Context, addr string) (*PingResult, error) {
	if !strings.Contains(addr, ":") {
		addr += ":443"
	}
	dialCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	start := time.Now()
	conn, err := n.dialer.UserDial(dialCtx, "tcp", addr)
	if err != nil {
		return &PingResult{Alive: false}, nil
	}
	rtt := time.Since(start)
	conn.Close()
	return &PingResult{Alive: true, RttMs: float64(rtt.Microseconds()) / 1000.0}, nil
}

// Fetch makes an HTTP request through the Tailscale network.
func (n *Network) Fetch(ctx context.Context, rawURL string, opts FetchOptions) (*FetchResponse, error) {
	method := opts.Method
	if method == "" {
		method = "GET"
	}
	var body io.Reader
	if len(opts.BodyBytes) > 0 {
		body = bytes.NewReader(opts.BodyBytes)
	}
	req, err := http.NewRequestWithContext(ctx, method, rawURL, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	for k, v := range opts.Headers {
		req.Header.Set(k, v)
	}
	resp, err := n.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	headers := make(map[string]string, len(resp.Header))
	for k, vs := range resp.Header {
		if len(vs) > 0 {
			headers[k] = vs[0]
		}
	}
	return &FetchResponse{
		Status:     resp.StatusCode,
		StatusText: resp.Status,
		Headers:    headers,
		Body:       respBody,
	}, nil
}

// Close shuts down the Tailscale node.
func (n *Network) Close() error {
	if n.backend != nil {
		n.backend.Shutdown()
	}
	return nil
}
