import { network, type Connection, type PingResult } from "tailscale-web"

// ── Theme ─────────────────────────────────────────────────────────────────────

function getTheme(): "light" | "dark" {
  return (localStorage.getItem("theme") as "light" | "dark") ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
}

function applyTheme(t: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", t)
  localStorage.setItem("theme", t)
  el<HTMLImageElement>("ts-logo").classList.toggle("invert", t === "dark")
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function show(id: string)   { el(id).hidden = false }
function hide(id: string)   { el(id).hidden = true  }
function text(id: string, t: string) { el(id).textContent = t }

const _flashTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>()
function flashButton(btn: HTMLButtonElement, msg: string, original: string, ms = 1400) {
  clearTimeout(_flashTimers.get(btn))
  btn.textContent = msg
  btn.classList.add("btn-flash")
  _flashTimers.set(btn, setTimeout(() => {
    btn.textContent = original
    btn.classList.remove("btn-flash")
  }, ms))
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const tabRenderers: Record<string, (() => void) | undefined> = {}

document.querySelectorAll<HTMLButtonElement>(".nav-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"))
    document.querySelectorAll<HTMLElement>(".tab-panel").forEach(p => { p.hidden = true })
    btn.classList.add("active")
    const tab = btn.dataset.tab!
    el(`tab-${tab}`).hidden = false
    tabRenderers[tab]?.()
    delete tabRenderers[tab]  // run once on first open; Refresh button handles subsequent
  })
})

// ── Auth flow ─────────────────────────────────────────────────────────────────

let authUrl: string | null = null

function showError(id: string, msg: string) {
  const e = el(id)
  e.textContent = msg
  e.hidden = false
}

async function boot() {
  applyTheme(getTheme())

  try {
    await network.init({
      hostname: "tailscale-web-playground",
      onAuthRequired(url) {
        authUrl = url
        hide("login-status")
        show("btn-auth")
      },
      onAuthComplete() {
        authUrl = null
      },
    })
    showApp()
  } catch (err) {
    showError("error-login", String(err))
  }
}

el("btn-auth").addEventListener("click", () => {
  if (authUrl) window.open(authUrl, "_blank", "width=600,height=700")
})

el("btn-disconnect").addEventListener("click", () => {
  localStorage.clear()
  location.reload()
})

el("btn-theme").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"
  applyTheme(next)
})

function showApp() {
  hide("screen-login")
  show("screen-app")
  tabRenderers["routes"] = renderRoutes
  tabRenderers["dns"]    = renderDNS
}

// ── Ping ──────────────────────────────────────────────────────────────────────

let pinging = false

function updatePingStats(sent: number, rtts: number[], lost: number) {
  const stats = el("ping-stats")
  const recv  = sent - lost
  const loss  = sent > 0 ? Math.round((lost / sent) * 100) : 0
  let s = `${sent} transmitted, ${recv} received, ${loss}% packet loss`
  if (rtts.length > 0) {
    const min = Math.min(...rtts).toFixed(3)
    const avg = (rtts.reduce((a, b) => a + b, 0) / rtts.length).toFixed(3)
    const max = Math.max(...rtts).toFixed(3)
    s += `\nrtt min/avg/max = ${min}/${avg}/${max} ms`
  }
  stats.textContent = s
  stats.hidden = false
}

el("btn-ping").addEventListener("click", async () => {
  const btn  = el<HTMLButtonElement>("btn-ping")
  const out  = el("ping-output")

  // Toggle stop if already pinging.
  if (pinging) {
    pinging = false
    return
  }

  const addr = el<HTMLInputElement>("ping-addr").value.trim()
  if (!addr) return

  pinging = true
  btn.textContent = "Stop"
  out.innerHTML = ""
  out.hidden = false
  el("ping-stats").hidden = true

  let seq  = 0
  let rtts: number[] = []
  let lost = 0

  appendLine("ping-output", "line-meta", `PING ${addr}`)

  while (pinging) {
    seq++
    let r: PingResult | undefined
    try {
      r = await network.ping(addr)
    } catch (err) {
      lost++
      appendLine("ping-output", "line-err", `icmp_seq=${seq}  error: ${err}`)
      updatePingStats(seq, rtts, lost)
      await new Promise(res => setTimeout(res, 1000))
      continue
    }

    if (!pinging) break

    if (r.alive) {
      rtts.push(r.rttMs)
      const via = r.derpRegionCode
        ? `via DERP(${r.derpRegionCode})`
        : r.endpoint ? "direct" : ""
      const parts = [
        `icmp_seq=${seq}`,
        `time=${r.rttMs.toFixed(3)} ms`,
        via,
        r.endpoint   ? `endpoint=${r.endpoint}`   : "",
        r.nodeName   ? `node=${r.nodeName}`        : "",
        r.nodeIP     ? `ip=${r.nodeIP}`            : "",
      ].filter(Boolean).join("  ")
      appendLine("ping-output", "line-ok", parts)
    } else {
      lost++
      const reason = r.err ? ` (${r.err})` : ""
      appendLine("ping-output", "line-err", `icmp_seq=${seq}  timeout${reason}`)
    }

    updatePingStats(seq, rtts, lost)
    if (pinging) await new Promise(res => setTimeout(res, 1000))
  }

  appendLine("ping-output", "line-meta", `--- ${addr} ping statistics ---`)
  updatePingStats(seq, rtts, lost)
  btn.textContent = "Ping"
})

// ── Fetch ─────────────────────────────────────────────────────────────────────

let fetchHtmlBody = ""

el("btn-fetch").addEventListener("click", async () => {
  const url    = el<HTMLInputElement>("fetch-url").value.trim()
  const method = el<HTMLSelectElement>("fetch-method").value
  const hdrsRaw = el<HTMLTextAreaElement>("fetch-headers").value.trim()
  const body   = el<HTMLTextAreaElement>("fetch-body").value

  if (!url) return

  const btn = el<HTMLButtonElement>("btn-fetch")
  btn.disabled = true
  btn.textContent = "Sending…"
  hide("fetch-result")

  try {
    const headers: Record<string, string> = {}
    for (const line of hdrsRaw.split("\n")) {
      const i = line.indexOf(":")
      if (i > 0) headers[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }

    const resp = await network.fetch(url, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body: body || undefined,
    })

    // status chip
    const chip = el("fetch-status")
    chip.textContent = String(resp.status)
    chip.className   = `status-chip ${resp.ok ? "ok" : "err"}`
    text("fetch-status-text", resp.statusText)

    // headers
    const hLines = Object.entries(resp.headers).map(([k, v]) => `${k}: ${v}`).join("\n")
    text("fetch-headers-out", hLines)

    // body
    const bodyText = await resp.text()
    try {
      text("fetch-body-out", JSON.stringify(JSON.parse(bodyText), null, 2))
    } catch {
      text("fetch-body-out", bodyText)
    }

    // HTML preview toggle
    const contentType = Object.entries(resp.headers)
      .find(([k]) => k.toLowerCase() === "content-type")?.[1]?.toLowerCase() ?? ""
    const previewFrame = el<HTMLIFrameElement>("fetch-preview")
    previewFrame.hidden = true
    el("fetch-body-out").hidden = false
    if (contentType.includes("text/html")) {
      fetchHtmlBody = bodyText
      el("fetch-view-toggle").hidden = false
      el("btn-view-raw").classList.add("btn-primary")
      el("btn-view-preview").classList.remove("btn-primary")
    } else {
      fetchHtmlBody = ""
      el("fetch-view-toggle").hidden = true
    }

    show("fetch-result")
  } catch (err) {
    showError("fetch-error", String(err))
  } finally {
    btn.disabled = false
    btn.textContent = "Send"
  }
})

el("btn-view-raw").addEventListener("click", () => {
  const frame = el<HTMLIFrameElement>("fetch-preview")
  if (frame.src.startsWith("blob:")) {
    URL.revokeObjectURL(frame.src)
    frame.removeAttribute("src")
  }
  el("fetch-body-out").hidden = false
  frame.hidden = true
  el("btn-view-raw").classList.add("btn-primary")
  el("btn-view-preview").classList.remove("btn-primary")
})

el("btn-view-preview").addEventListener("click", () => {
  const frame = el<HTMLIFrameElement>("fetch-preview")
  if (frame.src.startsWith("blob:")) URL.revokeObjectURL(frame.src)

  // Inject <base href> so relative resources resolve against the fetched URL
  const baseUrl = el<HTMLInputElement>("fetch-url").value.trim()
  let html = fetchHtmlBody
  if (!/<base\b/i.test(html)) {
    html = /<head\b/i.test(html)
      ? html.replace(/(<head[^>]*>)/i, `$1<base href="${baseUrl}">`)
      : `<base href="${baseUrl}">` + html
  }

  // Use a Blob URL — avoids srcdoc attribute escaping entirely
  const blob = new Blob([html], { type: "text/html" })
  frame.src = URL.createObjectURL(blob)
  el("fetch-body-out").hidden = true
  frame.hidden = false
  el("btn-view-raw").classList.remove("btn-primary")
  el("btn-view-preview").classList.add("btn-primary")
})

// ── Dial ──────────────────────────────────────────────────────────────────────

let activeConn: Connection | null = null

function appendLine(id: string, cls: string, msg: string) {
  const out  = el(id)
  const line = document.createElement("span")
  line.className = cls
  line.textContent = msg + "\n"
  out.appendChild(line)
  out.scrollTop = out.scrollHeight
}

el("btn-dial-connect").addEventListener("click", async () => {
  const addr = el<HTMLInputElement>("dial-addr").value.trim()
  const btn  = el<HTMLButtonElement>("btn-dial-connect")
  if (!addr) return

  btn.disabled = true
  btn.textContent = "Connecting…"

  try {
    const conn = await network.dial(addr)
    activeConn = conn

    conn.onData(data => {
      appendLine("dial-output", "line-recv", new TextDecoder().decode(data))
    })

    text("dial-connected-addr", addr)
    el("dial-output").textContent = ""
    appendLine("dial-output", "line-meta", `connected to ${addr}`)

    hide("dial-connect-form")
    show("dial-session")
    el<HTMLInputElement>("dial-send-input").focus()
  } catch (err) {
    showError("dial-error", String(err))
  } finally {
    btn.disabled = false
    btn.textContent = "Connect"
  }
})

function dialSend() {
  const input = el<HTMLInputElement>("dial-send-input")
  const msg   = input.value
  if (!msg || !activeConn) return
  activeConn.write(msg + "\n")
  appendLine("dial-output", "line-sent", msg)
  input.value = ""
}

el("btn-dial-send").addEventListener("click", dialSend)
el("dial-send-input").addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") dialSend()
})

el("btn-dial-disconnect").addEventListener("click", () => {
  activeConn?.close()
  activeConn = null
  appendLine("dial-output", "line-meta", "disconnected")
  hide("dial-session")
  show("dial-connect-form")
})

// ── Exit node selector ────────────────────────────────────────────────────────

function populateExitNodeSelect() {
  const select  = el<HTMLSelectElement>("exit-node-select")
  const current = network.getPrefs().exitNodeId
  const nodes   = network.listExitNodes()

  select.innerHTML = ""

  const none = document.createElement("option")
  none.value       = ""
  none.textContent = "(none — direct connection)"
  select.appendChild(none)

  for (const n of nodes) {
    const opt = document.createElement("option")
    opt.value       = n.id
    opt.textContent = `${n.hostName || n.dnsName}${n.online ? "" : " (offline)"}`
    if (!n.online) opt.style.color = "var(--text-muted)"
    select.appendChild(opt)
  }

  select.value = current
}

el("btn-exit-node-set").addEventListener("click", async () => {
  const select = el<HTMLSelectElement>("exit-node-select")
  const btn    = el<HTMLButtonElement>("btn-exit-node-set")
  const errEl  = el("exit-node-error")
  errEl.hidden = true
  btn.disabled = true
  btn.textContent = "Saving…"
  try {
    await network.setExitNode(select.value)
    populateExitNodeSelect()
    btn.disabled = false
    flashButton(btn, "Saved!", "Set")
  } catch (err) {
    showError("exit-node-error", String(err))
    btn.disabled = false
    btn.textContent = "Set"
  }
})

el("btn-exit-node-clear").addEventListener("click", async () => {
  const btn   = el<HTMLButtonElement>("btn-exit-node-clear")
  const errEl = el("exit-node-error")
  errEl.hidden = true
  btn.disabled = true
  btn.textContent = "Clearing…"
  try {
    await network.setExitNode("")
    populateExitNodeSelect()
    btn.disabled = false
    flashButton(btn, "Cleared!", "Clear")
  } catch (err) {
    showError("exit-node-error", String(err))
    btn.disabled = false
    btn.textContent = "Clear"
  }
})

// ── Routes ────────────────────────────────────────────────────────────────────

type SortCol = "prefix" | "via" | "type" | "status"
let routesSortCol: SortCol = "prefix"
let routesSortDir: "asc" | "desc" = "asc"

function renderRoutes() {
  populateExitNodeSelect()
  const routes = network.getRoutes()
  const body   = el("routes-body")
  const table  = el("routes-table")
  const empty  = el("routes-empty")
  const count  = el("routes-count")

  body.innerHTML = ""

  if (routes.length === 0) {
    table.hidden = true
    empty.hidden = false
    count.textContent = ""
    return
  }

  const sorted = [...routes].sort((a, b) => {
    let ka: string | number, kb: string | number
    switch (routesSortCol) {
      case "prefix": ka = a.prefix;                         kb = b.prefix;                         break
      case "via":    ka = a.via;                            kb = b.via;                            break
      case "type":   ka = a.isExitRoute ? "exit" : "route"; kb = b.isExitRoute ? "exit" : "route"; break
      case "status": ka = a.isPrimary ? 0 : 1;              kb = b.isPrimary ? 0 : 1;              break
    }
    const cmp = ka < kb ? -1 : ka > kb ? 1 : 0
    return routesSortDir === "asc" ? cmp : -cmp
  })

  for (const r of sorted) {
    const tr = document.createElement("tr")

    const tdPrefix = document.createElement("td")
    tdPrefix.textContent = r.prefix
    tr.appendChild(tdPrefix)

    const tdVia = document.createElement("td")
    const viaTag = document.createElement("span")
    viaTag.className = r.via === "self" ? "tag tag-self" : "tag tag-peer"
    viaTag.textContent = r.via
    tdVia.appendChild(viaTag)
    tr.appendChild(tdVia)

    const tdType = document.createElement("td")
    if (r.isExitRoute) {
      const t = document.createElement("span")
      t.className = "tag tag-exit"
      t.textContent = "exit"
      tdType.appendChild(t)
    } else {
      tdType.textContent = "route"
      tdType.style.color = "var(--text-muted)"
    }
    tr.appendChild(tdType)

    const tdStatus = document.createElement("td")
    const dot = document.createElement("span")
    dot.className = r.isPrimary
      ? "status-dot status-dot-active"
      : "status-dot status-dot-inactive"
    tdStatus.appendChild(dot)
    tr.appendChild(tdStatus)

    body.appendChild(tr)
  }

  // Update sort indicators on headers
  document.querySelectorAll<HTMLElement>("#routes-table th[data-col]").forEach(th => {
    th.classList.remove("sort-asc", "sort-desc")
    if (th.dataset.col === routesSortCol) {
      th.classList.add(routesSortDir === "asc" ? "sort-asc" : "sort-desc")
    }
  })

  table.hidden = false
  empty.hidden = true
  count.textContent = `${routes.length} route${routes.length !== 1 ? "s" : ""}`
}

el("btn-routes-refresh").addEventListener("click", () => {
  renderRoutes()
  flashButton(el<HTMLButtonElement>("btn-routes-refresh"), "Updated!", "Refresh")
})

document.querySelectorAll<HTMLElement>("#routes-table th[data-col]").forEach(th => {
  th.addEventListener("click", () => {
    const col = th.dataset.col as SortCol
    if (routesSortCol === col) {
      routesSortDir = routesSortDir === "asc" ? "desc" : "asc"
    } else {
      routesSortCol = col
      routesSortDir = "asc"
    }
    renderRoutes()
  })
})

// ── DNS ───────────────────────────────────────────────────────────────────────

function renderDNS() {
  const d       = network.getDNS()
  const content = el("dns-content")
  const empty   = el("dns-empty")
  const badge   = el("dns-magic-badge")

  badge.textContent = d.magicDNS ? "MagicDNS enabled" : "MagicDNS disabled"

  const hasAnything = d.resolvers.length > 0 ||
    Object.keys(d.routes).length > 0 ||
    d.domains.length > 0 ||
    d.extraRecords.length > 0

  if (!hasAnything) {
    content.hidden = true
    empty.hidden = false
    return
  }
  content.hidden = false
  empty.hidden = true

  // Resolvers
  const resolversSection = el("dns-resolvers-section")
  const resolversBody    = el("dns-resolvers-body")
  resolversBody.innerHTML = ""
  if (d.resolvers.length > 0) {
    for (const r of d.resolvers) {
      const tr = document.createElement("tr")
      const td = document.createElement("td")
      td.textContent = r
      tr.appendChild(td)
      resolversBody.appendChild(tr)
    }
    resolversSection.hidden = false
  } else {
    resolversSection.hidden = true
  }

  // Split DNS routes
  const routesSection = el("dns-routes-section")
  const routesBody    = el("dns-routes-body")
  routesBody.innerHTML = ""
  const suffixes = Object.keys(d.routes).sort()
  if (suffixes.length > 0) {
    for (const suffix of suffixes) {
      const tr    = document.createElement("tr")
      const tdSuf = document.createElement("td")
      tdSuf.textContent = suffix
      const tdRes = document.createElement("td")
      tdRes.textContent = (d.routes[suffix] ?? []).join(", ") || "(MagicDNS)"
      tr.appendChild(tdSuf)
      tr.appendChild(tdRes)
      routesBody.appendChild(tr)
    }
    routesSection.hidden = false
  } else {
    routesSection.hidden = true
  }

  // Search domains
  const domainsSection = el("dns-domains-section")
  const domainsBody    = el("dns-domains-body")
  domainsBody.innerHTML = ""
  if (d.domains.length > 0) {
    for (const dom of d.domains) {
      const tr = document.createElement("tr")
      const td = document.createElement("td")
      td.textContent = dom
      tr.appendChild(td)
      domainsBody.appendChild(tr)
    }
    domainsSection.hidden = false
  } else {
    domainsSection.hidden = true
  }

  // Extra records
  const recordsSection = el("dns-records-section")
  const recordsBody    = el("dns-records-body")
  recordsBody.innerHTML = ""
  if (d.extraRecords.length > 0) {
    for (const rec of d.extraRecords) {
      const tr = document.createElement("tr")
      ;[rec.name, rec.type, rec.value].forEach(v => {
        const td = document.createElement("td")
        td.textContent = v
        tr.appendChild(td)
      })
      recordsBody.appendChild(tr)
    }
    recordsSection.hidden = false
  } else {
    recordsSection.hidden = true
  }
}

el("btn-dns-refresh").addEventListener("click", () => {
  renderDNS()
  flashButton(el<HTMLButtonElement>("btn-dns-refresh"), "Updated!", "Refresh")
})

// ── Go ────────────────────────────────────────────────────────────────────────

boot()
