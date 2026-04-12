import { network, type Connection, type Listener, type PingResult } from "tailscale-web";
import src from "./main.ts?raw";

// ── Theme ─────────────────────────────────────────────────────────────────────

function getTheme(): "light" | "dark" {
  return (
    (localStorage.getItem("theme") as "light" | "dark") ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}

function applyTheme(t: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
  el<HTMLImageElement>("ts-logo").classList.toggle("invert", t === "dark");
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function show(id: string) {
  el(id).hidden = false;
}
function hide(id: string) {
  el(id).hidden = true;
}
function text(id: string, t: string) {
  el(id).textContent = t;
}

const _flashTimers = new WeakMap<
  HTMLButtonElement,
  ReturnType<typeof setTimeout>
>();
function flashButton(
  btn: HTMLButtonElement,
  msg: string,
  original: string,
  ms = 1400,
) {
  clearTimeout(_flashTimers.get(btn));
  btn.textContent = msg;
  btn.classList.add("btn-flash");
  _flashTimers.set(
    btn,
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("btn-flash");
    }, ms),
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const tabRenderers: Record<string, (() => void) | undefined> = {};
let activeTab = "ping";

document.querySelectorAll<HTMLButtonElement>(".nav-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-tab")
      .forEach((b) => b.classList.remove("active"));
    document.querySelectorAll<HTMLElement>(".tab-panel").forEach((p) => {
      p.hidden = true;
    });
    btn.classList.add("active");
    const tab = btn.dataset.tab!;
    activeTab = tab;
    el(`tab-${tab}`).hidden = false;
    tabRenderers[tab]?.();
    delete tabRenderers[tab]; // run once on first open; Refresh button handles subsequent
  });
});

// ── Auth flow ─────────────────────────────────────────────────────────────────

let authUrl: string | null = null;

function showError(id: string, msg: string) {
  const e = el(id);
  e.textContent = msg;
  e.hidden = false;
}

async function boot() {
  applyTheme(getTheme());

  try {
    await network.init({
      hostname: "tailscale-web-playground",
      onAuthRequired(url) {
        authUrl = url;
        hide("login-status");
        show("btn-auth");
      },
      onAuthComplete() {
        authUrl = null;
      },
    });
    showApp();
    await autoRestoreExitNode();
  } catch (err) {
    showError("error-login", String(err));
  }
}

el("btn-auth").addEventListener("click", () => {
  if (authUrl) window.open(authUrl, "_blank", "width=600,height=700");
});

el("btn-disconnect").addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

el("btn-theme").addEventListener("click", () => {
  const next =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";
  applyTheme(next);
});

const LS_EXIT_NODE = "ts-exit-node-id";

async function autoRestoreExitNode() {
  const stored = localStorage.getItem(LS_EXIT_NODE);
  if (!stored) return;
  const node = network.listExitNodes().find((n) => n.id === stored);
  if (!node) return;
  try {
    await network.setExitNode(stored);
    populateExitNodeSelect();
    updateExitNodeIndicator();
  } catch {
    /* ignore */
  }
}

function updateExitNodeIndicator() {
  const { exitNodeId } = network.getPrefs();
  let name = "<none>";
  if (exitNodeId) {
    const node = network.listExitNodes().find((n) => n.id === exitNodeId);
    name = node ? node.hostName || node.dnsName : exitNodeId;
  }
  el("exit-node-name").textContent = name;
}

function showApp() {
  hide("screen-login");
  show("screen-app");
  updateExitNodeIndicator();

  const v4 = network.localIPv4();
  const v6 = network.localIPv6();
  if (v4) text("vpn-ipv4", v4);
  if (v6) text("vpn-ipv6", v6);
  if (v4 || v6) show("vpn-addrs");

  tabRenderers["routes"] = renderRoutes;
  tabRenderers["dns"] = renderDNS;
}

// ── Ping ──────────────────────────────────────────────────────────────────────

let pinging = false;

function updatePingStats(sent: number, rtts: number[], lost: number) {
  const stats = el("ping-stats");
  const recv = sent - lost;
  const loss = sent > 0 ? Math.round((lost / sent) * 100) : 0;
  let s = `${sent} transmitted, ${recv} received, ${loss}% packet loss`;
  if (rtts.length > 0) {
    const min = Math.min(...rtts).toFixed(3);
    const avg = (rtts.reduce((a, b) => a + b, 0) / rtts.length).toFixed(3);
    const max = Math.max(...rtts).toFixed(3);
    s += `\nrtt min/avg/max = ${min}/${avg}/${max} ms`;
  }
  stats.textContent = s;
  stats.hidden = false;
}

el("btn-ping").addEventListener("click", async () => {
  const btn = el<HTMLButtonElement>("btn-ping");
  const out = el("ping-output");

  // Toggle stop if already pinging.
  if (pinging) {
    pinging = false;
    return;
  }

  const addr = el<HTMLInputElement>("ping-addr").value.trim();
  if (!addr) return;

  pinging = true;
  btn.textContent = "Stop";
  out.innerHTML = "";
  out.hidden = false;
  el("ping-stats").hidden = true;

  let seq = 0;
  let rtts: number[] = [];
  let lost = 0;

  appendLine("ping-output", "line-meta", `PING ${addr}`);

  while (pinging) {
    seq++;
    let r: PingResult | undefined;
    try {
      r = await network.ping(addr);
    } catch (err) {
      lost++;
      appendLine("ping-output", "line-err", `icmp_seq=${seq}  error: ${err}`);
      updatePingStats(seq, rtts, lost);
      await new Promise((res) => setTimeout(res, 1000));
      continue;
    }

    if (!pinging) break;

    if (r.alive) {
      rtts.push(r.rttMs);
      const via = r.derpRegionCode
        ? `via DERP(${r.derpRegionCode})`
        : r.endpoint
          ? "direct"
          : "";
      const parts = [
        `icmp_seq=${seq}`,
        `time=${r.rttMs.toFixed(3)} ms`,
        via,
        r.endpoint ? `endpoint=${r.endpoint}` : "",
        r.nodeName ? `node=${r.nodeName}` : "",
        r.nodeIP ? `ip=${r.nodeIP}` : "",
      ]
        .filter(Boolean)
        .join("  ");
      appendLine("ping-output", "line-ok", parts);
    } else {
      lost++;
      const reason = r.err ? ` (${r.err})` : "";
      appendLine(
        "ping-output",
        "line-err",
        `icmp_seq=${seq}  timeout${reason}`,
      );
    }

    updatePingStats(seq, rtts, lost);
    if (pinging) await new Promise((res) => setTimeout(res, 1000));
  }

  appendLine("ping-output", "line-meta", `--- ${addr} ping statistics ---`);
  updatePingStats(seq, rtts, lost);
  btn.textContent = "Ping";
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

let fetchHtmlBody = "";

el("btn-fetch").addEventListener("click", async () => {
  const url = el<HTMLInputElement>("fetch-url").value.trim();
  const method = el<HTMLSelectElement>("fetch-method").value;
  const hdrsRaw = el<HTMLTextAreaElement>("fetch-headers").value.trim();
  const body = el<HTMLTextAreaElement>("fetch-body").value;

  if (!url) return;

  const btn = el<HTMLButtonElement>("btn-fetch");
  btn.disabled = true;
  btn.textContent = "Sending…";
  hide("fetch-result");

  try {
    const headers: Record<string, string> = {};
    for (const line of hdrsRaw.split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }

    const resp = await network.fetch(url, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body: body || undefined,
    });

    // status chip
    const chip = el("fetch-status");
    chip.textContent = String(resp.status);
    chip.className = `status-chip ${resp.ok ? "ok" : "err"}`;
    text("fetch-status-text", resp.statusText);

    // headers
    const hLines = Object.entries(resp.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    text("fetch-headers-out", hLines);

    // body
    const bodyText = await resp.text();
    try {
      text("fetch-body-out", JSON.stringify(JSON.parse(bodyText), null, 2));
    } catch {
      text("fetch-body-out", bodyText);
    }

    // HTML preview toggle
    const contentType =
      Object.entries(resp.headers)
        .find(([k]) => k.toLowerCase() === "content-type")?.[1]
        ?.toLowerCase() ?? "";
    const previewFrame = el<HTMLIFrameElement>("fetch-preview");
    previewFrame.hidden = true;
    el("fetch-body-out").hidden = false;
    if (contentType.includes("text/html")) {
      fetchHtmlBody = bodyText;
      el("fetch-view-toggle").hidden = false;
      el("btn-view-raw").classList.add("btn-primary");
      el("btn-view-preview").classList.remove("btn-primary");
    } else {
      fetchHtmlBody = "";
      el("fetch-view-toggle").hidden = true;
    }

    show("fetch-result");
  } catch (err) {
    showError("fetch-error", String(err));
  } finally {
    btn.disabled = false;
    btn.textContent = "Send";
  }
});

el("btn-view-raw").addEventListener("click", () => {
  const frame = el<HTMLIFrameElement>("fetch-preview");
  if (frame.src.startsWith("blob:")) {
    URL.revokeObjectURL(frame.src);
    frame.removeAttribute("src");
  }
  el("fetch-body-out").hidden = false;
  frame.hidden = true;
  el("btn-view-raw").classList.add("btn-primary");
  el("btn-view-preview").classList.remove("btn-primary");
});

el("btn-view-preview").addEventListener("click", () => {
  const frame = el<HTMLIFrameElement>("fetch-preview");
  if (frame.src.startsWith("blob:")) URL.revokeObjectURL(frame.src);

  // Inject <base href> so relative resources resolve against the fetched URL
  const baseUrl = el<HTMLInputElement>("fetch-url").value.trim();
  let html = fetchHtmlBody;
  if (!/<base\b/i.test(html)) {
    html = /<head\b/i.test(html)
      ? html.replace(/(<head[^>]*>)/i, `$1<base href="${baseUrl}">`)
      : `<base href="${baseUrl}">` + html;
  }

  // Use a Blob URL — avoids srcdoc attribute escaping entirely
  const blob = new Blob([html], { type: "text/html" });
  frame.src = URL.createObjectURL(blob);
  el("fetch-body-out").hidden = true;
  frame.hidden = false;
  el("btn-view-raw").classList.remove("btn-primary");
  el("btn-view-preview").classList.add("btn-primary");
});

// ── Dial ──────────────────────────────────────────────────────────────────────

let activeConn: Connection | null = null;

function appendLine(id: string, cls: string, msg: string) {
  const out = el(id);
  const line = document.createElement("span");
  line.className = cls;
  line.textContent = msg + "\n";
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

el("btn-dial-connect").addEventListener("click", async () => {
  const addr = el<HTMLInputElement>("dial-addr").value.trim();
  const btn = el<HTMLButtonElement>("btn-dial-connect");
  if (!addr) return;

  btn.disabled = true;
  btn.textContent = "Connecting…";

  try {
    const conn = await network.dialTCP(addr);
    activeConn = conn;

    conn.onData((data) => {
      appendLine("dial-output", "line-recv", new TextDecoder().decode(data));
    });

    text("dial-connected-addr", addr);
    el("dial-output").textContent = "";
    appendLine("dial-output", "line-meta", `connected to ${addr}`);

    hide("dial-connect-form");
    show("dial-session");
    el<HTMLInputElement>("dial-send-input").focus();
  } catch (err) {
    showError("dial-error", String(err));
  } finally {
    btn.disabled = false;
    btn.textContent = "Connect";
  }
});

function dialSend() {
  const input = el<HTMLInputElement>("dial-send-input");
  const msg = input.value;
  if (!msg || !activeConn) return;
  activeConn.write(msg + "\n");
  appendLine("dial-output", "line-sent", msg);
  input.value = "";
}

el("btn-dial-send").addEventListener("click", dialSend);
el("dial-send-input").addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") dialSend();
});

el("btn-dial-disconnect").addEventListener("click", () => {
  activeConn?.close();
  activeConn = null;
  appendLine("dial-output", "line-meta", "disconnected");
  hide("dial-session");
  show("dial-connect-form");
});

// ── Listen ────────────────────────────────────────────────────────────────────

let activeListener: Listener | null = null;
let listenConnCount = 0;

el("btn-listen-start").addEventListener("click", async () => {
  const portInput = el<HTMLInputElement>("listen-port");
  const btn = el<HTMLButtonElement>("btn-listen-start");
  const port = parseInt(portInput.value || "0", 10);

  hide("listen-error");
  btn.disabled = true;
  btn.textContent = "Listening…";

  try {
    const listener = await network.listenTCP(port, (conn: Connection) => {
      listenConnCount++;
      const connId = listenConnCount;
      appendLine("listen-output", "line-ok", `→ connection #${connId} accepted`);

      conn.onData((data) => {
        const text = new TextDecoder().decode(data);
        appendLine("listen-output", "line-recv", `  [#${connId}] ${text.trimEnd()}`);
      });
    });

    activeListener = listener;
    listenConnCount = 0;

    el("listen-output").textContent = "";
    text("listen-assigned-port", String(listener.port));
    appendLine("listen-output", "line-meta", `listening on port ${listener.port}…`);

    hide("listen-form");
    show("listen-session");
  } catch (err) {
    showError("listen-error", String(err));
    btn.disabled = false;
    btn.textContent = "Listen";
  }
});

el("btn-listen-stop").addEventListener("click", () => {
  activeListener?.close();
  activeListener = null;
  appendLine("listen-output", "line-meta", "listener stopped");
  hide("listen-session");
  show("listen-form");
  el<HTMLButtonElement>("btn-listen-start").disabled = false;
  el<HTMLButtonElement>("btn-listen-start").textContent = "Listen";
});

// ── Serve HTTP ────────────────────────────────────────────────────────────────

let serveListener: Listener | null = null;
let serveReqCount = 0;

el("btn-serve-start").addEventListener("click", async () => {
  const btn = el<HTMLButtonElement>("btn-serve-start");
  const port = parseInt(el<HTMLInputElement>("serve-port").value || "0", 10);

  hide("serve-error");
  btn.disabled = true;
  btn.textContent = "Starting…";

  try {
    const listener = await network.listenTCP(port, (conn: Connection) => {
      serveReqCount++;
      const reqId = serveReqCount;
      let buf = "";

      conn.onData((data) => {
        buf += new TextDecoder().decode(data);
        if (!buf.includes("\r\n\r\n")) return;

        // Parse request line for logging.
        const reqLine = buf.split("\r\n")[0] ?? "";
        appendLine("serve-output", "line-ok", `→ [#${reqId}] ${reqLine}`);

        // Build response.
        const body = el<HTMLTextAreaElement>("serve-html").value;
        const bodyBytes = new TextEncoder().encode(body);
        const response =
          "HTTP/1.1 200 OK\r\n" +
          "Content-Type: text/html; charset=utf-8\r\n" +
          `Content-Length: ${bodyBytes.length}\r\n` +
          "Connection: close\r\n" +
          "\r\n" +
          body;

        conn.write(response);
        conn.close();
        appendLine("serve-output", "line-meta", `  [#${reqId}] 200 OK — ${bodyBytes.length} bytes`);
      });
    });

    serveListener = listener;
    serveReqCount = 0;

    el("serve-output").textContent = "";
    text("serve-assigned-port", String(listener.port));
    appendLine("serve-output", "line-meta", `listening on port ${listener.port}…`);

    hide("serve-form");
    show("serve-session");
  } catch (err) {
    showError("serve-error", String(err));
    btn.disabled = false;
    btn.textContent = "Serve";
  }
});

el("btn-serve-stop").addEventListener("click", () => {
  serveListener?.close();
  serveListener = null;
  appendLine("serve-output", "line-meta", "server stopped");
  hide("serve-session");
  show("serve-form");
  el<HTMLButtonElement>("btn-serve-start").disabled = false;
  el<HTMLButtonElement>("btn-serve-start").textContent = "Serve";
});

// ── Exit node selector ────────────────────────────────────────────────────────

function populateExitNodeSelect() {
  const select = el<HTMLSelectElement>("exit-node-select");
  const current = network.getPrefs().exitNodeId;
  const nodes = network.listExitNodes();

  select.innerHTML = "";

  const none = document.createElement("option");
  none.value = "";
  none.textContent = "(none — direct connection)";
  select.appendChild(none);

  for (const n of nodes) {
    const opt = document.createElement("option");
    opt.value = n.id;
    opt.textContent = `${n.hostName || n.dnsName}${n.online ? "" : " (offline)"}`;
    if (!n.online) opt.style.color = "var(--text-muted)";
    select.appendChild(opt);
  }

  select.value = current;
}

el("btn-exit-node-set").addEventListener("click", async () => {
  const select = el<HTMLSelectElement>("exit-node-select");
  const btn = el<HTMLButtonElement>("btn-exit-node-set");
  const errEl = el("exit-node-error");
  errEl.hidden = true;
  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    await network.setExitNode(select.value);
    if (select.value) localStorage.setItem(LS_EXIT_NODE, select.value);
    else localStorage.removeItem(LS_EXIT_NODE);
    populateExitNodeSelect();
    updateExitNodeIndicator();
    btn.disabled = false;
    flashButton(btn, "Saved!", "Set");
  } catch (err) {
    showError("exit-node-error", String(err));
    btn.disabled = false;
    btn.textContent = "Set";
  }
});

el("btn-exit-node-clear").addEventListener("click", async () => {
  const btn = el<HTMLButtonElement>("btn-exit-node-clear");
  const errEl = el("exit-node-error");
  errEl.hidden = true;
  btn.disabled = true;
  btn.textContent = "Clearing…";
  try {
    await network.setExitNode("");
    localStorage.removeItem(LS_EXIT_NODE);
    populateExitNodeSelect();
    updateExitNodeIndicator();
    btn.disabled = false;
    flashButton(btn, "Cleared!", "Clear");
  } catch (err) {
    showError("exit-node-error", String(err));
    btn.disabled = false;
    btn.textContent = "Clear";
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────

type SortCol = "prefix" | "via" | "type" | "status";
let routesSortCol: SortCol = "prefix";
let routesSortDir: "asc" | "desc" = "asc";

function renderRoutes() {
  populateExitNodeSelect();
  const routes = network.getRoutes();
  const body = el("routes-body");
  const table = el("routes-table");
  const empty = el("routes-empty");
  const count = el("routes-count");

  body.innerHTML = "";

  if (routes.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    count.textContent = "";
    return;
  }

  const sorted = [...routes].sort((a, b) => {
    let ka: string | number, kb: string | number;
    switch (routesSortCol) {
      case "prefix":
        ka = a.prefix;
        kb = b.prefix;
        break;
      case "via":
        ka = a.via;
        kb = b.via;
        break;
      case "type":
        ka = a.isExitRoute ? "exit" : "route";
        kb = b.isExitRoute ? "exit" : "route";
        break;
      case "status":
        ka = a.isPrimary ? 0 : 1;
        kb = b.isPrimary ? 0 : 1;
        break;
    }
    const cmp = ka < kb ? -1 : ka > kb ? 1 : 0;
    return routesSortDir === "asc" ? cmp : -cmp;
  });

  for (const r of sorted) {
    const tr = document.createElement("tr");

    const tdPrefix = document.createElement("td");
    tdPrefix.textContent = r.prefix;
    tr.appendChild(tdPrefix);

    const tdVia = document.createElement("td");
    const viaTag = document.createElement("span");
    viaTag.className = r.via === "self" ? "tag tag-self" : "tag tag-peer";
    viaTag.textContent = r.via;
    tdVia.appendChild(viaTag);
    tr.appendChild(tdVia);

    const tdType = document.createElement("td");
    if (r.isExitRoute) {
      const t = document.createElement("span");
      t.className = "tag tag-exit";
      t.textContent = "exit";
      tdType.appendChild(t);
    } else {
      tdType.textContent = "route";
      tdType.style.color = "var(--text-muted)";
    }
    tr.appendChild(tdType);

    const tdStatus = document.createElement("td");
    const dot = document.createElement("span");
    dot.className = r.isPrimary
      ? "status-dot status-dot-active"
      : "status-dot status-dot-inactive";
    tdStatus.appendChild(dot);
    tr.appendChild(tdStatus);

    body.appendChild(tr);
  }

  // Update sort indicators on headers
  document
    .querySelectorAll<HTMLElement>("#routes-table th[data-col]")
    .forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
      if (th.dataset.col === routesSortCol) {
        th.classList.add(routesSortDir === "asc" ? "sort-asc" : "sort-desc");
      }
    });

  table.hidden = false;
  empty.hidden = true;
  count.textContent = `${routes.length} route${routes.length !== 1 ? "s" : ""}`;
}

el("btn-routes-refresh").addEventListener("click", () => {
  renderRoutes();
  flashButton(
    el<HTMLButtonElement>("btn-routes-refresh"),
    "Updated!",
    "Refresh",
  );
});

document
  .querySelectorAll<HTMLElement>("#routes-table th[data-col]")
  .forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col as SortCol;
      if (routesSortCol === col) {
        routesSortDir = routesSortDir === "asc" ? "desc" : "asc";
      } else {
        routesSortCol = col;
        routesSortDir = "asc";
      }
      renderRoutes();
    });
  });

// ── DNS ───────────────────────────────────────────────────────────────────────

function renderDNS() {
  const d = network.getDNS();
  const content = el("dns-content");
  const empty = el("dns-empty");
  const badge = el("dns-magic-badge");

  badge.textContent = d.magicDNS ? "MagicDNS enabled" : "MagicDNS disabled";

  const hasAnything =
    d.resolvers.length > 0 ||
    Object.keys(d.routes).length > 0 ||
    d.domains.length > 0 ||
    d.extraRecords.length > 0;

  if (!hasAnything) {
    content.hidden = true;
    empty.hidden = false;
    return;
  }
  content.hidden = false;
  empty.hidden = true;

  // Resolvers
  const resolversSection = el("dns-resolvers-section");
  const resolversBody = el("dns-resolvers-body");
  resolversBody.innerHTML = "";
  if (d.resolvers.length > 0) {
    for (const r of d.resolvers) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = r;
      tr.appendChild(td);
      resolversBody.appendChild(tr);
    }
    resolversSection.hidden = false;
  } else {
    resolversSection.hidden = true;
  }

  // Split DNS routes
  const routesSection = el("dns-routes-section");
  const routesBody = el("dns-routes-body");
  routesBody.innerHTML = "";
  const suffixes = Object.keys(d.routes).sort();
  if (suffixes.length > 0) {
    for (const suffix of suffixes) {
      const tr = document.createElement("tr");
      const tdSuf = document.createElement("td");
      tdSuf.textContent = suffix;
      const tdRes = document.createElement("td");
      tdRes.textContent = (d.routes[suffix] ?? []).join(", ") || "(MagicDNS)";
      tr.appendChild(tdSuf);
      tr.appendChild(tdRes);
      routesBody.appendChild(tr);
    }
    routesSection.hidden = false;
  } else {
    routesSection.hidden = true;
  }

  // Search domains
  const domainsSection = el("dns-domains-section");
  const domainsBody = el("dns-domains-body");
  domainsBody.innerHTML = "";
  if (d.domains.length > 0) {
    for (const dom of d.domains) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = dom;
      tr.appendChild(td);
      domainsBody.appendChild(tr);
    }
    domainsSection.hidden = false;
  } else {
    domainsSection.hidden = true;
  }

  // Extra records
  const recordsSection = el("dns-records-section");
  const recordsBody = el("dns-records-body");
  recordsBody.innerHTML = "";
  if (d.extraRecords.length > 0) {
    for (const rec of d.extraRecords) {
      const tr = document.createElement("tr");
      [rec.name, rec.type, rec.value].forEach((v) => {
        const td = document.createElement("td");
        td.textContent = v;
        tr.appendChild(td);
      });
      recordsBody.appendChild(tr);
    }
    recordsSection.hidden = false;
  } else {
    recordsSection.hidden = true;
  }
}

el("btn-dns-refresh").addEventListener("click", () => {
  renderDNS();
  flashButton(el<HTMLButtonElement>("btn-dns-refresh"), "Updated!", "Refresh");
});

// ── iperf3 ────────────────────────────────────────────────────────────────────
//
// Implements an iperf3 TCP server. The browser acts as the iperf3 server;
// run `iperf3 -c <tailscale-ip> -p <port>` from any tailnet peer to test
// throughput over DERP or WebRTC.

class BufferedReader {
  private chunks: Uint8Array[] = [];
  private available = 0;
  private waiters: Array<{
    n: number;
    resolve: (d: Uint8Array) => void;
    reject: (e: unknown) => void;
  }> = [];

  push(chunk: Uint8Array) {
    this.chunks.push(chunk);
    this.available += chunk.byteLength;
    this.drain();
  }

  read(n: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      this.waiters.push({ n, resolve, reject });
      this.drain();
    });
  }

  private drain() {
    while (
      this.waiters.length > 0 &&
      this.available >= this.waiters[0]!.n
    ) {
      const { n, resolve } = this.waiters.shift()!;
      resolve(this.consume(n));
    }
  }

  private consume(n: number): Uint8Array {
    const out = new Uint8Array(n);
    let offset = 0;
    while (offset < n) {
      const chunk = this.chunks[0]!;
      const take = Math.min(chunk.byteLength, n - offset);
      out.set(chunk.subarray(0, take), offset);
      offset += take;
      if (take === chunk.byteLength) this.chunks.shift();
      else this.chunks[0] = chunk.subarray(take);
    }
    this.available -= n;
    return out;
  }
}

interface Iperf3DataConn {
  conn: Connection;
  bytes: number;
}

interface Iperf3Session {
  cookie: string;
  controlConn: Connection;
  controlReader: BufferedReader;
  dataConns: Iperf3DataConn[];
  numStreams: number;
}

const iperf3Sessions = new Map<string, Iperf3Session>();
let iperf3Listener: Listener | null = null;

// iperf3 v3 protocol state values (sent as single signed bytes)
const I3_PARAM_EXCHANGE   = 9;
const I3_CREATE_STREAMS   = 10;
const I3_TEST_START       = 1;
const I3_TEST_RUNNING     = 2;
const I3_TEST_END         = 4;
const I3_EXCHANGE_RESULTS = 13;
const I3_DISPLAY_RESULTS  = 14;
const I3_IPERF_DONE       = 15;

function i3BE32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, false);
  return b;
}

function i3FmtBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GBytes`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)} MBytes`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)} KBytes`;
  return `${n} Bytes`;
}

function i3FmtBits(bps: number): string {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbits/sec`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbits/sec`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbits/sec`;
  return `${bps.toFixed(2)} bits/sec`;
}

async function handleIperf3Connection(conn: Connection) {
  const reader = new BufferedReader();
  // totalRx tracks every byte received on this connection. For data streams
  // we use it to compute payload bytes (totalRx minus the 37-byte cookie).
  let totalRx = 0;
  conn.onData((data) => {
    totalRx += data.byteLength;
    reader.push(data);
  });

  // Every connection (control or data) begins with a 37-byte cookie
  // (36 alphanumeric chars + NUL).
  let cookieBuf: Uint8Array;
  try {
    cookieBuf = await reader.read(37);
  } catch {
    conn.close();
    return;
  }
  const cookie = new TextDecoder().decode(cookieBuf.subarray(0, 36));

  const existing = iperf3Sessions.get(cookie);
  if (existing) {
    // Data stream: payload bytes = everything received after the 37-byte cookie.
    // Use a getter so the interval always reads the live value.
    const dc = {
      conn,
      get bytes() {
        return totalRx - 37;
      },
    } as Iperf3DataConn;
    existing.dataConns.push(dc);
    return;
  }

  // New control connection.
  const session: Iperf3Session = {
    cookie,
    controlConn: conn,
    controlReader: reader,
    dataConns: [],
    numStreams: 1,
  };
  iperf3Sessions.set(cookie, session);
  try {
    await runIperf3Session(session);
  } catch (err) {
    appendLine("iperf3-output", "line-err", `  error: ${err}`);
  } finally {
    iperf3Sessions.delete(cookie);
    for (const dc of session.dataConns) dc.conn.close();
    conn.close();
  }
}

async function runIperf3Session(session: Iperf3Session) {
  const { controlConn: ctrl, controlReader: reader } = session;

  // Send PARAM_EXCHANGE; client replies with JSON params.
  ctrl.write(new Uint8Array([I3_PARAM_EXCHANGE]));
  const lenBuf = await reader.read(4);
  const paramLen = new DataView(lenBuf.buffer).getUint32(0, false);
  const jsonBuf = await reader.read(paramLen);
  const params = JSON.parse(new TextDecoder().decode(jsonBuf));

  const numStreams: number = params.parallel || 1;
  const duration: number = params.time || 10;
  const reverse: boolean = !!params.reverse;
  session.numStreams = numStreams;

  if (reverse) {
    appendLine("iperf3-output", "line-err", "  reverse mode not supported");
    return;
  }

  const blockSize = params.len ? `${params.len}B blocks` : "default blocks";
  appendLine(
    "iperf3-output",
    "line-meta",
    `→ test: ${numStreams} stream(s), ${duration}s, ${blockSize}`,
  );

  // Send CREATE_STREAMS; client opens data connections (same port, same cookie).
  ctrl.write(new Uint8Array([I3_CREATE_STREAMS]));

  const deadline = Date.now() + 5000;
  while (session.dataConns.length < numStreams && Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, 20));
  }
  if (session.dataConns.length < numStreams) {
    appendLine(
      "iperf3-output",
      "line-err",
      `  timeout: ${session.dataConns.length}/${numStreams} streams connected`,
    );
    return;
  }

  // Send TEST_START then TEST_RUNNING; client begins uploading data only after TEST_RUNNING.
  const t0 = performance.now();
  ctrl.write(new Uint8Array([I3_TEST_START]));
  ctrl.write(new Uint8Array([I3_TEST_RUNNING]));
  appendLine(
    "iperf3-output",
    "line-meta",
    "  [ ID]  Interval            Transfer        Bandwidth",
  );

  let lastBytes = 0;
  let intervalSec = 0;
  const intervalId = setInterval(() => {
    intervalSec++;
    const totalBytes = session.dataConns.reduce((s, dc) => s + dc.bytes, 0);
    const db = totalBytes - lastBytes;
    appendLine(
      "iperf3-output",
      "line-recv",
      `  [SUM]  ${(intervalSec - 1).toFixed(1)}-${intervalSec.toFixed(1)} sec  ${i3FmtBytes(db).padEnd(16)}  ${i3FmtBits(db * 8)}`,
    );
    lastBytes = totalBytes;
  }, 1000);

  // Wait for TEST_END from client.
  const testEndBuf = await reader.read(1);
  clearInterval(intervalId);

  const elapsed = (performance.now() - t0) / 1000; // actual measured elapsed
  const totalBytes = session.dataConns.reduce((s, dc) => s + dc.bytes, 0);

  if (testEndBuf[0] !== I3_TEST_END) {
    appendLine(
      "iperf3-output",
      "line-err",
      `  unexpected state byte: ${testEndBuf[0]}`,
    );
    return;
  }

  appendLine(
    "iperf3-output",
    "line-ok",
    `  [SUM]  0.0-${elapsed.toFixed(2)} sec  ${i3FmtBytes(totalBytes).padEnd(16)}  ${i3FmtBits((totalBytes * 8) / elapsed)}`,
  );

  // EXCHANGE_RESULTS: send state byte, then exchange JSON results.
  ctrl.write(new Uint8Array([I3_EXCHANGE_RESULTS]));

  // Read client results JSON (4-byte BE length + JSON).
  const clientLenBuf = await reader.read(4);
  const clientLen = new DataView(clientLenBuf.buffer).getUint32(0, false);
  await reader.read(clientLen);

  // Send server results JSON.
  const serverResult = JSON.stringify({
    cpu_util_total: 0,
    cpu_util_user: 0,
    cpu_util_system: 0,
    sender_has_retransmits: 0,
    streams: session.dataConns.map((dc, i) => ({
      id: i + 1,
      bytes: dc.bytes,
      retransmits: -1,
      jitter: 0,
      errors: 0,
      packets: 0,
    })),
  });
  const serverResultBytes = new TextEncoder().encode(serverResult);
  ctrl.write(i3BE32(serverResultBytes.byteLength));
  ctrl.write(serverResultBytes);

  ctrl.write(new Uint8Array([I3_DISPLAY_RESULTS]));
  ctrl.write(new Uint8Array([I3_IPERF_DONE]));
}

el("btn-iperf3-start").addEventListener("click", async () => {
  const btn = el<HTMLButtonElement>("btn-iperf3-start");
  const port = parseInt(el<HTMLInputElement>("iperf3-port").value || "5201", 10);

  hide("iperf3-error");
  btn.disabled = true;
  btn.textContent = "Starting…";

  try {
    const listener = await network.listenTCP(port, (conn: Connection) => {
      handleIperf3Connection(conn).catch((err) =>
        appendLine("iperf3-output", "line-err", `error: ${err}`),
      );
    });

    iperf3Listener = listener;
    el("iperf3-output").textContent = "";
    text("iperf3-assigned-port", String(listener.port));
    appendLine(
      "iperf3-output",
      "line-meta",
      `iperf3 server listening on port ${listener.port}…`,
    );
    const myIP =
      network.localIPv4() || network.localIPv6() || "<tailscale-ip>";
    appendLine(
      "iperf3-output",
      "line-meta",
      `  run: iperf3 -c ${myIP} -p ${listener.port}`,
    );

    hide("iperf3-form");
    show("iperf3-session");
  } catch (err) {
    showError("iperf3-error", String(err));
    btn.disabled = false;
    btn.textContent = "Start";
  }
});

el("btn-iperf3-stop").addEventListener("click", () => {
  iperf3Listener?.close();
  iperf3Listener = null;
  iperf3Sessions.clear();
  appendLine("iperf3-output", "line-meta", "server stopped");
  hide("iperf3-session");
  show("iperf3-form");
  el<HTMLButtonElement>("btn-iperf3-start").disabled = false;
  el<HTMLButtonElement>("btn-iperf3-start").textContent = "Start";
});

// ── Code viewer ───────────────────────────────────────────────────────────────

const codeSections: Record<string, [string, string]> = {
  ping: ["// ── Ping ──", "// ── Fetch ──"],
  fetch: ["// ── Fetch ──", "// ── Dial ──"],
  dial: ["// ── Dial ──", "// ── Listen ──"],
  listen: ["// ── Listen ──", "// ── Serve HTTP ──"],
  serve: ["// ── Serve HTTP ──", "// ── Exit node selector ──"],
  routes: ["// ── Exit node selector ──", "// ── DNS ──"],
  dns: ["// ── DNS ──", "// ── iperf3 ──"],
  iperf3: ["// ── iperf3 ──", "// ── Code viewer ──"],
};

function getCodeSection(tab: string): string {
  const [start, end] = codeSections[tab] ?? [];
  if (!start) return "";
  const lines = src.split("\n");
  const si = lines.findIndex((l) => l.includes(start));
  const ei = lines.findIndex((l, i) => i > si && l.includes(end));
  return lines
    .slice(si, ei < 0 ? undefined : ei)
    .join("\n")
    .trim();
}

function openCodeModal() {
  el("code-modal-tab").textContent = activeTab;
  el("code-modal-pre").textContent = getCodeSection(activeTab);
  el("code-modal").hidden = false;
}

function closeCodeModal() {
  el("code-modal").hidden = true;
}

el("btn-view-code").addEventListener("click", openCodeModal);
el("btn-close-code").addEventListener("click", closeCodeModal);
el("code-modal").addEventListener("click", (e) => {
  if (e.target === el("code-modal")) closeCodeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !el("code-modal").hidden) closeCodeModal();
});

el("btn-copy-code").addEventListener("click", () => {
  const btn = el<HTMLButtonElement>("btn-copy-code");
  navigator.clipboard
    .writeText(el("code-modal-pre").textContent ?? "")
    .then(() => {
      const orig = btn.textContent!;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = orig;
      }, 1400);
    })
    .catch(() => {});
});

// ── Go ────────────────────────────────────────────────────────────────────────

boot();
