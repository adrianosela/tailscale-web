export declare interface Connection {
    /** Register a handler for incoming data. Must be called before write() — data can arrive as soon as the connection is established. */
    onData(handler: (data: Uint8Array) => void): void;
    /** Send data over the connection. Accepts a Uint8Array or a string. */
    write(data: Uint8Array | string): void;
    /** Close the connection and release all resources. */
    close(): void;
}

export declare interface DNSInfo {
    /** Global nameservers. */
    resolvers: string[];
    /** Split-DNS map: suffix → dedicated resolver addresses. */
    routes: Record<string, string[]>;
    /** Search/split-DNS domains. */
    domains: string[];
    /** Custom DNS records pushed by the control plane. */
    extraRecords: {
        name: string;
        type: string;
        value: string;
    }[];
    /** Whether MagicDNS proxied resolution is enabled. */
    magicDNS: boolean;
}

export declare interface ExitNode {
    /** Stable node ID — pass to setExitNode() to activate. */
    id: string;
    hostName: string;
    /** MagicDNS FQDN (ends with a dot). */
    dnsName: string;
    /** Primary Tailscale IPv4 address. */
    tailscaleIP: string;
    /** Whether this node is the currently active exit node. */
    active: boolean;
    online: boolean;
}

export declare interface InitOptions {
    /** Device name as it appears on the tailnet. Default: "tailscale-web" */
    hostname?: string;
    /**
     * Custom storage backend for persisting Tailscale state.
     * If omitted, defaults to localStorage in browser environments,
     * or an in-memory store (no persistence) elsewhere.
     */
    storage?: StorageAdapter | null;
    /** Key prefix used by the default localStorage store. Keys are written as "{prefix}_{stateKey}". Default: "tailscale-web" */
    storagePrefix?: string;
    /** Override the Tailscale coordination server URL. */
    controlUrl?: string;
    /** Called with the OAuth URL when interactive login is needed. */
    onAuthRequired?: (url: string) => void;
    /** Called once the device is authenticated and connected. */
    onAuthComplete?: () => void;
}

export declare interface Listener {
    /** The port number the listener is bound to. */
    port: number;
    /** Stop the listener and release all resources. */
    close(): void;
}

export declare const network: {
    /**
     * Initialize and connect the Tailscale node. Must be called before any
     * other method. Resolves once the node is authenticated and ready.
     *
     * If the node has persisted state from a previous session it reconnects
     * automatically. Otherwise the OAuth flow is triggered via onAuthRequired.
     * Rejects if the auth URL does not arrive within 60 seconds, or if the
     * user does not complete authentication within 5 minutes.
     *
     * @example
     * await network.init({
     *   hostname: "my-app",
     *   onAuthRequired(url) {
     *     window.open(url, "_blank", "width=600,height=700")
     *   },
     *   onAuthComplete() {
     *     console.log("connected!")
     *   },
     * })
     *
     * @example
     * // Custom storage backend (e.g. sessionStorage or any key/value store)
     * await network.init({
     *   hostname: "my-app",
     *   storage: {
     *     get: key => sessionStorage.getItem(key),
     *     set: (key, val) => sessionStorage.setItem(key, val),
     *   },
     *   onAuthRequired(url) { console.log("Authenticate at:", url) },
     * })
     */
    init(options?: InitOptions): Promise<void>;
    /**
     * Send an ICMP ping to addr and measure round-trip time.
     * addr may be a hostname or Tailscale IP.
     *
     * @example
     * const result = await network.ping("my-server")
     * if (result.alive) {
     *   console.log(`rtt: ${result.rttMs.toFixed(3)} ms  ip: ${result.nodeIP}`)
     * } else {
     *   console.warn("unreachable:", result.err)
     * }
     */
    ping(addr: string): Promise<PingResult>;
    /**
     * Open a raw TCP connection through the Tailscale network.
     * Returns a Connection object for sending and receiving data.
     *
     * @example
     * const conn = await network.dialTCP("my-server:8080")
     *
     * conn.onData(data => {
     *   console.log(new TextDecoder().decode(data))
     * })
     *
     * conn.write("hello\n")
     * conn.close()
     */
    dialTCP(addr: string): Promise<Connection>;
    /**
     * Listen for inbound TCP connections on the given Tailscale port.
     * Pass port 0 (default) to get an ephemeral port assigned automatically.
     * onConnection is called for each accepted connection.
     * Returns a Listener with the assigned port number and a close() method.
     *
     * @example
     * const listener = await network.listenTCP(8080, conn => {
     *   conn.onData(data => console.log(new TextDecoder().decode(data)))
     *   conn.write("hello\n")
     * })
     * console.log("listening on port", listener.port)
     *
     * @example
     * // Ephemeral port
     * const listener = await network.listenTCP(0, conn => { conn.close() })
     * console.log("assigned port:", listener.port)
     * listener.close()
     */
    listenTCP(port: number | undefined, onConnection: (conn: Connection) => void): Promise<Listener>;
    /**
     * Make an HTTP request through the Tailscale network. Supports method,
     * headers, and body. Does not yet support AbortSignal, streaming bodies
     * or responses, or other advanced Fetch API options.
     *
     * @example
     * const resp = await network.fetch("https://internal-service/api", {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json" },
     *   body: JSON.stringify({ key: "value" }),
     * })
     * console.log(resp.status, resp.ok)
     * const data = await resp.json()
     */
    fetch(url: string, init?: RequestInit_2): Promise<Response_2>;
    /**
     * Return the current preferences (acceptRoutes, exitNodeId).
     * Synchronous — no await needed. Must be called after init() resolves.
     *
     * @example
     * const { acceptRoutes, exitNodeId } = network.getPrefs()
     * console.log("exit node:", exitNodeId || "(none)")
     */
    getPrefs(): Prefs;
    /**
     * Enable or disable acceptance of subnet routes advertised by peers.
     * Equivalent to `tailscale set --accept-routes`.
     *
     * @example
     * await network.setAcceptRoutes(true)
     */
    setAcceptRoutes(accept: boolean): Promise<void>;
    /**
     * Return all peers that advertise exit-node capability.
     * Synchronous — no await needed. Returns an empty array if called before init() resolves.
     *
     * @example
     * const nodes = network.listExitNodes()
     * for (const n of nodes) {
     *   console.log(n.hostName, n.tailscaleIP, n.online ? "online" : "offline")
     * }
     */
    listExitNodes(): ExitNode[];
    /**
     * Activate an exit node by its stable node ID.
     * Pass an empty string (or omit) to clear the exit node.
     *
     * @example
     * // Activate the first available online exit node
     * const node = network.listExitNodes().find(n => n.online)
     * if (node) await network.setExitNode(node.id)
     *
     * @example
     * // Clear the active exit node
     * await network.setExitNode()
     */
    setExitNode(id?: string): Promise<void>;
    /**
     * Return the full routing table (self + all peers).
     * Synchronous — no await needed. Returns an empty array if called before init() resolves.
     *
     * @example
     * const routes = network.getRoutes()
     * for (const r of routes) {
     *   console.log(r.prefix, "via", r.via, r.isExitRoute ? "(exit)" : "")
     * }
     */
    getRoutes(): Route[];
    /**
     * Return the current Tailscale-managed DNS configuration.
     * Synchronous — no await needed. Returns an empty DNSInfo object if called before init() resolves.
     *
     * @example
     * const dns = network.getDNS()
     * console.log("resolvers:", dns.resolvers)
     * console.log("MagicDNS:", dns.magicDNS)
     * for (const [suffix, resolvers] of Object.entries(dns.routes)) {
     *   console.log(`split-DNS: ${suffix} → ${resolvers.join(", ")}`)
     * }
     */
    getDNS(): DNSInfo;
};

export declare interface PingResult {
    alive: boolean;
    /** Round-trip time in milliseconds. Only meaningful when alive is true. */
    rttMs: number;
    /** MagicDNS name of the destination peer. */
    nodeName: string;
    /** Tailscale IP of the destination. */
    nodeIP: string;
    /** Direct UDP endpoint used if a direct path exists (e.g. an IP:port string). */
    endpoint: string;
    /** DERP relay region code (e.g. "nyc") if traffic was relayed; empty if direct. */
    derpRegionCode: string;
    /** Error reason when alive is false. */
    err: string;
}

export declare interface Prefs {
    /** Whether subnet routes advertised by peers are accepted. */
    acceptRoutes: boolean;
    /** Stable node ID of the active exit node, or empty string if none. */
    exitNodeId: string;
}

declare interface RequestInit_2 {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Uint8Array;
}
export { RequestInit_2 as RequestInit }

declare interface Response_2 {
    status: number;
    statusText: string;
    ok: boolean;
    headers: Record<string, string>;
    text(): Promise<string>;
    json(): Promise<unknown>;
    arrayBuffer(): Promise<ArrayBuffer>;
    bytes(): Promise<Uint8Array>;
}
export { Response_2 as Response }

export declare interface Route {
    /** CIDR prefix (e.g. a subnet or default route). */
    prefix: string;
    /** Display name of the advertising node, or "self". */
    via: string;
    /** Whether this node is the primary (active) router for the prefix. */
    isPrimary: boolean;
    /** Whether this is a default/exit route (0.0.0.0/0 or ::/0). */
    isExitRoute: boolean;
}

export declare interface StorageAdapter {
    get(key: string): string | null;
    set(key: string, value: string): void;
}

export { }
