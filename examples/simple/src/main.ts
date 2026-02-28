import network, { type Connection } from "tailscale-web"

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

// ── Tabs ──────────────────────────────────────────────────────────────────────

document.querySelectorAll<HTMLButtonElement>(".nav-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"))
    document.querySelectorAll<HTMLElement>(".tab-panel").forEach(p => { p.hidden = true })
    btn.classList.add("active")
    el(`tab-${btn.dataset.tab}`).hidden = false
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
}

// ── Ping ──────────────────────────────────────────────────────────────────────

el("btn-ping").addEventListener("click", async () => {
  const addr  = el<HTMLInputElement>("ping-addr").value.trim()
  const btn   = el<HTMLButtonElement>("btn-ping")
  const out   = el("ping-result")

  if (!addr) return

  btn.disabled = true
  btn.textContent = "Pinging…"
  out.hidden = true
  out.className = "ping-result"
  out.textContent = ""

  try {
    const r = await network.ping(addr)
    out.hidden = false
    if (r.alive) {
      out.classList.add("alive")
      out.textContent = `✓  reachable  ·  ${r.rttMs.toFixed(1)} ms`
    } else {
      out.classList.add("dead")
      out.textContent = "✗  not reachable"
    }
  } catch (err) {
    out.hidden = false
    out.classList.add("dead")
    out.textContent = `✗  ${err}`
  } finally {
    btn.disabled = false
    btn.textContent = "Ping"
  }
})

// ── Fetch ─────────────────────────────────────────────────────────────────────

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

    show("fetch-result")
  } catch (err) {
    showError("fetch-error", String(err))
  } finally {
    btn.disabled = false
    btn.textContent = "Send"
  }
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

// ── Go ────────────────────────────────────────────────────────────────────────

boot()
