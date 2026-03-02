# tailscale-web

[![npm version](https://img.shields.io/npm/v/tailscale-web.svg?style=flat-square)](https://www.npmjs.org/package/tailscale-web)
[![GitHub issues](https://img.shields.io/github/issues/adrianosela/tailscale-web.svg)](https://github.com/adrianosela/tailscale-web/issues)
[![license](https://img.shields.io/github/license/adrianosela/tailscale-web.svg)](https://github.com/adrianosela/tailscale-web/blob/main/LICENSE)
[![Go Report Card](https://goreportcard.com/badge/github.com/adrianosela/tailscale-web)](https://goreportcard.com/report/github.com/adrianosela/tailscale-web)

Run a [Tailscale](https://tailscale.com) device directly in the browser. Make HTTP requests, dial or listen for TCP connections, ping hosts, and use exit nodes for networking beyond Tailscale devices — all from a web page, with no server-side proxy required.

<details>
<summary>Click here for motivation</summary>

### Motivation

Tailscale software readily compiles for JavaScript runtimes (via WebAssembly). However, there isn't (as of February 2026) a JavaScript library that makes it easy to set-up Tailscale in the browser. You have to write the Go code yourself, compile it to WebAssembly bytecode (with GOOS=js GOARCH=wasm) yourself, and bundle it yourself alongside the JavaScript shim that sets up the Go runtime (a.k.a. `wasm_exec.js`).

Once you are done doing all that, then you have to implement any network clients you need. For example, if you want to perform HTTP requests over the Tailscale network, you have to implement a bridge (in Go) for your JavaScript to call. This is why this library includes common clients (TCP, ICMP, HTTP... with more to come).

</details>

## Install

### Web

```html
<script type="module">
  import { network } from "https://esm.sh/tailscale-web"
</script>
```

### Node / npm

```bash
npm install tailscale-web
```

```ts
import { network } from "tailscale-web"
```

## Quick start

### Web

```html
<!DOCTYPE html>
<html>
<body>
  <script type="module">
    import { network } from "https://esm.sh/tailscale-web"

    await network.init({
      hostname: "my-app",
      onAuthRequired(url) {
        window.open(url, "_blank", "width=600,height=700")
      },
      onAuthComplete() {
        console.log("connected!")
      },
    })

    const resp = await network.fetch("http://my-server/api/data")
    console.log(await resp.json())
  </script>
</body>
</html>
```

### Node / npm

```ts
import { network } from "tailscale-web"

await network.init({
  hostname: "my-app",
  onAuthRequired(url) {
    // Open the URL however your environment allows
    console.log("Authenticate at:", url)
  },
  onAuthComplete() {
    console.log("connected!")
  },
})

const resp = await network.fetch("http://my-server/api/data")
console.log(await resp.json())
```

In a browser, state is persisted to `localStorage` automatically, so the device reconnects on the next page load without requiring login again. Pass a `storage` adapter in `init()` to use a custom backend.

## API

### Initialize

`network.init(options?)` — Loads the WASM, starts the Tailscale node, and waits until it is authenticated and ready. Must be called before any other method.

If the node has persisted state it reconnects automatically; otherwise the OAuth flow is started and `onAuthRequired` is called with the login URL. Rejects if the auth URL does not arrive within 60 seconds, or if the user does not complete authentication within 5 minutes.

```ts
await network.init({
  // device name on the tailnet (default: "tailscale-web")
  hostname?: string

  // custom store; defaults to localStorage (browser) or in-memory (elsewhere)
  storage?: StorageAdapter

  // key prefix for the default store (default: "tailscale-web")
  // keys are written as "{prefix}_{stateKey}"
  storagePrefix?: string

  // custom coordination server URL
  controlUrl?: string

  // called when login is needed
  onAuthRequired?: (url: string) => void

  // called once authenticated
  onAuthComplete?: () => void
})
```

```ts
// Example: use sessionStorage as the backend
await network.init({
  hostname: "my-app",
  storage: {
    get: key => sessionStorage.getItem(key),
    set: (key, val) => sessionStorage.setItem(key, val),
  },
  onAuthRequired(url) { window.open(url, "_blank", "width=600,height=700") },
})
```

### Fetch (HTTP Client)

`network.fetch(url, init?)` — Make an HTTP/HTTPS request through the tailnet. Supports `method`, `headers`, and `body`. Does not yet support `AbortSignal`, streaming bodies or responses, or other advanced Fetch API options (`mode`, `credentials`, `cache`, `redirect`).

```ts
const resp = await network.fetch("https://internal-service/api", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
})

console.log(resp.status)        // 200
console.log(resp.ok)            // true
const data = await resp.json()
```

### Ping (ICMP)

`network.ping(addr)` — ICMP ping a peer and measure round-trip time. `addr` may be a hostname or Tailscale IP.

```ts
const result = await network.ping("my-server")
// { alive: true, rttMs: 3.2, nodeName: "my-server", nodeIP: "100.x.x.x", ... }
```

### Dial TCP

`network.dialTCP(addr)` — Open a raw TCP connection through the tailnet. Returns a `Connection` object.

```ts
const conn = await network.dialTCP("my-server:8080")

conn.onData(data => {
  console.log(new TextDecoder().decode(data))
})

conn.write("hello\n")
conn.close()
```

### Listen TCP

`network.listenTCP(port?, onConnection)` — Accept inbound TCP connections on a Tailscale port. Pass `0` (or omit) for an ephemeral port. Returns a `Listener` with the assigned `port` and a `close()` method.

```ts
const listener = await network.listenTCP(8080, conn => {
  conn.onData(data => {
    console.log(new TextDecoder().decode(data))
    conn.write("pong\n")
  })
})

console.log("listening on port", listener.port)

// stop accepting connections
listener.close()
```

### Exit nodes

```ts
// list available exit nodes
const nodes = network.listExitNodes()
// [{ id, hostName, dnsName, tailscaleIP, active, online }, ...]

// activate an exit node
await network.setExitNode(nodes[0].id)

// clear the exit node (route traffic directly)
await network.setExitNode()
```

### Routes & preferences

```ts
// accept subnet routes advertised by peers
await network.setAcceptRoutes(true)

// current preferences
const prefs = network.getPrefs()
// { acceptRoutes: true, exitNodeId: "..." }

// full routing table
const routes = network.getRoutes()
// [{ prefix, via, isPrimary, isExitRoute }, ...]
```

### DNS

```ts
const dns = network.getDNS()
// {
//   resolvers: string[]
//   routes: Record<string, string[]>   // split-DNS: suffix → resolvers
//   domains: string[]                  // search domains
//   extraRecords: { name, type, value }[]
//   magicDNS: boolean
// }
```

## Notes

- **WASM size.** The Tailscale WASM binary is ~35 MB. It is loaded once and cached by the browser.
- **Auth persistence.** Tailscale auth state is stored in `localStorage` (or your custom adapter) under a key prefix. Call `localStorage.clear()` or remove the prefixed keys to log out.
