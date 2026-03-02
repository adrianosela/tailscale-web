(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function d(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(n){if(n.ep)return;n.ep=!0;const s=d(n);fetch(n.href,s)}})();(()=>{const e=()=>{const l=new Error("not implemented");return l.code="ENOSYS",l};if(!globalThis.fs){let l="";globalThis.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1,O_DIRECTORY:-1},writeSync(n,s){l+=d.decode(s);const i=l.lastIndexOf(`
`);return i!=-1&&(console.log(l.substring(0,i)),l=l.substring(i+1)),s.length},write(n,s,i,c,p,m){if(i!==0||c!==s.length||p!==null){m(e());return}const g=this.writeSync(n,s);m(null,g)},chmod(n,s,i){i(e())},chown(n,s,i,c){c(e())},close(n,s){s(e())},fchmod(n,s,i){i(e())},fchown(n,s,i,c){c(e())},fstat(n,s){s(e())},fsync(n,s){s(null)},ftruncate(n,s,i){i(e())},lchown(n,s,i,c){c(e())},link(n,s,i){i(e())},lstat(n,s){s(e())},mkdir(n,s,i){i(e())},open(n,s,i,c){c(e())},read(n,s,i,c,p,m){m(e())},readdir(n,s){s(e())},readlink(n,s){s(e())},rename(n,s,i){i(e())},rmdir(n,s){s(e())},stat(n,s){s(e())},symlink(n,s,i){i(e())},truncate(n,s,i){i(e())},unlink(n,s){s(e())},utimes(n,s,i,c){c(e())}}}if(globalThis.process||(globalThis.process={getuid(){return-1},getgid(){return-1},geteuid(){return-1},getegid(){return-1},getgroups(){throw e()},pid:-1,ppid:-1,umask(){throw e()},cwd(){throw e()},chdir(){throw e()}}),globalThis.path||(globalThis.path={resolve(...l){return l.join("/")}}),!globalThis.crypto)throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");if(!globalThis.performance)throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");if(!globalThis.TextEncoder)throw new Error("globalThis.TextEncoder is not available, polyfill required");if(!globalThis.TextDecoder)throw new Error("globalThis.TextDecoder is not available, polyfill required");const r=new TextEncoder("utf-8"),d=new TextDecoder("utf-8");globalThis.Go=class{constructor(){this.argv=["js"],this.env={},this.exit=t=>{t!==0&&console.warn("exit code:",t)},this._exitPromise=new Promise(t=>{this._resolveExitPromise=t}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;const l=(t,a)=>{this.mem.setUint32(t+0,a,!0),this.mem.setUint32(t+4,Math.floor(a/4294967296),!0)},n=t=>{const a=this.mem.getUint32(t+0,!0),u=this.mem.getInt32(t+4,!0);return a+u*4294967296},s=t=>{const a=this.mem.getFloat64(t,!0);if(a===0)return;if(!isNaN(a))return a;const u=this.mem.getUint32(t,!0);return this._values[u]},i=(t,a)=>{if(typeof a=="number"&&a!==0){if(isNaN(a)){this.mem.setUint32(t+4,2146959360,!0),this.mem.setUint32(t,0,!0);return}this.mem.setFloat64(t,a,!0);return}if(a===void 0){this.mem.setFloat64(t,0,!0);return}let h=this._ids.get(a);h===void 0&&(h=this._idPool.pop(),h===void 0&&(h=this._values.length),this._values[h]=a,this._goRefCounts[h]=0,this._ids.set(a,h)),this._goRefCounts[h]++;let f=0;switch(typeof a){case"object":a!==null&&(f=1);break;case"string":f=2;break;case"symbol":f=3;break;case"function":f=4;break}this.mem.setUint32(t+4,2146959360|f,!0),this.mem.setUint32(t,h,!0)},c=t=>{const a=n(t+0),u=n(t+8);return new Uint8Array(this._inst.exports.mem.buffer,a,u)},p=t=>{const a=n(t+0),u=n(t+8),h=new Array(u);for(let f=0;f<u;f++)h[f]=s(a+f*8);return h},m=t=>{const a=n(t+0),u=n(t+8);return d.decode(new DataView(this._inst.exports.mem.buffer,a,u))},g=(t,a)=>(this._inst.exports.testExport0(),this._inst.exports.testExport(t,a)),b=Date.now()-performance.now();this.importObject={_gotest:{add:(t,a)=>t+a,callExport:g},gojs:{"runtime.wasmExit":t=>{t>>>=0;const a=this.mem.getInt32(t+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(a)},"runtime.wasmWrite":t=>{t>>>=0;const a=n(t+8),u=n(t+16),h=this.mem.getInt32(t+24,!0);fs.writeSync(a,new Uint8Array(this._inst.exports.mem.buffer,u,h))},"runtime.resetMemoryDataView":t=>{this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":t=>{t>>>=0,l(t+8,(b+performance.now())*1e6)},"runtime.walltime":t=>{t>>>=0;const a=new Date().getTime();l(t+8,a/1e3),this.mem.setInt32(t+16,a%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":t=>{t>>>=0;const a=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(a,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(a);)console.warn("scheduleTimeoutEvent: missed timeout event"),this._resume()},n(t+8))),this.mem.setInt32(t+16,a,!0)},"runtime.clearTimeoutEvent":t=>{t>>>=0;const a=this.mem.getInt32(t+8,!0);clearTimeout(this._scheduledTimeouts.get(a)),this._scheduledTimeouts.delete(a)},"runtime.getRandomData":t=>{t>>>=0,crypto.getRandomValues(c(t+8))},"syscall/js.finalizeRef":t=>{t>>>=0;const a=this.mem.getUint32(t+8,!0);if(this._goRefCounts[a]--,this._goRefCounts[a]===0){const u=this._values[a];this._values[a]=null,this._ids.delete(u),this._idPool.push(a)}},"syscall/js.stringVal":t=>{t>>>=0,i(t+24,m(t+8))},"syscall/js.valueGet":t=>{t>>>=0;const a=Reflect.get(s(t+8),m(t+16));t=this._inst.exports.getsp()>>>0,i(t+32,a)},"syscall/js.valueSet":t=>{t>>>=0,Reflect.set(s(t+8),m(t+16),s(t+32))},"syscall/js.valueDelete":t=>{t>>>=0,Reflect.deleteProperty(s(t+8),m(t+16))},"syscall/js.valueIndex":t=>{t>>>=0,i(t+24,Reflect.get(s(t+8),n(t+16)))},"syscall/js.valueSetIndex":t=>{t>>>=0,Reflect.set(s(t+8),n(t+16),s(t+24))},"syscall/js.valueCall":t=>{t>>>=0;try{const a=s(t+8),u=Reflect.get(a,m(t+16)),h=p(t+32),f=Reflect.apply(u,a,h);t=this._inst.exports.getsp()>>>0,i(t+56,f),this.mem.setUint8(t+64,1)}catch(a){t=this._inst.exports.getsp()>>>0,i(t+56,a),this.mem.setUint8(t+64,0)}},"syscall/js.valueInvoke":t=>{t>>>=0;try{const a=s(t+8),u=p(t+16),h=Reflect.apply(a,void 0,u);t=this._inst.exports.getsp()>>>0,i(t+40,h),this.mem.setUint8(t+48,1)}catch(a){t=this._inst.exports.getsp()>>>0,i(t+40,a),this.mem.setUint8(t+48,0)}},"syscall/js.valueNew":t=>{t>>>=0;try{const a=s(t+8),u=p(t+16),h=Reflect.construct(a,u);t=this._inst.exports.getsp()>>>0,i(t+40,h),this.mem.setUint8(t+48,1)}catch(a){t=this._inst.exports.getsp()>>>0,i(t+40,a),this.mem.setUint8(t+48,0)}},"syscall/js.valueLength":t=>{t>>>=0,l(t+16,parseInt(s(t+8).length))},"syscall/js.valuePrepareString":t=>{t>>>=0;const a=r.encode(String(s(t+8)));i(t+16,a),l(t+24,a.length)},"syscall/js.valueLoadString":t=>{t>>>=0;const a=s(t+8);c(t+16).set(a)},"syscall/js.valueInstanceOf":t=>{t>>>=0,this.mem.setUint8(t+24,s(t+8)instanceof s(t+16)?1:0)},"syscall/js.copyBytesToGo":t=>{t>>>=0;const a=c(t+8),u=s(t+32);if(!(u instanceof Uint8Array||u instanceof Uint8ClampedArray)){this.mem.setUint8(t+48,0);return}const h=u.subarray(0,a.length);a.set(h),l(t+40,h.length),this.mem.setUint8(t+48,1)},"syscall/js.copyBytesToJS":t=>{t>>>=0;const a=s(t+8),u=c(t+16);if(!(a instanceof Uint8Array||a instanceof Uint8ClampedArray)){this.mem.setUint8(t+48,0);return}const h=u.subarray(0,a.length);a.set(h),l(t+40,h.length),this.mem.setUint8(t+48,1)},debug:t=>{console.log(t)}}}}async run(l){if(!(l instanceof WebAssembly.Instance))throw new Error("Go.run: WebAssembly.Instance expected");this._inst=l,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,globalThis,this],this._goRefCounts=new Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[globalThis,5],[this,6]]),this._idPool=[],this.exited=!1;let n=4096;const s=b=>{const t=n,a=r.encode(b+"\0");return new Uint8Array(this.mem.buffer,n,a.length).set(a),n+=a.length,n%8!==0&&(n+=8-n%8),t},i=this.argv.length,c=[];this.argv.forEach(b=>{c.push(s(b))}),c.push(0),Object.keys(this.env).sort().forEach(b=>{c.push(s(`${b}=${this.env[b]}`))}),c.push(0);const m=n;if(c.forEach(b=>{this.mem.setUint32(n,b,!0),this.mem.setUint32(n+4,0,!0),n+=8}),n>=12288)throw new Error("total length of command line and environment variables exceeds limit");this._inst.exports.run(i,m),this.exited&&this._resolveExitPromise(),await this._exitPromise}_resume(){if(this.exited)throw new Error("Go program has already exited");this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(l){const n=this;return function(){const s={id:l,this:this,args:arguments};return n._pendingEvent=s,n._resume(),s.result}}}})();const Y=""+new URL("main-C5XMLCCb.wasm",import.meta.url).href;(()=>{const e=globalThis,r="process";e[r]?e[r].pid==null&&(e[r].pid=1):e[r]={pid:1}})();let V=!1;async function z(){if(V)return;const e=new globalThis.Go,r=await WebAssembly.instantiateStreaming(fetch(Y),e.importObject);e.run(r.instance),V=!0}function y(){return globalThis.__tailscaleWeb}function Q(e){return{status:e.status,statusText:e.statusText,ok:e.ok,headers:e.headers,text:async()=>new TextDecoder().decode(e.body),json:async()=>JSON.parse(new TextDecoder().decode(e.body)),arrayBuffer:async()=>e.body.buffer,bytes:async()=>e.body}}const v={async init(e={}){return await z(),y().init(e)},async ping(e){return y().ping(e)},async dialTCP(e){const r=await y().dialTCP(e);return{onData(d){r.onData(d)},write(d){r.write(typeof d=="string"?new TextEncoder().encode(d):d)},close(){r.close()}}},async listenTCP(e=0,r){const d=await y().listenTCP(e,l=>{r({onData(n){l.onData(n)},write(n){l.write(typeof n=="string"?new TextEncoder().encode(n):n)},close(){l.close()}})});return{port:d.port,close(){d.close()}}},async fetch(e,r={}){return Q(await y().fetch(e,r))},localIPv4(){return y().localIPv4()},localIPv6(){return y().localIPv6()},getPrefs(){return y().getPrefs()},async setAcceptRoutes(e){return y().setAcceptRoutes(e)},listExitNodes(){return Array.from(y().listExitNodes())},async setExitNode(e=""){return y().setExitNode(e)},getRoutes(){return Array.from(y().getRoutes())},getDNS(){return y().getDNS()}},Z=`import { network, type Connection, type Listener, type PingResult } from "tailscale-web";
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
    el(\`tab-\${tab}\`).hidden = false;
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
  let s = \`\${sent} transmitted, \${recv} received, \${loss}% packet loss\`;
  if (rtts.length > 0) {
    const min = Math.min(...rtts).toFixed(3);
    const avg = (rtts.reduce((a, b) => a + b, 0) / rtts.length).toFixed(3);
    const max = Math.max(...rtts).toFixed(3);
    s += \`\\nrtt min/avg/max = \${min}/\${avg}/\${max} ms\`;
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

  appendLine("ping-output", "line-meta", \`PING \${addr}\`);

  while (pinging) {
    seq++;
    let r: PingResult | undefined;
    try {
      r = await network.ping(addr);
    } catch (err) {
      lost++;
      appendLine("ping-output", "line-err", \`icmp_seq=\${seq}  error: \${err}\`);
      updatePingStats(seq, rtts, lost);
      await new Promise((res) => setTimeout(res, 1000));
      continue;
    }

    if (!pinging) break;

    if (r.alive) {
      rtts.push(r.rttMs);
      const via = r.derpRegionCode
        ? \`via DERP(\${r.derpRegionCode})\`
        : r.endpoint
          ? "direct"
          : "";
      const parts = [
        \`icmp_seq=\${seq}\`,
        \`time=\${r.rttMs.toFixed(3)} ms\`,
        via,
        r.endpoint ? \`endpoint=\${r.endpoint}\` : "",
        r.nodeName ? \`node=\${r.nodeName}\` : "",
        r.nodeIP ? \`ip=\${r.nodeIP}\` : "",
      ]
        .filter(Boolean)
        .join("  ");
      appendLine("ping-output", "line-ok", parts);
    } else {
      lost++;
      const reason = r.err ? \` (\${r.err})\` : "";
      appendLine(
        "ping-output",
        "line-err",
        \`icmp_seq=\${seq}  timeout\${reason}\`,
      );
    }

    updatePingStats(seq, rtts, lost);
    if (pinging) await new Promise((res) => setTimeout(res, 1000));
  }

  appendLine("ping-output", "line-meta", \`--- \${addr} ping statistics ---\`);
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
    for (const line of hdrsRaw.split("\\n")) {
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
    chip.className = \`status-chip \${resp.ok ? "ok" : "err"}\`;
    text("fetch-status-text", resp.statusText);

    // headers
    const hLines = Object.entries(resp.headers)
      .map(([k, v]) => \`\${k}: \${v}\`)
      .join("\\n");
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
  if (!/<base\\b/i.test(html)) {
    html = /<head\\b/i.test(html)
      ? html.replace(/(<head[^>]*>)/i, \`$1<base href="\${baseUrl}">\`)
      : \`<base href="\${baseUrl}">\` + html;
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
  line.textContent = msg + "\\n";
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
    appendLine("dial-output", "line-meta", \`connected to \${addr}\`);

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
  activeConn.write(msg + "\\n");
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
      appendLine("listen-output", "line-ok", \`→ connection #\${connId} accepted\`);

      conn.onData((data) => {
        const text = new TextDecoder().decode(data);
        appendLine("listen-output", "line-recv", \`  [#\${connId}] \${text.trimEnd()}\`);
      });
    });

    activeListener = listener;
    listenConnCount = 0;

    el("listen-output").textContent = "";
    text("listen-assigned-port", String(listener.port));
    appendLine("listen-output", "line-meta", \`listening on port \${listener.port}…\`);

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
        if (!buf.includes("\\r\\n\\r\\n")) return;

        // Parse request line for logging.
        const reqLine = buf.split("\\r\\n")[0] ?? "";
        appendLine("serve-output", "line-ok", \`→ [#\${reqId}] \${reqLine}\`);

        // Build response.
        const body = el<HTMLTextAreaElement>("serve-html").value;
        const bodyBytes = new TextEncoder().encode(body);
        const response =
          "HTTP/1.1 200 OK\\r\\n" +
          "Content-Type: text/html; charset=utf-8\\r\\n" +
          \`Content-Length: \${bodyBytes.length}\\r\\n\` +
          "Connection: close\\r\\n" +
          "\\r\\n" +
          body;

        conn.write(response);
        conn.close();
        appendLine("serve-output", "line-meta", \`  [#\${reqId}] 200 OK — \${bodyBytes.length} bytes\`);
      });
    });

    serveListener = listener;
    serveReqCount = 0;

    el("serve-output").textContent = "";
    text("serve-assigned-port", String(listener.port));
    appendLine("serve-output", "line-meta", \`listening on port \${listener.port}…\`);

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
    opt.textContent = \`\${n.hostName || n.dnsName}\${n.online ? "" : " (offline)"}\`;
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
  count.textContent = \`\${routes.length} route\${routes.length !== 1 ? "s" : ""}\`;
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

// ── Code viewer ───────────────────────────────────────────────────────────────

const codeSections: Record<string, [string, string]> = {
  ping: ["// ── Ping ──", "// ── Fetch ──"],
  fetch: ["// ── Fetch ──", "// ── Dial ──"],
  dial: ["// ── Dial ──", "// ── Listen ──"],
  listen: ["// ── Listen ──", "// ── Serve HTTP ──"],
  serve: ["// ── Serve HTTP ──", "// ── Exit node selector ──"],
  routes: ["// ── Exit node selector ──", "// ── DNS ──"],
  dns: ["// ── DNS ──", "// ── Code viewer ──"],
};

function getCodeSection(tab: string): string {
  const [start, end] = codeSections[tab] ?? [];
  if (!start) return "";
  const lines = src.split("\\n");
  const si = lines.findIndex((l) => l.includes(start));
  const ei = lines.findIndex((l, i) => i > si && l.includes(end));
  return lines
    .slice(si, ei < 0 ? undefined : ei)
    .join("\\n")
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
`;function ee(){return localStorage.getItem("theme")??(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}function X(e){document.documentElement.setAttribute("data-theme",e),localStorage.setItem("theme",e),o("ts-logo").classList.toggle("invert",e==="dark")}function o(e){return document.getElementById(e)}function w(e){o(e).hidden=!1}function E(e){o(e).hidden=!0}function C(e,r){o(e).textContent=r}const G=new WeakMap;function P(e,r,d,l=1400){clearTimeout(G.get(e)),e.textContent=r,e.classList.add("btn-flash"),G.set(e,setTimeout(()=>{e.textContent=d,e.classList.remove("btn-flash")},l))}const R={};let O="ping";document.querySelectorAll(".nav-tab").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".nav-tab").forEach(d=>d.classList.remove("active")),document.querySelectorAll(".tab-panel").forEach(d=>{d.hidden=!0}),e.classList.add("active");const r=e.dataset.tab;O=r,o(`tab-${r}`).hidden=!1,R[r]?.(),delete R[r]})});let I=null;function L(e,r){const d=o(e);d.textContent=r,d.hidden=!1}async function te(){X(ee());try{await v.init({hostname:"tailscale-web-playground",onAuthRequired(e){I=e,E("login-status"),w("btn-auth")},onAuthComplete(){I=null}}),se(),await ne()}catch(e){L("error-login",String(e))}}o("btn-auth").addEventListener("click",()=>{I&&window.open(I,"_blank","width=600,height=700")});o("btn-disconnect").addEventListener("click",()=>{localStorage.clear(),location.reload()});o("btn-theme").addEventListener("click",()=>{const e=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";X(e)});const _="ts-exit-node-id";async function ne(){const e=localStorage.getItem(_);if(!(!e||!v.listExitNodes().find(d=>d.id===e)))try{await v.setExitNode(e),D(),$()}catch{}}function $(){const{exitNodeId:e}=v.getPrefs();let r="<none>";if(e){const d=v.listExitNodes().find(l=>l.id===e);r=d?d.hostName||d.dnsName:e}o("exit-node-name").textContent=r}function se(){E("screen-login"),w("screen-app"),$();const e=v.localIPv4(),r=v.localIPv6();e&&C("vpn-ipv4",e),r&&C("vpn-ipv6",r),(e||r)&&w("vpn-addrs"),R.routes=F,R.dns=K}let T=!1;function H(e,r,d){const l=o("ping-stats"),n=e-d,s=e>0?Math.round(d/e*100):0;let i=`${e} transmitted, ${n} received, ${s}% packet loss`;if(r.length>0){const c=Math.min(...r).toFixed(3),p=(r.reduce((g,b)=>g+b,0)/r.length).toFixed(3),m=Math.max(...r).toFixed(3);i+=`
rtt min/avg/max = ${c}/${p}/${m} ms`}l.textContent=i,l.hidden=!1}o("btn-ping").addEventListener("click",async()=>{const e=o("btn-ping"),r=o("ping-output");if(T){T=!1;return}const d=o("ping-addr").value.trim();if(!d)return;T=!0,e.textContent="Stop",r.innerHTML="",r.hidden=!1,o("ping-stats").hidden=!0;let l=0,n=[],s=0;for(x("ping-output","line-meta",`PING ${d}`);T;){l++;let i;try{i=await v.ping(d)}catch(c){s++,x("ping-output","line-err",`icmp_seq=${l}  error: ${c}`),H(l,n,s),await new Promise(p=>setTimeout(p,1e3));continue}if(!T)break;if(i.alive){n.push(i.rttMs);const c=i.derpRegionCode?`via DERP(${i.derpRegionCode})`:i.endpoint?"direct":"",p=[`icmp_seq=${l}`,`time=${i.rttMs.toFixed(3)} ms`,c,i.endpoint?`endpoint=${i.endpoint}`:"",i.nodeName?`node=${i.nodeName}`:"",i.nodeIP?`ip=${i.nodeIP}`:""].filter(Boolean).join("  ");x("ping-output","line-ok",p)}else{s++;const c=i.err?` (${i.err})`:"";x("ping-output","line-err",`icmp_seq=${l}  timeout${c}`)}H(l,n,s),T&&await new Promise(c=>setTimeout(c,1e3))}x("ping-output","line-meta",`--- ${d} ping statistics ---`),H(l,n,s),e.textContent="Ping"});let A="";o("btn-fetch").addEventListener("click",async()=>{const e=o("fetch-url").value.trim(),r=o("fetch-method").value,d=o("fetch-headers").value.trim(),l=o("fetch-body").value;if(!e)return;const n=o("btn-fetch");n.disabled=!0,n.textContent="Sending…",E("fetch-result");try{const s={};for(const t of d.split(`
`)){const a=t.indexOf(":");a>0&&(s[t.slice(0,a).trim()]=t.slice(a+1).trim())}const i=await v.fetch(e,{method:r,headers:Object.keys(s).length?s:void 0,body:l||void 0}),c=o("fetch-status");c.textContent=String(i.status),c.className=`status-chip ${i.ok?"ok":"err"}`,C("fetch-status-text",i.statusText);const p=Object.entries(i.headers).map(([t,a])=>`${t}: ${a}`).join(`
`);C("fetch-headers-out",p);const m=await i.text();try{C("fetch-body-out",JSON.stringify(JSON.parse(m),null,2))}catch{C("fetch-body-out",m)}const g=Object.entries(i.headers).find(([t])=>t.toLowerCase()==="content-type")?.[1]?.toLowerCase()??"",b=o("fetch-preview");b.hidden=!0,o("fetch-body-out").hidden=!1,g.includes("text/html")?(A=m,o("fetch-view-toggle").hidden=!1,o("btn-view-raw").classList.add("btn-primary"),o("btn-view-preview").classList.remove("btn-primary")):(A="",o("fetch-view-toggle").hidden=!0),w("fetch-result")}catch(s){L("fetch-error",String(s))}finally{n.disabled=!1,n.textContent="Send"}});o("btn-view-raw").addEventListener("click",()=>{const e=o("fetch-preview");e.src.startsWith("blob:")&&(URL.revokeObjectURL(e.src),e.removeAttribute("src")),o("fetch-body-out").hidden=!1,e.hidden=!0,o("btn-view-raw").classList.add("btn-primary"),o("btn-view-preview").classList.remove("btn-primary")});o("btn-view-preview").addEventListener("click",()=>{const e=o("fetch-preview");e.src.startsWith("blob:")&&URL.revokeObjectURL(e.src);const r=o("fetch-url").value.trim();let d=A;/<base\b/i.test(d)||(d=/<head\b/i.test(d)?d.replace(/(<head[^>]*>)/i,`$1<base href="${r}">`):`<base href="${r}">`+d);const l=new Blob([d],{type:"text/html"});e.src=URL.createObjectURL(l),o("fetch-body-out").hidden=!0,e.hidden=!1,o("btn-view-raw").classList.remove("btn-primary"),o("btn-view-preview").classList.add("btn-primary")});let N=null;function x(e,r,d){const l=o(e),n=document.createElement("span");n.className=r,n.textContent=d+`
`,l.appendChild(n),l.scrollTop=l.scrollHeight}o("btn-dial-connect").addEventListener("click",async()=>{const e=o("dial-addr").value.trim(),r=o("btn-dial-connect");if(e){r.disabled=!0,r.textContent="Connecting…";try{const d=await v.dialTCP(e);N=d,d.onData(l=>{x("dial-output","line-recv",new TextDecoder().decode(l))}),C("dial-connected-addr",e),o("dial-output").textContent="",x("dial-output","line-meta",`connected to ${e}`),E("dial-connect-form"),w("dial-session"),o("dial-send-input").focus()}catch(d){L("dial-error",String(d))}finally{r.disabled=!1,r.textContent="Connect"}}});function J(){const e=o("dial-send-input"),r=e.value;!r||!N||(N.write(r+`
`),x("dial-output","line-sent",r),e.value="")}o("btn-dial-send").addEventListener("click",J);o("dial-send-input").addEventListener("keydown",e=>{e.key==="Enter"&&J()});o("btn-dial-disconnect").addEventListener("click",()=>{N?.close(),N=null,x("dial-output","line-meta","disconnected"),E("dial-session"),w("dial-connect-form")});let j=null,U=0;o("btn-listen-start").addEventListener("click",async()=>{const e=o("listen-port"),r=o("btn-listen-start"),d=parseInt(e.value||"0",10);E("listen-error"),r.disabled=!0,r.textContent="Listening…";try{const l=await v.listenTCP(d,n=>{U++;const s=U;x("listen-output","line-ok",`→ connection #${s} accepted`),n.onData(i=>{const c=new TextDecoder().decode(i);x("listen-output","line-recv",`  [#${s}] ${c.trimEnd()}`)})});j=l,U=0,o("listen-output").textContent="",C("listen-assigned-port",String(l.port)),x("listen-output","line-meta",`listening on port ${l.port}…`),E("listen-form"),w("listen-session")}catch(l){L("listen-error",String(l)),r.disabled=!1,r.textContent="Listen"}});o("btn-listen-stop").addEventListener("click",()=>{j?.close(),j=null,x("listen-output","line-meta","listener stopped"),E("listen-session"),w("listen-form"),o("btn-listen-start").disabled=!1,o("btn-listen-start").textContent="Listen"});let q=null,B=0;o("btn-serve-start").addEventListener("click",async()=>{const e=o("btn-serve-start"),r=parseInt(o("serve-port").value||"0",10);E("serve-error"),e.disabled=!0,e.textContent="Starting…";try{const d=await v.listenTCP(r,l=>{B++;const n=B;let s="";l.onData(i=>{if(s+=new TextDecoder().decode(i),!s.includes(`\r
\r
`))return;const c=s.split(`\r
`)[0]??"";x("serve-output","line-ok",`→ [#${n}] ${c}`);const p=o("serve-html").value,m=new TextEncoder().encode(p),g=`HTTP/1.1 200 OK\r
Content-Type: text/html; charset=utf-8\r
Content-Length: ${m.length}\r
Connection: close\r
\r
`+p;l.write(g),l.close(),x("serve-output","line-meta",`  [#${n}] 200 OK — ${m.length} bytes`)})});q=d,B=0,o("serve-output").textContent="",C("serve-assigned-port",String(d.port)),x("serve-output","line-meta",`listening on port ${d.port}…`),E("serve-form"),w("serve-session")}catch(d){L("serve-error",String(d)),e.disabled=!1,e.textContent="Serve"}});o("btn-serve-stop").addEventListener("click",()=>{q?.close(),q=null,x("serve-output","line-meta","server stopped"),E("serve-session"),w("serve-form"),o("btn-serve-start").disabled=!1,o("btn-serve-start").textContent="Serve"});function D(){const e=o("exit-node-select"),r=v.getPrefs().exitNodeId,d=v.listExitNodes();e.innerHTML="";const l=document.createElement("option");l.value="",l.textContent="(none — direct connection)",e.appendChild(l);for(const n of d){const s=document.createElement("option");s.value=n.id,s.textContent=`${n.hostName||n.dnsName}${n.online?"":" (offline)"}`,n.online||(s.style.color="var(--text-muted)"),e.appendChild(s)}e.value=r}o("btn-exit-node-set").addEventListener("click",async()=>{const e=o("exit-node-select"),r=o("btn-exit-node-set"),d=o("exit-node-error");d.hidden=!0,r.disabled=!0,r.textContent="Saving…";try{await v.setExitNode(e.value),e.value?localStorage.setItem(_,e.value):localStorage.removeItem(_),D(),$(),r.disabled=!1,P(r,"Saved!","Set")}catch(l){L("exit-node-error",String(l)),r.disabled=!1,r.textContent="Set"}});o("btn-exit-node-clear").addEventListener("click",async()=>{const e=o("btn-exit-node-clear"),r=o("exit-node-error");r.hidden=!0,e.disabled=!0,e.textContent="Clearing…";try{await v.setExitNode(""),localStorage.removeItem(_),D(),$(),e.disabled=!1,P(e,"Cleared!","Clear")}catch(d){L("exit-node-error",String(d)),e.disabled=!1,e.textContent="Clear"}});let M="prefix",k="asc";function F(){D();const e=v.getRoutes(),r=o("routes-body"),d=o("routes-table"),l=o("routes-empty"),n=o("routes-count");if(r.innerHTML="",e.length===0){d.hidden=!0,l.hidden=!1,n.textContent="";return}const s=[...e].sort((i,c)=>{let p,m;switch(M){case"prefix":p=i.prefix,m=c.prefix;break;case"via":p=i.via,m=c.via;break;case"type":p=i.isExitRoute?"exit":"route",m=c.isExitRoute?"exit":"route";break;case"status":p=i.isPrimary?0:1,m=c.isPrimary?0:1;break}const g=p<m?-1:p>m?1:0;return k==="asc"?g:-g});for(const i of s){const c=document.createElement("tr"),p=document.createElement("td");p.textContent=i.prefix,c.appendChild(p);const m=document.createElement("td"),g=document.createElement("span");g.className=i.via==="self"?"tag tag-self":"tag tag-peer",g.textContent=i.via,m.appendChild(g),c.appendChild(m);const b=document.createElement("td");if(i.isExitRoute){const u=document.createElement("span");u.className="tag tag-exit",u.textContent="exit",b.appendChild(u)}else b.textContent="route",b.style.color="var(--text-muted)";c.appendChild(b);const t=document.createElement("td"),a=document.createElement("span");a.className=i.isPrimary?"status-dot status-dot-active":"status-dot status-dot-inactive",t.appendChild(a),c.appendChild(t),r.appendChild(c)}document.querySelectorAll("#routes-table th[data-col]").forEach(i=>{i.classList.remove("sort-asc","sort-desc"),i.dataset.col===M&&i.classList.add(k==="asc"?"sort-asc":"sort-desc")}),d.hidden=!1,l.hidden=!0,n.textContent=`${e.length} route${e.length!==1?"s":""}`}o("btn-routes-refresh").addEventListener("click",()=>{F(),P(o("btn-routes-refresh"),"Updated!","Refresh")});document.querySelectorAll("#routes-table th[data-col]").forEach(e=>{e.addEventListener("click",()=>{const r=e.dataset.col;M===r?k=k==="asc"?"desc":"asc":(M=r,k="asc"),F()})});function K(){const e=v.getDNS(),r=o("dns-content"),d=o("dns-empty"),l=o("dns-magic-badge");if(l.textContent=e.magicDNS?"MagicDNS enabled":"MagicDNS disabled",!(e.resolvers.length>0||Object.keys(e.routes).length>0||e.domains.length>0||e.extraRecords.length>0)){r.hidden=!0,d.hidden=!1;return}r.hidden=!1,d.hidden=!0;const s=o("dns-resolvers-section"),i=o("dns-resolvers-body");if(i.innerHTML="",e.resolvers.length>0){for(const u of e.resolvers){const h=document.createElement("tr"),f=document.createElement("td");f.textContent=u,h.appendChild(f),i.appendChild(h)}s.hidden=!1}else s.hidden=!0;const c=o("dns-routes-section"),p=o("dns-routes-body");p.innerHTML="";const m=Object.keys(e.routes).sort();if(m.length>0){for(const u of m){const h=document.createElement("tr"),f=document.createElement("td");f.textContent=u;const S=document.createElement("td");S.textContent=(e.routes[u]??[]).join(", ")||"(MagicDNS)",h.appendChild(f),h.appendChild(S),p.appendChild(h)}c.hidden=!1}else c.hidden=!0;const g=o("dns-domains-section"),b=o("dns-domains-body");if(b.innerHTML="",e.domains.length>0){for(const u of e.domains){const h=document.createElement("tr"),f=document.createElement("td");f.textContent=u,h.appendChild(f),b.appendChild(h)}g.hidden=!1}else g.hidden=!0;const t=o("dns-records-section"),a=o("dns-records-body");if(a.innerHTML="",e.extraRecords.length>0){for(const u of e.extraRecords){const h=document.createElement("tr");[u.name,u.type,u.value].forEach(f=>{const S=document.createElement("td");S.textContent=f,h.appendChild(S)}),a.appendChild(h)}t.hidden=!1}else t.hidden=!0}o("btn-dns-refresh").addEventListener("click",()=>{K(),P(o("btn-dns-refresh"),"Updated!","Refresh")});const oe={ping:["// ── Ping ──","// ── Fetch ──"],fetch:["// ── Fetch ──","// ── Dial ──"],dial:["// ── Dial ──","// ── Listen ──"],listen:["// ── Listen ──","// ── Serve HTTP ──"],serve:["// ── Serve HTTP ──","// ── Exit node selector ──"],routes:["// ── Exit node selector ──","// ── DNS ──"],dns:["// ── DNS ──","// ── Code viewer ──"]};function re(e){const[r,d]=oe[e]??[];if(!r)return"";const l=Z.split(`
`),n=l.findIndex(i=>i.includes(r)),s=l.findIndex((i,c)=>c>n&&i.includes(d));return l.slice(n,s<0?void 0:s).join(`
`).trim()}function ie(){o("code-modal-tab").textContent=O,o("code-modal-pre").textContent=re(O),o("code-modal").hidden=!1}function W(){o("code-modal").hidden=!0}o("btn-view-code").addEventListener("click",ie);o("btn-close-code").addEventListener("click",W);o("code-modal").addEventListener("click",e=>{e.target===o("code-modal")&&W()});document.addEventListener("keydown",e=>{e.key==="Escape"&&!o("code-modal").hidden&&W()});o("btn-copy-code").addEventListener("click",()=>{const e=o("btn-copy-code");navigator.clipboard.writeText(o("code-modal-pre").textContent??"").then(()=>{const r=e.textContent;e.textContent="Copied!",setTimeout(()=>{e.textContent=r},1400)}).catch(()=>{})});te();
