# tailscale-web

[![npm version](https://img.shields.io/npm/v/tailscale-web.svg?style=flat-square)](https://www.npmjs.org/package/tailscale-web)
[![GitHub issues](https://img.shields.io/github/issues/adrianosela/tailscale-web.svg)](https://github.com/adrianosela/tailscale-web/issues)
[![license](https://img.shields.io/github/license/adrianosela/tailscale-web.svg)](https://github.com/adrianosela/tailscale-web/blob/master/LICENSE)
[![Go Report Card](https://goreportcard.com/badge/github.com/adrianosela/tailscale-web)](https://goreportcard.com/report/github.com/adrianosela/tailscale-web)

Run a [Tailscale](https://tailscale.com) node directly in the browser. Make HTTP requests, open TCP connections, ping hosts, and use exit nodes for networking beyond Tailscale devices — all from a web page, with no server-side proxy required.

## Install

### Node / npm

```bash
npm install tailscale-web
```

```ts
import { network } from "tailscale-web"
```

### Web (no bundler)

```html
<script type="module">
  import { network } from "https://esm.sh/tailscale-web"
</script>
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
    window.open(url, "_blank", "width=600,height=700")
  },
  onAuthComplete() {
    console.log("connected!")
  },
})

const resp = await network.fetch("http://my-server/api/data")
console.log(await resp.json())
```

State is persisted to `localStorage` automatically, so the node reconnects on the next page load without requiring login again.

## API

### `network.init(options?)`

Loads the WASM, starts the Tailscale node, and waits until it is online. Must be called before any other method.

```ts
await network.init({
  hostname?: string          // device name on the tailnet (default: "tailscale-web")
  storagePrefix?: string     // localStorage key prefix (default: "tailscale-web")
  controlUrl?: string        // custom coordination server URL
  onAuthRequired?: (url: string) => void   // called when login is needed
  onAuthComplete?: () => void              // called once authenticated
})
```

### `network.fetch(url, init?)`

Make an HTTP/HTTPS request through the tailnet. Mirrors the browser `fetch` API.

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

### `network.ping(addr)`

ICMP ping a peer and measure round-trip time. `addr` may be a hostname, Tailscale IP, or `host:port`.

```ts
const result = await network.ping("my-server")
// { alive: true, rttMs: 3.2, nodeName: "my-server", nodeIP: "100.x.x.x", ... }
```

### `network.dial(addr)`

Open a raw TCP connection through the tailnet. Returns a `Connection` object.

```ts
const conn = await network.dial("my-server:8080")

conn.onData(data => {
  console.log(new TextDecoder().decode(data))
})

conn.write("hello\n")
conn.close()
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

### Custom storage

By default state is stored in `localStorage`. Pass a custom adapter before calling `init()` to use a different backend:

```ts
network.setStorage({
  get: key => sessionStorage.getItem(key),
  set: (key, val) => sessionStorage.setItem(key, val),
})

await network.init({ ... })
```

Pass `null` to revert to `localStorage`.

## Notes

- **WASM size.** The Tailscale WASM binary is ~35 MB. It is loaded once and cached by the browser.
- **Auth persistence.** Tailscale auth state is stored in `localStorage` (or your custom adapter) under a key prefix. Call `localStorage.clear()` or remove the prefixed keys to log out.
