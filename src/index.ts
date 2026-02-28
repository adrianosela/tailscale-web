import "./wasm/wasm_exec.js"

let wasmReady = false

async function ensureWasm(): Promise<void> {
  if (wasmReady) return
  const go = new (globalThis as any).Go()
  const result = await WebAssembly.instantiateStreaming(
    fetch(new URL("./wasm/main.wasm", import.meta.url)),
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
  /** Round-trip time in milliseconds (TCP SYN). Only set when alive is true. */
  rttMs: number
}

export interface Connection {
  /** Register a handler for incoming data. Call before writing. */
  onData(handler: (data: Uint8Array) => void): void
  /** Send data over the connection. Accepts a Uint8Array or a string. */
  write(data: Uint8Array | string): void
  /** Close the connection and release all resources. */
  close(): void
}

export interface TsResponse {
  status: number
  statusText: string
  ok: boolean
  headers: Record<string, string>
  text(): Promise<string>
  json(): Promise<unknown>
  arrayBuffer(): Promise<ArrayBuffer>
  bytes(): Promise<Uint8Array>
}

export interface FetchInit {
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
}): TsResponse {
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

const network = {
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
  async fetch(url: string, init: FetchInit = {}): Promise<TsResponse> {
    return wrapResponse(await api().fetch(url, init))
  },
}

export default network
