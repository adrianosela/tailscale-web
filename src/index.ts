import "./wasm/wasm_exec.js"
import wasmUrl from "./wasm/main.wasm"

// esm.sh/esbuild replaces every `globalThis.process` reference with a
// module-scoped import variable, so direct assignments never reach globalThis.
// Use a computed key so the bundler can't detect this as the process global,
// ensuring globalThis.process is set for Go WASM (gvisor reads process.pid).
;(() => {
  const g = globalThis as any
  const k = "pro" + "cess"
  if (!g[k]) g[k] = { pid: 1 }
  else if (g[k].pid == null) g[k].pid = 1
})()

let wasmReady = false

async function ensureWasm(): Promise<void> {
  if (wasmReady) return
  const go = new (globalThis as any).Go()
  const result = await WebAssembly.instantiateStreaming(
    fetch(wasmUrl),
    go.importObject,
  )
  go.run(result.instance)
  wasmReady = true
}

function api(): any {
  return (globalThis as any).__tailscaleWeb
}

// ─── Public types ────────────────────────────────────────────────────────────

export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
}

export interface InitOptions {
  /** Device name as it appears on the tailnet. Default: "tailscale-web" */
  hostname?: string
  /** localStorage key prefix when using the default store. Default: "tailscale-web" */
  storagePrefix?: string
  /** Override the Tailscale coordination server URL. */
  controlUrl?: string
  /** Called with the OAuth URL when interactive login is needed. */
  onAuthRequired?: (url: string) => void
  /** Called once the device is authenticated and connected. */
  onAuthComplete?: () => void
}

export interface PingResult {
  alive: boolean
  /** Round-trip time in milliseconds. Only meaningful when alive is true. */
  rttMs: number
  /** MagicDNS name of the destination peer. */
  nodeName: string
  /** Tailscale IP of the destination. */
  nodeIP: string
  /** Direct UDP endpoint used if a direct path exists (e.g. an IP:port string). */
  endpoint: string
  /** DERP relay region code (e.g. "nyc") if traffic was relayed; empty if direct. */
  derpRegionCode: string
  /** Error reason when alive is false. */
  err: string
}

export interface ExitNode {
  /** Stable node ID — pass to setExitNode() to activate. */
  id: string
  hostName: string
  /** MagicDNS FQDN (ends with a dot). */
  dnsName: string
  /** Primary Tailscale IPv4 address. */
  tailscaleIP: string
  /** Whether this node is the currently active exit node. */
  active: boolean
  online: boolean
}

export interface Prefs {
  /** Whether subnet routes advertised by peers are accepted. */
  acceptRoutes: boolean
  /** Stable node ID of the active exit node, or empty string if none. */
  exitNodeId: string
}

export interface Connection {
  /** Register a handler for incoming data. Call before writing. */
  onData(handler: (data: Uint8Array) => void): void
  /** Send data over the connection. Accepts a Uint8Array or a string. */
  write(data: Uint8Array | string): void
  /** Close the connection and release all resources. */
  close(): void
}

export interface Response {
  status: number
  statusText: string
  ok: boolean
  headers: Record<string, string>
  text(): Promise<string>
  json(): Promise<unknown>
  arrayBuffer(): Promise<ArrayBuffer>
  bytes(): Promise<Uint8Array>
}

export interface Route {
  /** CIDR prefix (e.g. a subnet or default route). */
  prefix: string
  /** Display name of the advertising node, or "self". */
  via: string
  /** Whether this node is the primary (active) router for the prefix. */
  isPrimary: boolean
  /** Whether this is a default/exit route (0.0.0.0/0 or ::/0). */
  isExitRoute: boolean
}

export interface DNSInfo {
  /** Global nameservers. */
  resolvers: string[]
  /** Split-DNS map: suffix → dedicated resolver addresses. */
  routes: Record<string, string[]>
  /** Search/split-DNS domains. */
  domains: string[]
  /** Custom DNS records pushed by the control plane. */
  extraRecords: { name: string; type: string; value: string }[]
  /** Whether MagicDNS proxied resolution is enabled. */
  magicDNS: boolean
}

export interface RequestInit {
  method?: string
  headers?: Record<string, string>
  body?: string | Uint8Array
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function wrapResponse(raw: {
  status: number
  statusText: string
  ok: boolean
  headers: Record<string, string>
  body: Uint8Array
}): Response {
  return {
    status: raw.status,
    statusText: raw.statusText,
    ok: raw.ok,
    headers: raw.headers,
    text: async () => new TextDecoder().decode(raw.body),
    json: async () => JSON.parse(new TextDecoder().decode(raw.body)),
    arrayBuffer: async () => raw.body.buffer as ArrayBuffer,
    bytes: async () => raw.body,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const network = {
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
  setStorage(adapter: StorageAdapter | null): void {
    api().setStorage(adapter)
  },

  /**
   * Initialize and connect the Tailscale node. Must be called before any
   * other method. Resolves once the node is online and ready.
   *
   * If the node has persisted state from a previous session it reconnects
   * automatically. Otherwise the OAuth flow is triggered via onAuthRequired.
   */
  async init(options: InitOptions = {}): Promise<void> {
    await ensureWasm()
    return api().init(options)
  },

  /**
   * Probe TCP connectivity to addr and measure round-trip time.
   * addr may be "host" (port 443 assumed) or "host:port".
   */
  async ping(addr: string): Promise<PingResult> {
    return api().ping(addr)
  },

  /**
   * Open a raw TCP connection through the Tailscale network.
   * Returns a Connection object for sending and receiving data.
   */
  async dial(addr: string): Promise<Connection> {
    const raw = await api().dial(addr)
    return {
      onData(handler: (data: Uint8Array) => void) {
        raw.onData(handler)
      },
      write(data: Uint8Array | string) {
        raw.write(typeof data === "string" ? new TextEncoder().encode(data) : data)
      },
      close() {
        raw.close()
      },
    }
  },

  /**
   * Make an HTTP request through the Tailscale network.
   * Mirrors the browser Fetch API signature.
   */
  async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    return wrapResponse(await api().fetch(url, init))
  },

  /**
   * Return the current preferences (acceptRoutes, exitNodeId).
   * Synchronous — no await needed.
   */
  getPrefs(): Prefs {
    return api().getPrefs()
  },

  /**
   * Enable or disable acceptance of subnet routes advertised by peers.
   * Equivalent to `tailscale set --accept-routes`.
   */
  async setAcceptRoutes(accept: boolean): Promise<void> {
    return api().setAcceptRoutes(accept)
  },

  /**
   * Return all peers that advertise exit-node capability.
   * Synchronous — no await needed.
   */
  listExitNodes(): ExitNode[] {
    return Array.from(api().listExitNodes() as ArrayLike<ExitNode>)
  },

  /**
   * Activate an exit node by its stable node ID.
   * Pass an empty string (or omit) to clear the exit node.
   */
  async setExitNode(id: string = ""): Promise<void> {
    return api().setExitNode(id)
  },

  /**
   * Return the full routing table (self + all peers).
   * Synchronous — no await needed.
   */
  getRoutes(): Route[] {
    return Array.from(api().getRoutes() as ArrayLike<Route>)
  },

  /**
   * Return the current Tailscale-managed DNS configuration.
   * Synchronous — no await needed.
   */
  getDNS(): DNSInfo {
    return api().getDNS()
  },
}

