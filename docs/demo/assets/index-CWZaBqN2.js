(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))c(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&c(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();(()=>{const e=()=>{const c=new Error("not implemented");return c.code="ENOSYS",c};if(!globalThis.fs){let c="";globalThis.fs={constants:{O_WRONLY:-1,O_RDWR:-1,O_CREAT:-1,O_TRUNC:-1,O_APPEND:-1,O_EXCL:-1,O_DIRECTORY:-1},writeSync(s,r){c+=a.decode(r);const i=c.lastIndexOf(`
`);return i!=-1&&(console.log(c.substring(0,i)),c=c.substring(i+1)),r.length},write(s,r,i,d,f,h){if(i!==0||d!==r.length||f!==null){h(e());return}const v=this.writeSync(s,r);h(null,v)},chmod(s,r,i){i(e())},chown(s,r,i,d){d(e())},close(s,r){r(e())},fchmod(s,r,i){i(e())},fchown(s,r,i,d){d(e())},fstat(s,r){r(e())},fsync(s,r){r(null)},ftruncate(s,r,i){i(e())},lchown(s,r,i,d){d(e())},link(s,r,i){i(e())},lstat(s,r){r(e())},mkdir(s,r,i){i(e())},open(s,r,i,d){d(e())},read(s,r,i,d,f,h){h(e())},readdir(s,r){r(e())},readlink(s,r){r(e())},rename(s,r,i){i(e())},rmdir(s,r){r(e())},stat(s,r){r(e())},symlink(s,r,i){i(e())},truncate(s,r,i){i(e())},unlink(s,r){r(e())},utimes(s,r,i,d){d(e())}}}if(globalThis.process||(globalThis.process={getuid(){return-1},getgid(){return-1},geteuid(){return-1},getegid(){return-1},getgroups(){throw e()},pid:-1,ppid:-1,umask(){throw e()},cwd(){throw e()},chdir(){throw e()}}),globalThis.path||(globalThis.path={resolve(...c){return c.join("/")}}),!globalThis.crypto)throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");if(!globalThis.performance)throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");if(!globalThis.TextEncoder)throw new Error("globalThis.TextEncoder is not available, polyfill required");if(!globalThis.TextDecoder)throw new Error("globalThis.TextDecoder is not available, polyfill required");const n=new TextEncoder("utf-8"),a=new TextDecoder("utf-8");globalThis.Go=class{constructor(){this.argv=["js"],this.env={},this.exit=t=>{t!==0&&console.warn("exit code:",t)},this._exitPromise=new Promise(t=>{this._resolveExitPromise=t}),this._pendingEvent=null,this._scheduledTimeouts=new Map,this._nextCallbackTimeoutID=1;const c=(t,l)=>{this.mem.setUint32(t+0,l,!0),this.mem.setUint32(t+4,Math.floor(l/4294967296),!0)},s=t=>{const l=this.mem.getUint32(t+0,!0),u=this.mem.getInt32(t+4,!0);return l+u*4294967296},r=t=>{const l=this.mem.getFloat64(t,!0);if(l===0)return;if(!isNaN(l))return l;const u=this.mem.getUint32(t,!0);return this._values[u]},i=(t,l)=>{if(typeof l=="number"&&l!==0){if(isNaN(l)){this.mem.setUint32(t+4,2146959360,!0),this.mem.setUint32(t,0,!0);return}this.mem.setFloat64(t,l,!0);return}if(l===void 0){this.mem.setFloat64(t,0,!0);return}let p=this._ids.get(l);p===void 0&&(p=this._idPool.pop(),p===void 0&&(p=this._values.length),this._values[p]=l,this._goRefCounts[p]=0,this._ids.set(l,p)),this._goRefCounts[p]++;let b=0;switch(typeof l){case"object":l!==null&&(b=1);break;case"string":b=2;break;case"symbol":b=3;break;case"function":b=4;break}this.mem.setUint32(t+4,2146959360|b,!0),this.mem.setUint32(t,p,!0)},d=t=>{const l=s(t+0),u=s(t+8);return new Uint8Array(this._inst.exports.mem.buffer,l,u)},f=t=>{const l=s(t+0),u=s(t+8),p=new Array(u);for(let b=0;b<u;b++)p[b]=r(l+b*8);return p},h=t=>{const l=s(t+0),u=s(t+8);return a.decode(new DataView(this._inst.exports.mem.buffer,l,u))},v=(t,l)=>(this._inst.exports.testExport0(),this._inst.exports.testExport(t,l)),g=Date.now()-performance.now();this.importObject={_gotest:{add:(t,l)=>t+l,callExport:v},gojs:{"runtime.wasmExit":t=>{t>>>=0;const l=this.mem.getInt32(t+8,!0);this.exited=!0,delete this._inst,delete this._values,delete this._goRefCounts,delete this._ids,delete this._idPool,this.exit(l)},"runtime.wasmWrite":t=>{t>>>=0;const l=s(t+8),u=s(t+16),p=this.mem.getInt32(t+24,!0);fs.writeSync(l,new Uint8Array(this._inst.exports.mem.buffer,u,p))},"runtime.resetMemoryDataView":t=>{this.mem=new DataView(this._inst.exports.mem.buffer)},"runtime.nanotime1":t=>{t>>>=0,c(t+8,(g+performance.now())*1e6)},"runtime.walltime":t=>{t>>>=0;const l=new Date().getTime();c(t+8,l/1e3),this.mem.setInt32(t+16,l%1e3*1e6,!0)},"runtime.scheduleTimeoutEvent":t=>{t>>>=0;const l=this._nextCallbackTimeoutID;this._nextCallbackTimeoutID++,this._scheduledTimeouts.set(l,setTimeout(()=>{for(this._resume();this._scheduledTimeouts.has(l);)console.warn("scheduleTimeoutEvent: missed timeout event"),this._resume()},s(t+8))),this.mem.setInt32(t+16,l,!0)},"runtime.clearTimeoutEvent":t=>{t>>>=0;const l=this.mem.getInt32(t+8,!0);clearTimeout(this._scheduledTimeouts.get(l)),this._scheduledTimeouts.delete(l)},"runtime.getRandomData":t=>{t>>>=0,crypto.getRandomValues(d(t+8))},"syscall/js.finalizeRef":t=>{t>>>=0;const l=this.mem.getUint32(t+8,!0);if(this._goRefCounts[l]--,this._goRefCounts[l]===0){const u=this._values[l];this._values[l]=null,this._ids.delete(u),this._idPool.push(l)}},"syscall/js.stringVal":t=>{t>>>=0,i(t+24,h(t+8))},"syscall/js.valueGet":t=>{t>>>=0;const l=Reflect.get(r(t+8),h(t+16));t=this._inst.exports.getsp()>>>0,i(t+32,l)},"syscall/js.valueSet":t=>{t>>>=0,Reflect.set(r(t+8),h(t+16),r(t+32))},"syscall/js.valueDelete":t=>{t>>>=0,Reflect.deleteProperty(r(t+8),h(t+16))},"syscall/js.valueIndex":t=>{t>>>=0,i(t+24,Reflect.get(r(t+8),s(t+16)))},"syscall/js.valueSetIndex":t=>{t>>>=0,Reflect.set(r(t+8),s(t+16),r(t+24))},"syscall/js.valueCall":t=>{t>>>=0;try{const l=r(t+8),u=Reflect.get(l,h(t+16)),p=f(t+32),b=Reflect.apply(u,l,p);t=this._inst.exports.getsp()>>>0,i(t+56,b),this.mem.setUint8(t+64,1)}catch(l){t=this._inst.exports.getsp()>>>0,i(t+56,l),this.mem.setUint8(t+64,0)}},"syscall/js.valueInvoke":t=>{t>>>=0;try{const l=r(t+8),u=f(t+16),p=Reflect.apply(l,void 0,u);t=this._inst.exports.getsp()>>>0,i(t+40,p),this.mem.setUint8(t+48,1)}catch(l){t=this._inst.exports.getsp()>>>0,i(t+40,l),this.mem.setUint8(t+48,0)}},"syscall/js.valueNew":t=>{t>>>=0;try{const l=r(t+8),u=f(t+16),p=Reflect.construct(l,u);t=this._inst.exports.getsp()>>>0,i(t+40,p),this.mem.setUint8(t+48,1)}catch(l){t=this._inst.exports.getsp()>>>0,i(t+40,l),this.mem.setUint8(t+48,0)}},"syscall/js.valueLength":t=>{t>>>=0,c(t+16,parseInt(r(t+8).length))},"syscall/js.valuePrepareString":t=>{t>>>=0;const l=n.encode(String(r(t+8)));i(t+16,l),c(t+24,l.length)},"syscall/js.valueLoadString":t=>{t>>>=0;const l=r(t+8);d(t+16).set(l)},"syscall/js.valueInstanceOf":t=>{t>>>=0,this.mem.setUint8(t+24,r(t+8)instanceof r(t+16)?1:0)},"syscall/js.copyBytesToGo":t=>{t>>>=0;const l=d(t+8),u=r(t+32);if(!(u instanceof Uint8Array||u instanceof Uint8ClampedArray)){this.mem.setUint8(t+48,0);return}const p=u.subarray(0,l.length);l.set(p),c(t+40,p.length),this.mem.setUint8(t+48,1)},"syscall/js.copyBytesToJS":t=>{t>>>=0;const l=r(t+8),u=d(t+16);if(!(l instanceof Uint8Array||l instanceof Uint8ClampedArray)){this.mem.setUint8(t+48,0);return}const p=u.subarray(0,l.length);l.set(p),c(t+40,p.length),this.mem.setUint8(t+48,1)},debug:t=>{console.log(t)}}}}async run(c){if(!(c instanceof WebAssembly.Instance))throw new Error("Go.run: WebAssembly.Instance expected");this._inst=c,this.mem=new DataView(this._inst.exports.mem.buffer),this._values=[NaN,0,null,!0,!1,globalThis,this],this._goRefCounts=new Array(this._values.length).fill(1/0),this._ids=new Map([[0,1],[null,2],[!0,3],[!1,4],[globalThis,5],[this,6]]),this._idPool=[],this.exited=!1;let s=4096;const r=g=>{const t=s,l=n.encode(g+"\0");return new Uint8Array(this.mem.buffer,s,l.length).set(l),s+=l.length,s%8!==0&&(s+=8-s%8),t},i=this.argv.length,d=[];this.argv.forEach(g=>{d.push(r(g))}),d.push(0),Object.keys(this.env).sort().forEach(g=>{d.push(r(`${g}=${this.env[g]}`))}),d.push(0);const h=s;if(d.forEach(g=>{this.mem.setUint32(s,g,!0),this.mem.setUint32(s+4,0,!0),s+=8}),s>=12288)throw new Error("total length of command line and environment variables exceeds limit");this._inst.exports.run(i,h),this.exited&&this._resolveExitPromise(),await this._exitPromise}_resume(){if(this.exited)throw new Error("Go program has already exited");this._inst.exports.resume(),this.exited&&this._resolveExitPromise()}_makeFuncWrapper(c){const s=this;return function(){const r={id:c,this:this,args:arguments};return s._pendingEvent=r,s._resume(),r.result}}}})();const ce=""+new URL("main-DUVvpFrQ.wasm",import.meta.url).href;(()=>{const e=globalThis,n="process";e[n]?e[n].pid==null&&(e[n].pid=1):e[n]={pid:1}})();let z=!1;async function de(){if(z)return;const e=new globalThis.Go,n=await WebAssembly.instantiateStreaming(fetch(ce),e.importObject);e.run(n.instance),z=!0}function w(){return globalThis.__tailscaleWeb}function ue(e){return{status:e.status,statusText:e.statusText,ok:e.ok,headers:e.headers,text:async()=>new TextDecoder().decode(e.body),json:async()=>JSON.parse(new TextDecoder().decode(e.body)),arrayBuffer:async()=>e.body.buffer,bytes:async()=>e.body}}const y={async init(e={}){return await de(),w().init(e)},async ping(e){return w().ping(e)},async dialTCP(e){const n=await w().dialTCP(e);return{onData(a){n.onData(a)},write(a){n.write(typeof a=="string"?new TextEncoder().encode(a):a)},close(){n.close()}}},async listenTCP(e=0,n){const a=await w().listenTCP(e,c=>{n({onData(s){c.onData(s)},write(s){c.write(typeof s=="string"?new TextEncoder().encode(s):s)},close(){c.close()}})});return{port:a.port,close(){a.close()}}},async fetch(e,n={}){return ue(await w().fetch(e,n))},localIPv4(){return w().localIPv4()},localIPv6(){return w().localIPv6()},getPrefs(){return w().getPrefs()},async setAcceptRoutes(e){return w().setAcceptRoutes(e)},listExitNodes(){return Array.from(w().listExitNodes())},async setExitNode(e=""){return w().setExitNode(e)},getRoutes(){return Array.from(w().getRoutes())},getDNS(){return w().getDNS()}},pe=`import { network, type Connection, type Listener, type PingResult } from "tailscale-web";
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

// ── iperf3 ────────────────────────────────────────────────────────────────────
//
// Implements an iperf3 TCP server. The browser acts as the iperf3 server;
// run \`iperf3 -c <tailscale-ip> -p <port>\` from any tailnet peer to test
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
  if (n >= 1e9) return \`\${(n / 1e9).toFixed(2)} GBytes\`;
  if (n >= 1e6) return \`\${(n / 1e6).toFixed(2)} MBytes\`;
  if (n >= 1e3) return \`\${(n / 1e3).toFixed(2)} KBytes\`;
  return \`\${n} Bytes\`;
}

function i3FmtBits(bps: number): string {
  if (bps >= 1e9) return \`\${(bps / 1e9).toFixed(2)} Gbits/sec\`;
  if (bps >= 1e6) return \`\${(bps / 1e6).toFixed(2)} Mbits/sec\`;
  if (bps >= 1e3) return \`\${(bps / 1e3).toFixed(2)} Kbits/sec\`;
  return \`\${bps.toFixed(2)} bits/sec\`;
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
    appendLine("iperf3-output", "line-err", \`  error: \${err}\`);
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

  const blockSize = params.len ? \`\${params.len}B blocks\` : "default blocks";
  appendLine(
    "iperf3-output",
    "line-meta",
    \`→ test: \${numStreams} stream(s), \${duration}s, \${blockSize}\`,
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
      \`  timeout: \${session.dataConns.length}/\${numStreams} streams connected\`,
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
      \`  [SUM]  \${(intervalSec - 1).toFixed(1)}-\${intervalSec.toFixed(1)} sec  \${i3FmtBytes(db).padEnd(16)}  \${i3FmtBits(db * 8)}\`,
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
      \`  unexpected state byte: \${testEndBuf[0]}\`,
    );
    return;
  }

  appendLine(
    "iperf3-output",
    "line-ok",
    \`  [SUM]  0.0-\${elapsed.toFixed(2)} sec  \${i3FmtBytes(totalBytes).padEnd(16)}  \${i3FmtBits((totalBytes * 8) / elapsed)}\`,
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
        appendLine("iperf3-output", "line-err", \`error: \${err}\`),
      );
    });

    iperf3Listener = listener;
    el("iperf3-output").textContent = "";
    text("iperf3-assigned-port", String(listener.port));
    appendLine(
      "iperf3-output",
      "line-meta",
      \`iperf3 server listening on port \${listener.port}…\`,
    );
    const myIP =
      network.localIPv4() || network.localIPv6() || "<tailscale-ip>";
    appendLine(
      "iperf3-output",
      "line-meta",
      \`  run: iperf3 -c \${myIP} -p \${listener.port}\`,
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
`;function he(){return localStorage.getItem("theme")??(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}function te(e){document.documentElement.setAttribute("data-theme",e),localStorage.setItem("theme",e),o("ts-logo").classList.toggle("invert",e==="dark")}function o(e){return document.getElementById(e)}function E(e){o(e).hidden=!1}function x(e){o(e).hidden=!0}function C(e,n){o(e).textContent=n}const Q=new WeakMap;function P(e,n,a,c=1400){clearTimeout(Q.get(e)),e.textContent=n,e.classList.add("btn-flash"),Q.set(e,setTimeout(()=>{e.textContent=a,e.classList.remove("btn-flash")},c))}const $={};let j="ping";document.querySelectorAll(".nav-tab").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".nav-tab").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".tab-panel").forEach(a=>{a.hidden=!0}),e.classList.add("active");const n=e.dataset.tab;j=n,o(`tab-${n}`).hidden=!1,$[n]?.(),delete $[n]})});let B=null;function L(e,n){const a=o(e);a.textContent=n,a.hidden=!1}async function fe(){te(he());try{await y.init({hostname:"tailscale-web-playground",onAuthRequired(e){B=e,x("login-status"),E("btn-auth")},onAuthComplete(){B=null}}),be(),await me()}catch(e){L("error-login",String(e))}}o("btn-auth").addEventListener("click",()=>{B&&window.open(B,"_blank","width=600,height=700")});o("btn-disconnect").addEventListener("click",()=>{localStorage.clear(),location.reload()});o("btn-theme").addEventListener("click",()=>{const e=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";te(e)});const D="ts-exit-node-id";async function me(){const e=localStorage.getItem(D);if(!(!e||!y.listExitNodes().find(a=>a.id===e)))try{await y.setExitNode(e),A(),U()}catch{}}function U(){const{exitNodeId:e}=y.getPrefs();let n="<none>";if(e){const a=y.listExitNodes().find(c=>c.id===e);n=a?a.hostName||a.dnsName:e}o("exit-node-name").textContent=n}function be(){x("screen-login"),E("screen-app"),U();const e=y.localIPv4(),n=y.localIPv6();e&&C("vpn-ipv4",e),n&&C("vpn-ipv6",n),(e||n)&&E("vpn-addrs"),$.routes=J,$.dns=se}let I=!1;function H(e,n,a){const c=o("ping-stats"),s=e-a,r=e>0?Math.round(a/e*100):0;let i=`${e} transmitted, ${s} received, ${r}% packet loss`;if(n.length>0){const d=Math.min(...n).toFixed(3),f=(n.reduce((v,g)=>v+g,0)/n.length).toFixed(3),h=Math.max(...n).toFixed(3);i+=`
rtt min/avg/max = ${d}/${f}/${h} ms`}c.textContent=i,c.hidden=!1}o("btn-ping").addEventListener("click",async()=>{const e=o("btn-ping"),n=o("ping-output");if(I){I=!1;return}const a=o("ping-addr").value.trim();if(!a)return;I=!0,e.textContent="Stop",n.innerHTML="",n.hidden=!1,o("ping-stats").hidden=!0;let c=0,s=[],r=0;for(m("ping-output","line-meta",`PING ${a}`);I;){c++;let i;try{i=await y.ping(a)}catch(d){r++,m("ping-output","line-err",`icmp_seq=${c}  error: ${d}`),H(c,s,r),await new Promise(f=>setTimeout(f,1e3));continue}if(!I)break;if(i.alive){s.push(i.rttMs);const d=i.derpRegionCode?`via DERP(${i.derpRegionCode})`:i.endpoint?"direct":"",f=[`icmp_seq=${c}`,`time=${i.rttMs.toFixed(3)} ms`,d,i.endpoint?`endpoint=${i.endpoint}`:"",i.nodeName?`node=${i.nodeName}`:"",i.nodeIP?`ip=${i.nodeIP}`:""].filter(Boolean).join("  ");m("ping-output","line-ok",f)}else{r++;const d=i.err?` (${i.err})`:"";m("ping-output","line-err",`icmp_seq=${c}  timeout${d}`)}H(c,s,r),I&&await new Promise(d=>setTimeout(d,1e3))}m("ping-output","line-meta",`--- ${a} ping statistics ---`),H(c,s,r),e.textContent="Ping"});let q="";o("btn-fetch").addEventListener("click",async()=>{const e=o("fetch-url").value.trim(),n=o("fetch-method").value,a=o("fetch-headers").value.trim(),c=o("fetch-body").value;if(!e)return;const s=o("btn-fetch");s.disabled=!0,s.textContent="Sending…",x("fetch-result");try{const r={};for(const t of a.split(`
`)){const l=t.indexOf(":");l>0&&(r[t.slice(0,l).trim()]=t.slice(l+1).trim())}const i=await y.fetch(e,{method:n,headers:Object.keys(r).length?r:void 0,body:c||void 0}),d=o("fetch-status");d.textContent=String(i.status),d.className=`status-chip ${i.ok?"ok":"err"}`,C("fetch-status-text",i.statusText);const f=Object.entries(i.headers).map(([t,l])=>`${t}: ${l}`).join(`
`);C("fetch-headers-out",f);const h=await i.text();try{C("fetch-body-out",JSON.stringify(JSON.parse(h),null,2))}catch{C("fetch-body-out",h)}const v=Object.entries(i.headers).find(([t])=>t.toLowerCase()==="content-type")?.[1]?.toLowerCase()??"",g=o("fetch-preview");g.hidden=!0,o("fetch-body-out").hidden=!1,v.includes("text/html")?(q=h,o("fetch-view-toggle").hidden=!1,o("btn-view-raw").classList.add("btn-primary"),o("btn-view-preview").classList.remove("btn-primary")):(q="",o("fetch-view-toggle").hidden=!0),E("fetch-result")}catch(r){L("fetch-error",String(r))}finally{s.disabled=!1,s.textContent="Send"}});o("btn-view-raw").addEventListener("click",()=>{const e=o("fetch-preview");e.src.startsWith("blob:")&&(URL.revokeObjectURL(e.src),e.removeAttribute("src")),o("fetch-body-out").hidden=!1,e.hidden=!0,o("btn-view-raw").classList.add("btn-primary"),o("btn-view-preview").classList.remove("btn-primary")});o("btn-view-preview").addEventListener("click",()=>{const e=o("fetch-preview");e.src.startsWith("blob:")&&URL.revokeObjectURL(e.src);const n=o("fetch-url").value.trim();let a=q;/<base\b/i.test(a)||(a=/<head\b/i.test(a)?a.replace(/(<head[^>]*>)/i,`$1<base href="${n}">`):`<base href="${n}">`+a);const c=new Blob([a],{type:"text/html"});e.src=URL.createObjectURL(c),o("fetch-body-out").hidden=!0,e.hidden=!1,o("btn-view-raw").classList.remove("btn-primary"),o("btn-view-preview").classList.add("btn-primary")});let R=null;function m(e,n,a){const c=o(e),s=document.createElement("span");s.className=n,s.textContent=a+`
`,c.appendChild(s),c.scrollTop=c.scrollHeight}o("btn-dial-connect").addEventListener("click",async()=>{const e=o("dial-addr").value.trim(),n=o("btn-dial-connect");if(e){n.disabled=!0,n.textContent="Connecting…";try{const a=await y.dialTCP(e);R=a,a.onData(c=>{m("dial-output","line-recv",new TextDecoder().decode(c))}),C("dial-connected-addr",e),o("dial-output").textContent="",m("dial-output","line-meta",`connected to ${e}`),x("dial-connect-form"),E("dial-session"),o("dial-send-input").focus()}catch(a){L("dial-error",String(a))}finally{n.disabled=!1,n.textContent="Connect"}}});function ne(){const e=o("dial-send-input"),n=e.value;!n||!R||(R.write(n+`
`),m("dial-output","line-sent",n),e.value="")}o("btn-dial-send").addEventListener("click",ne);o("dial-send-input").addEventListener("keydown",e=>{e.key==="Enter"&&ne()});o("btn-dial-disconnect").addEventListener("click",()=>{R?.close(),R=null,m("dial-output","line-meta","disconnected"),x("dial-session"),E("dial-connect-form")});let G=null,O=0;o("btn-listen-start").addEventListener("click",async()=>{const e=o("listen-port"),n=o("btn-listen-start"),a=parseInt(e.value||"0",10);x("listen-error"),n.disabled=!0,n.textContent="Listening…";try{const c=await y.listenTCP(a,s=>{O++;const r=O;m("listen-output","line-ok",`→ connection #${r} accepted`),s.onData(i=>{const d=new TextDecoder().decode(i);m("listen-output","line-recv",`  [#${r}] ${d.trimEnd()}`)})});G=c,O=0,o("listen-output").textContent="",C("listen-assigned-port",String(c.port)),m("listen-output","line-meta",`listening on port ${c.port}…`),x("listen-form"),E("listen-session")}catch(c){L("listen-error",String(c)),n.disabled=!1,n.textContent="Listen"}});o("btn-listen-stop").addEventListener("click",()=>{G?.close(),G=null,m("listen-output","line-meta","listener stopped"),x("listen-session"),E("listen-form"),o("btn-listen-start").disabled=!1,o("btn-listen-start").textContent="Listen"});let V=null,F=0;o("btn-serve-start").addEventListener("click",async()=>{const e=o("btn-serve-start"),n=parseInt(o("serve-port").value||"0",10);x("serve-error"),e.disabled=!0,e.textContent="Starting…";try{const a=await y.listenTCP(n,c=>{F++;const s=F;let r="";c.onData(i=>{if(r+=new TextDecoder().decode(i),!r.includes(`\r
\r
`))return;const d=r.split(`\r
`)[0]??"";m("serve-output","line-ok",`→ [#${s}] ${d}`);const f=o("serve-html").value,h=new TextEncoder().encode(f),v=`HTTP/1.1 200 OK\r
Content-Type: text/html; charset=utf-8\r
Content-Length: ${h.length}\r
Connection: close\r
\r
`+f;c.write(v),c.close(),m("serve-output","line-meta",`  [#${s}] 200 OK — ${h.length} bytes`)})});V=a,F=0,o("serve-output").textContent="",C("serve-assigned-port",String(a.port)),m("serve-output","line-meta",`listening on port ${a.port}…`),x("serve-form"),E("serve-session")}catch(a){L("serve-error",String(a)),e.disabled=!1,e.textContent="Serve"}});o("btn-serve-stop").addEventListener("click",()=>{V?.close(),V=null,m("serve-output","line-meta","server stopped"),x("serve-session"),E("serve-form"),o("btn-serve-start").disabled=!1,o("btn-serve-start").textContent="Serve"});function A(){const e=o("exit-node-select"),n=y.getPrefs().exitNodeId,a=y.listExitNodes();e.innerHTML="";const c=document.createElement("option");c.value="",c.textContent="(none — direct connection)",e.appendChild(c);for(const s of a){const r=document.createElement("option");r.value=s.id,r.textContent=`${s.hostName||s.dnsName}${s.online?"":" (offline)"}`,s.online||(r.style.color="var(--text-muted)"),e.appendChild(r)}e.value=n}o("btn-exit-node-set").addEventListener("click",async()=>{const e=o("exit-node-select"),n=o("btn-exit-node-set"),a=o("exit-node-error");a.hidden=!0,n.disabled=!0,n.textContent="Saving…";try{await y.setExitNode(e.value),e.value?localStorage.setItem(D,e.value):localStorage.removeItem(D),A(),U(),n.disabled=!1,P(n,"Saved!","Set")}catch(c){L("exit-node-error",String(c)),n.disabled=!1,n.textContent="Set"}});o("btn-exit-node-clear").addEventListener("click",async()=>{const e=o("btn-exit-node-clear"),n=o("exit-node-error");n.hidden=!0,e.disabled=!0,e.textContent="Clearing…";try{await y.setExitNode(""),localStorage.removeItem(D),A(),U(),e.disabled=!1,P(e,"Cleared!","Clear")}catch(a){L("exit-node-error",String(a)),e.disabled=!1,e.textContent="Clear"}});let M="prefix",_="asc";function J(){A();const e=y.getRoutes(),n=o("routes-body"),a=o("routes-table"),c=o("routes-empty"),s=o("routes-count");if(n.innerHTML="",e.length===0){a.hidden=!0,c.hidden=!1,s.textContent="";return}const r=[...e].sort((i,d)=>{let f,h;switch(M){case"prefix":f=i.prefix,h=d.prefix;break;case"via":f=i.via,h=d.via;break;case"type":f=i.isExitRoute?"exit":"route",h=d.isExitRoute?"exit":"route";break;case"status":f=i.isPrimary?0:1,h=d.isPrimary?0:1;break}const v=f<h?-1:f>h?1:0;return _==="asc"?v:-v});for(const i of r){const d=document.createElement("tr"),f=document.createElement("td");f.textContent=i.prefix,d.appendChild(f);const h=document.createElement("td"),v=document.createElement("span");v.className=i.via==="self"?"tag tag-self":"tag tag-peer",v.textContent=i.via,h.appendChild(v),d.appendChild(h);const g=document.createElement("td");if(i.isExitRoute){const u=document.createElement("span");u.className="tag tag-exit",u.textContent="exit",g.appendChild(u)}else g.textContent="route",g.style.color="var(--text-muted)";d.appendChild(g);const t=document.createElement("td"),l=document.createElement("span");l.className=i.isPrimary?"status-dot status-dot-active":"status-dot status-dot-inactive",t.appendChild(l),d.appendChild(t),n.appendChild(d)}document.querySelectorAll("#routes-table th[data-col]").forEach(i=>{i.classList.remove("sort-asc","sort-desc"),i.dataset.col===M&&i.classList.add(_==="asc"?"sort-asc":"sort-desc")}),a.hidden=!1,c.hidden=!0,s.textContent=`${e.length} route${e.length!==1?"s":""}`}o("btn-routes-refresh").addEventListener("click",()=>{J(),P(o("btn-routes-refresh"),"Updated!","Refresh")});document.querySelectorAll("#routes-table th[data-col]").forEach(e=>{e.addEventListener("click",()=>{const n=e.dataset.col;M===n?_=_==="asc"?"desc":"asc":(M=n,_="asc"),J()})});function se(){const e=y.getDNS(),n=o("dns-content"),a=o("dns-empty"),c=o("dns-magic-badge");if(c.textContent=e.magicDNS?"MagicDNS enabled":"MagicDNS disabled",!(e.resolvers.length>0||Object.keys(e.routes).length>0||e.domains.length>0||e.extraRecords.length>0)){n.hidden=!0,a.hidden=!1;return}n.hidden=!1,a.hidden=!0;const r=o("dns-resolvers-section"),i=o("dns-resolvers-body");if(i.innerHTML="",e.resolvers.length>0){for(const u of e.resolvers){const p=document.createElement("tr"),b=document.createElement("td");b.textContent=u,p.appendChild(b),i.appendChild(p)}r.hidden=!1}else r.hidden=!0;const d=o("dns-routes-section"),f=o("dns-routes-body");f.innerHTML="";const h=Object.keys(e.routes).sort();if(h.length>0){for(const u of h){const p=document.createElement("tr"),b=document.createElement("td");b.textContent=u;const S=document.createElement("td");S.textContent=(e.routes[u]??[]).join(", ")||"(MagicDNS)",p.appendChild(b),p.appendChild(S),f.appendChild(p)}d.hidden=!1}else d.hidden=!0;const v=o("dns-domains-section"),g=o("dns-domains-body");if(g.innerHTML="",e.domains.length>0){for(const u of e.domains){const p=document.createElement("tr"),b=document.createElement("td");b.textContent=u,p.appendChild(b),g.appendChild(p)}v.hidden=!1}else v.hidden=!0;const t=o("dns-records-section"),l=o("dns-records-body");if(l.innerHTML="",e.extraRecords.length>0){for(const u of e.extraRecords){const p=document.createElement("tr");[u.name,u.type,u.value].forEach(b=>{const S=document.createElement("td");S.textContent=b,p.appendChild(S)}),l.appendChild(p)}t.hidden=!1}else t.hidden=!0}o("btn-dns-refresh").addEventListener("click",()=>{se(),P(o("btn-dns-refresh"),"Updated!","Refresh")});class ge{chunks=[];available=0;waiters=[];push(n){this.chunks.push(n),this.available+=n.byteLength,this.drain()}read(n){return new Promise((a,c)=>{this.waiters.push({n,resolve:a,reject:c}),this.drain()})}drain(){for(;this.waiters.length>0&&this.available>=this.waiters[0].n;){const{n,resolve:a}=this.waiters.shift();a(this.consume(n))}}consume(n){const a=new Uint8Array(n);let c=0;for(;c<n;){const s=this.chunks[0],r=Math.min(s.byteLength,n-c);a.set(s.subarray(0,r),c),c+=r,r===s.byteLength?this.chunks.shift():this.chunks[0]=s.subarray(r)}return this.available-=n,a}}const N=new Map;let W=null;const ve=9,ye=10,xe=1,we=2,Ee=4,Ce=13,Se=14,Te=15;function Le(e){const n=new Uint8Array(4);return new DataView(n.buffer).setUint32(0,e,!1),n}function Z(e){return e>=1e9?`${(e/1e9).toFixed(2)} GBytes`:e>=1e6?`${(e/1e6).toFixed(2)} MBytes`:e>=1e3?`${(e/1e3).toFixed(2)} KBytes`:`${e} Bytes`}function ee(e){return e>=1e9?`${(e/1e9).toFixed(2)} Gbits/sec`:e>=1e6?`${(e/1e6).toFixed(2)} Mbits/sec`:e>=1e3?`${(e/1e3).toFixed(2)} Kbits/sec`:`${e.toFixed(2)} bits/sec`}async function ke(e){const n=new ge;let a=0;e.onData(d=>{a+=d.byteLength,n.push(d)});let c;try{c=await n.read(37)}catch{e.close();return}const s=new TextDecoder().decode(c.subarray(0,36)),r=N.get(s);if(r){const d={conn:e,get bytes(){return a-37}};r.dataConns.push(d);return}const i={cookie:s,controlConn:e,controlReader:n,dataConns:[],numStreams:1};N.set(s,i);try{await Ie(i)}catch(d){m("iperf3-output","line-err",`  error: ${d}`)}finally{N.delete(s);for(const d of i.dataConns)d.conn.close();e.close()}}async function Ie(e){const{controlConn:n,controlReader:a}=e;n.write(new Uint8Array([ve]));const c=await a.read(4),s=new DataView(c.buffer).getUint32(0,!1),r=await a.read(s),i=JSON.parse(new TextDecoder().decode(r)),d=i.parallel||1,f=i.time||10,h=!!i.reverse;if(e.numStreams=d,h){m("iperf3-output","line-err","  reverse mode not supported");return}const v=i.len?`${i.len}B blocks`:"default blocks";m("iperf3-output","line-meta",`→ test: ${d} stream(s), ${f}s, ${v}`),n.write(new Uint8Array([ye]));const g=Date.now()+5e3;for(;e.dataConns.length<d&&Date.now()<g;)await new Promise(T=>setTimeout(T,20));if(e.dataConns.length<d){m("iperf3-output","line-err",`  timeout: ${e.dataConns.length}/${d} streams connected`);return}const t=performance.now();n.write(new Uint8Array([xe])),n.write(new Uint8Array([we])),m("iperf3-output","line-meta","  [ ID]  Interval            Transfer        Bandwidth");let l=0,u=0;const p=setInterval(()=>{u++;const T=e.dataConns.reduce((ae,le)=>ae+le.bytes,0),k=T-l;m("iperf3-output","line-recv",`  [SUM]  ${(u-1).toFixed(1)}-${u.toFixed(1)} sec  ${Z(k).padEnd(16)}  ${ee(k*8)}`),l=T},1e3),b=await a.read(1);clearInterval(p);const S=(performance.now()-t)/1e3,K=e.dataConns.reduce((T,k)=>T+k.bytes,0);if(b[0]!==Ee){m("iperf3-output","line-err",`  unexpected state byte: ${b[0]}`);return}m("iperf3-output","line-ok",`  [SUM]  0.0-${S.toFixed(2)} sec  ${Z(K).padEnd(16)}  ${ee(K*8/S)}`),n.write(new Uint8Array([Ce]));const re=await a.read(4),oe=new DataView(re.buffer).getUint32(0,!1);await a.read(oe);const ie=JSON.stringify({cpu_util_total:0,cpu_util_user:0,cpu_util_system:0,sender_has_retransmits:0,streams:e.dataConns.map((T,k)=>({id:k+1,bytes:T.bytes,retransmits:-1,jitter:0,errors:0,packets:0}))}),Y=new TextEncoder().encode(ie);n.write(Le(Y.byteLength)),n.write(Y),n.write(new Uint8Array([Se])),n.write(new Uint8Array([Te]))}o("btn-iperf3-start").addEventListener("click",async()=>{const e=o("btn-iperf3-start"),n=parseInt(o("iperf3-port").value||"5201",10);x("iperf3-error"),e.disabled=!0,e.textContent="Starting…";try{const a=await y.listenTCP(n,s=>{ke(s).catch(r=>m("iperf3-output","line-err",`error: ${r}`))});W=a,o("iperf3-output").textContent="",C("iperf3-assigned-port",String(a.port)),m("iperf3-output","line-meta",`iperf3 server listening on port ${a.port}…`);const c=y.localIPv4()||y.localIPv6()||"<tailscale-ip>";m("iperf3-output","line-meta",`  run: iperf3 -c ${c} -p ${a.port}`),x("iperf3-form"),E("iperf3-session")}catch(a){L("iperf3-error",String(a)),e.disabled=!1,e.textContent="Start"}});o("btn-iperf3-stop").addEventListener("click",()=>{W?.close(),W=null,N.clear(),m("iperf3-output","line-meta","server stopped"),x("iperf3-session"),E("iperf3-form"),o("btn-iperf3-start").disabled=!1,o("btn-iperf3-start").textContent="Start"});const _e={ping:["// ── Ping ──","// ── Fetch ──"],fetch:["// ── Fetch ──","// ── Dial ──"],dial:["// ── Dial ──","// ── Listen ──"],listen:["// ── Listen ──","// ── Serve HTTP ──"],serve:["// ── Serve HTTP ──","// ── Exit node selector ──"],routes:["// ── Exit node selector ──","// ── DNS ──"],dns:["// ── DNS ──","// ── iperf3 ──"],iperf3:["// ── iperf3 ──","// ── Code viewer ──"]};function Re(e){const[n,a]=_e[e]??[];if(!n)return"";const c=pe.split(`
`),s=c.findIndex(i=>i.includes(n)),r=c.findIndex((i,d)=>d>s&&i.includes(a));return c.slice(s,r<0?void 0:r).join(`
`).trim()}function Ne(){o("code-modal-tab").textContent=j,o("code-modal-pre").textContent=Re(j),o("code-modal").hidden=!1}function X(){o("code-modal").hidden=!0}o("btn-view-code").addEventListener("click",Ne);o("btn-close-code").addEventListener("click",X);o("code-modal").addEventListener("click",e=>{e.target===o("code-modal")&&X()});document.addEventListener("keydown",e=>{e.key==="Escape"&&!o("code-modal").hidden&&X()});o("btn-copy-code").addEventListener("click",()=>{const e=o("btn-copy-code");navigator.clipboard.writeText(o("code-modal-pre").textContent??"").then(()=>{const n=e.textContent;e.textContent="Copied!",setTimeout(()=>{e.textContent=n},1400)}).catch(()=>{})});fe();
