export declare interface Connection {
    /** Register a handler for incoming data. Call before writing. */
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
    /** localStorage key prefix when using the default store. Default: "tailscale-web" */
    storagePrefix?: string;
    /** Override the Tailscale coordination server URL. */
    controlUrl?: string;
    /** Called with the OAuth URL when interactive login is needed. */
    onAuthRequired?: (url: string) => void;
    /** Called once the device is authenticated and connected. */
    onAuthComplete?: () => void;
}

export declare const network: {
    /**
     * Configure the state storage backend.
     * Must be called before init() if you want a custom store.
     * Omit (or pass null) to use the default localStorage store.
     *
     * @example
     * network.setStorage({
     *   get: key => localStorage.getItem(key),
     *   set: (key, val) => localStorage.setItem(key, val),
     * })
     */
    setStorage(adapter: StorageAdapter | null): void;
    /**
     * Initialize and connect the Tailscale node. Must be called before any
     * other method. Resolves once the node is online and ready.
     *
     * If the node has persisted state from a previous session it reconnects
     * automatically. Otherwise the OAuth flow is triggered via onAuthRequired.
     */
    init(options?: InitOptions): Promise<void>;
    /**
     * Probe TCP connectivity to addr and measure round-trip time.
     * addr may be "host" (port 443 assumed) or "host:port".
     */
    ping(addr: string): Promise<PingResult>;
    /**
     * Open a raw TCP connection through the Tailscale network.
     * Returns a Connection object for sending and receiving data.
     */
    dial(addr: string): Promise<Connection>;
    /**
     * Make an HTTP request through the Tailscale network.
     * Mirrors the browser Fetch API signature.
     */
    fetch(url: string, init?: RequestInit_2): Promise<Response_2>;
    /**
     * Return the current preferences (acceptRoutes, exitNodeId).
     * Synchronous — no await needed.
     */
    getPrefs(): Prefs;
    /**
     * Enable or disable acceptance of subnet routes advertised by peers.
     * Equivalent to `tailscale set --accept-routes`.
     */
    setAcceptRoutes(accept: boolean): Promise<void>;
    /**
     * Return all peers that advertise exit-node capability.
     * Synchronous — no await needed.
     */
    listExitNodes(): ExitNode[];
    /**
     * Activate an exit node by its stable node ID.
     * Pass an empty string (or omit) to clear the exit node.
     */
    setExitNode(id?: string): Promise<void>;
    /**
     * Return the full routing table (self + all peers).
     * Synchronous — no await needed.
     */
    getRoutes(): Route[];
    /**
     * Return the current Tailscale-managed DNS configuration.
     * Synchronous — no await needed.
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
