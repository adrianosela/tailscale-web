(() => {
  const n = () => {
    const c = new Error("not implemented");
    return c.code = "ENOSYS", c;
  };
  if (!globalThis.fs) {
    let c = "";
    globalThis.fs = {
      constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1, O_DIRECTORY: -1 },
      // unused
      writeSync(i, s) {
        c += g.decode(s);
        const r = c.lastIndexOf(`
`);
        return r != -1 && (console.log(c.substring(0, r)), c = c.substring(r + 1)), s.length;
      },
      write(i, s, r, a, y, u) {
        if (r !== 0 || a !== s.length || y !== null) {
          u(n());
          return;
        }
        const w = this.writeSync(i, s);
        u(null, w);
      },
      chmod(i, s, r) {
        r(n());
      },
      chown(i, s, r, a) {
        a(n());
      },
      close(i, s) {
        s(n());
      },
      fchmod(i, s, r) {
        r(n());
      },
      fchown(i, s, r, a) {
        a(n());
      },
      fstat(i, s) {
        s(n());
      },
      fsync(i, s) {
        s(null);
      },
      ftruncate(i, s, r) {
        r(n());
      },
      lchown(i, s, r, a) {
        a(n());
      },
      link(i, s, r) {
        r(n());
      },
      lstat(i, s) {
        s(n());
      },
      mkdir(i, s, r) {
        r(n());
      },
      open(i, s, r, a) {
        a(n());
      },
      read(i, s, r, a, y, u) {
        u(n());
      },
      readdir(i, s) {
        s(n());
      },
      readlink(i, s) {
        s(n());
      },
      rename(i, s, r) {
        r(n());
      },
      rmdir(i, s) {
        s(n());
      },
      stat(i, s) {
        s(n());
      },
      symlink(i, s, r) {
        r(n());
      },
      truncate(i, s, r) {
        r(n());
      },
      unlink(i, s) {
        s(n());
      },
      utimes(i, s, r, a) {
        a(n());
      }
    };
  }
  if (globalThis.process || (globalThis.process = {
    getuid() {
      return -1;
    },
    getgid() {
      return -1;
    },
    geteuid() {
      return -1;
    },
    getegid() {
      return -1;
    },
    getgroups() {
      throw n();
    },
    pid: -1,
    ppid: -1,
    umask() {
      throw n();
    },
    cwd() {
      throw n();
    },
    chdir() {
      throw n();
    }
  }), globalThis.path || (globalThis.path = {
    resolve(...c) {
      return c.join("/");
    }
  }), !globalThis.crypto)
    throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
  if (!globalThis.performance)
    throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
  if (!globalThis.TextEncoder)
    throw new Error("globalThis.TextEncoder is not available, polyfill required");
  if (!globalThis.TextDecoder)
    throw new Error("globalThis.TextDecoder is not available, polyfill required");
  const h = new TextEncoder("utf-8"), g = new TextDecoder("utf-8");
  globalThis.Go = class {
    constructor() {
      this.argv = ["js"], this.env = {}, this.exit = (t) => {
        t !== 0 && console.warn("exit code:", t);
      }, this._exitPromise = new Promise((t) => {
        this._resolveExitPromise = t;
      }), this._pendingEvent = null, this._scheduledTimeouts = /* @__PURE__ */ new Map(), this._nextCallbackTimeoutID = 1;
      const c = (t, e) => {
        this.mem.setUint32(t + 0, e, !0), this.mem.setUint32(t + 4, Math.floor(e / 4294967296), !0);
      }, i = (t) => {
        const e = this.mem.getUint32(t + 0, !0), o = this.mem.getInt32(t + 4, !0);
        return e + o * 4294967296;
      }, s = (t) => {
        const e = this.mem.getFloat64(t, !0);
        if (e === 0)
          return;
        if (!isNaN(e))
          return e;
        const o = this.mem.getUint32(t, !0);
        return this._values[o];
      }, r = (t, e) => {
        if (typeof e == "number" && e !== 0) {
          if (isNaN(e)) {
            this.mem.setUint32(t + 4, 2146959360, !0), this.mem.setUint32(t, 0, !0);
            return;
          }
          this.mem.setFloat64(t, e, !0);
          return;
        }
        if (e === void 0) {
          this.mem.setFloat64(t, 0, !0);
          return;
        }
        let l = this._ids.get(e);
        l === void 0 && (l = this._idPool.pop(), l === void 0 && (l = this._values.length), this._values[l] = e, this._goRefCounts[l] = 0, this._ids.set(e, l)), this._goRefCounts[l]++;
        let m = 0;
        switch (typeof e) {
          case "object":
            e !== null && (m = 1);
            break;
          case "string":
            m = 2;
            break;
          case "symbol":
            m = 3;
            break;
          case "function":
            m = 4;
            break;
        }
        this.mem.setUint32(t + 4, 2146959360 | m, !0), this.mem.setUint32(t, l, !0);
      }, a = (t) => {
        const e = i(t + 0), o = i(t + 8);
        return new Uint8Array(this._inst.exports.mem.buffer, e, o);
      }, y = (t) => {
        const e = i(t + 0), o = i(t + 8), l = new Array(o);
        for (let m = 0; m < o; m++)
          l[m] = s(e + m * 8);
        return l;
      }, u = (t) => {
        const e = i(t + 0), o = i(t + 8);
        return g.decode(new DataView(this._inst.exports.mem.buffer, e, o));
      }, w = (t, e) => (this._inst.exports.testExport0(), this._inst.exports.testExport(t, e)), f = Date.now() - performance.now();
      this.importObject = {
        _gotest: {
          add: (t, e) => t + e,
          callExport: w
        },
        gojs: {
          // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
          // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
          // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
          // This changes the SP, thus we have to update the SP used by the imported function.
          // func wasmExit(code int32)
          "runtime.wasmExit": (t) => {
            t >>>= 0;
            const e = this.mem.getInt32(t + 8, !0);
            this.exited = !0, delete this._inst, delete this._values, delete this._goRefCounts, delete this._ids, delete this._idPool, this.exit(e);
          },
          // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
          "runtime.wasmWrite": (t) => {
            t >>>= 0;
            const e = i(t + 8), o = i(t + 16), l = this.mem.getInt32(t + 24, !0);
            fs.writeSync(e, new Uint8Array(this._inst.exports.mem.buffer, o, l));
          },
          // func resetMemoryDataView()
          "runtime.resetMemoryDataView": (t) => {
            this.mem = new DataView(this._inst.exports.mem.buffer);
          },
          // func nanotime1() int64
          "runtime.nanotime1": (t) => {
            t >>>= 0, c(t + 8, (f + performance.now()) * 1e6);
          },
          // func walltime() (sec int64, nsec int32)
          "runtime.walltime": (t) => {
            t >>>= 0;
            const e = (/* @__PURE__ */ new Date()).getTime();
            c(t + 8, e / 1e3), this.mem.setInt32(t + 16, e % 1e3 * 1e6, !0);
          },
          // func scheduleTimeoutEvent(delay int64) int32
          "runtime.scheduleTimeoutEvent": (t) => {
            t >>>= 0;
            const e = this._nextCallbackTimeoutID;
            this._nextCallbackTimeoutID++, this._scheduledTimeouts.set(e, setTimeout(
              () => {
                for (this._resume(); this._scheduledTimeouts.has(e); )
                  console.warn("scheduleTimeoutEvent: missed timeout event"), this._resume();
              },
              i(t + 8)
            )), this.mem.setInt32(t + 16, e, !0);
          },
          // func clearTimeoutEvent(id int32)
          "runtime.clearTimeoutEvent": (t) => {
            t >>>= 0;
            const e = this.mem.getInt32(t + 8, !0);
            clearTimeout(this._scheduledTimeouts.get(e)), this._scheduledTimeouts.delete(e);
          },
          // func getRandomData(r []byte)
          "runtime.getRandomData": (t) => {
            t >>>= 0, crypto.getRandomValues(a(t + 8));
          },
          // func finalizeRef(v ref)
          "syscall/js.finalizeRef": (t) => {
            t >>>= 0;
            const e = this.mem.getUint32(t + 8, !0);
            if (this._goRefCounts[e]--, this._goRefCounts[e] === 0) {
              const o = this._values[e];
              this._values[e] = null, this._ids.delete(o), this._idPool.push(e);
            }
          },
          // func stringVal(value string) ref
          "syscall/js.stringVal": (t) => {
            t >>>= 0, r(t + 24, u(t + 8));
          },
          // func valueGet(v ref, p string) ref
          "syscall/js.valueGet": (t) => {
            t >>>= 0;
            const e = Reflect.get(s(t + 8), u(t + 16));
            t = this._inst.exports.getsp() >>> 0, r(t + 32, e);
          },
          // func valueSet(v ref, p string, x ref)
          "syscall/js.valueSet": (t) => {
            t >>>= 0, Reflect.set(s(t + 8), u(t + 16), s(t + 32));
          },
          // func valueDelete(v ref, p string)
          "syscall/js.valueDelete": (t) => {
            t >>>= 0, Reflect.deleteProperty(s(t + 8), u(t + 16));
          },
          // func valueIndex(v ref, i int) ref
          "syscall/js.valueIndex": (t) => {
            t >>>= 0, r(t + 24, Reflect.get(s(t + 8), i(t + 16)));
          },
          // valueSetIndex(v ref, i int, x ref)
          "syscall/js.valueSetIndex": (t) => {
            t >>>= 0, Reflect.set(s(t + 8), i(t + 16), s(t + 24));
          },
          // func valueCall(v ref, m string, args []ref) (ref, bool)
          "syscall/js.valueCall": (t) => {
            t >>>= 0;
            try {
              const e = s(t + 8), o = Reflect.get(e, u(t + 16)), l = y(t + 32), m = Reflect.apply(o, e, l);
              t = this._inst.exports.getsp() >>> 0, r(t + 56, m), this.mem.setUint8(t + 64, 1);
            } catch (e) {
              t = this._inst.exports.getsp() >>> 0, r(t + 56, e), this.mem.setUint8(t + 64, 0);
            }
          },
          // func valueInvoke(v ref, args []ref) (ref, bool)
          "syscall/js.valueInvoke": (t) => {
            t >>>= 0;
            try {
              const e = s(t + 8), o = y(t + 16), l = Reflect.apply(e, void 0, o);
              t = this._inst.exports.getsp() >>> 0, r(t + 40, l), this.mem.setUint8(t + 48, 1);
            } catch (e) {
              t = this._inst.exports.getsp() >>> 0, r(t + 40, e), this.mem.setUint8(t + 48, 0);
            }
          },
          // func valueNew(v ref, args []ref) (ref, bool)
          "syscall/js.valueNew": (t) => {
            t >>>= 0;
            try {
              const e = s(t + 8), o = y(t + 16), l = Reflect.construct(e, o);
              t = this._inst.exports.getsp() >>> 0, r(t + 40, l), this.mem.setUint8(t + 48, 1);
            } catch (e) {
              t = this._inst.exports.getsp() >>> 0, r(t + 40, e), this.mem.setUint8(t + 48, 0);
            }
          },
          // func valueLength(v ref) int
          "syscall/js.valueLength": (t) => {
            t >>>= 0, c(t + 16, parseInt(s(t + 8).length));
          },
          // valuePrepareString(v ref) (ref, int)
          "syscall/js.valuePrepareString": (t) => {
            t >>>= 0;
            const e = h.encode(String(s(t + 8)));
            r(t + 16, e), c(t + 24, e.length);
          },
          // valueLoadString(v ref, b []byte)
          "syscall/js.valueLoadString": (t) => {
            t >>>= 0;
            const e = s(t + 8);
            a(t + 16).set(e);
          },
          // func valueInstanceOf(v ref, t ref) bool
          "syscall/js.valueInstanceOf": (t) => {
            t >>>= 0, this.mem.setUint8(t + 24, s(t + 8) instanceof s(t + 16) ? 1 : 0);
          },
          // func copyBytesToGo(dst []byte, src ref) (int, bool)
          "syscall/js.copyBytesToGo": (t) => {
            t >>>= 0;
            const e = a(t + 8), o = s(t + 32);
            if (!(o instanceof Uint8Array || o instanceof Uint8ClampedArray)) {
              this.mem.setUint8(t + 48, 0);
              return;
            }
            const l = o.subarray(0, e.length);
            e.set(l), c(t + 40, l.length), this.mem.setUint8(t + 48, 1);
          },
          // func copyBytesToJS(dst ref, src []byte) (int, bool)
          "syscall/js.copyBytesToJS": (t) => {
            t >>>= 0;
            const e = s(t + 8), o = a(t + 16);
            if (!(e instanceof Uint8Array || e instanceof Uint8ClampedArray)) {
              this.mem.setUint8(t + 48, 0);
              return;
            }
            const l = o.subarray(0, e.length);
            e.set(l), c(t + 40, l.length), this.mem.setUint8(t + 48, 1);
          },
          debug: (t) => {
            console.log(t);
          }
        }
      };
    }
    async run(c) {
      if (!(c instanceof WebAssembly.Instance))
        throw new Error("Go.run: WebAssembly.Instance expected");
      this._inst = c, this.mem = new DataView(this._inst.exports.mem.buffer), this._values = [
        // JS values that Go currently has references to, indexed by reference id
        NaN,
        0,
        null,
        !0,
        !1,
        globalThis,
        this
      ], this._goRefCounts = new Array(this._values.length).fill(1 / 0), this._ids = /* @__PURE__ */ new Map([
        // mapping from JS values to reference ids
        [0, 1],
        [null, 2],
        [!0, 3],
        [!1, 4],
        [globalThis, 5],
        [this, 6]
      ]), this._idPool = [], this.exited = !1;
      let i = 4096;
      const s = (f) => {
        const t = i, e = h.encode(f + "\0");
        return new Uint8Array(this.mem.buffer, i, e.length).set(e), i += e.length, i % 8 !== 0 && (i += 8 - i % 8), t;
      }, r = this.argv.length, a = [];
      this.argv.forEach((f) => {
        a.push(s(f));
      }), a.push(0), Object.keys(this.env).sort().forEach((f) => {
        a.push(s(`${f}=${this.env[f]}`));
      }), a.push(0);
      const u = i;
      if (a.forEach((f) => {
        this.mem.setUint32(i, f, !0), this.mem.setUint32(i + 4, 0, !0), i += 8;
      }), i >= 12288)
        throw new Error("total length of command line and environment variables exceeds limit");
      this._inst.exports.run(r, u), this.exited && this._resolveExitPromise(), await this._exitPromise;
    }
    _resume() {
      if (this.exited)
        throw new Error("Go program has already exited");
      this._inst.exports.resume(), this.exited && this._resolveExitPromise();
    }
    _makeFuncWrapper(c) {
      const i = this;
      return function() {
        const s = { id: c, this: this, args: arguments };
        return i._pendingEvent = s, i._resume(), s.result;
      };
    }
  };
})();
const b = new URL("main.wasm", import.meta.url).href;
(() => {
  const n = globalThis, h = "process";
  n[h] ? n[h].pid == null && (n[h].pid = 1) : n[h] = { pid: 1 };
})();
let _ = !1;
async function x() {
  if (_) return;
  const n = new globalThis.Go(), h = await WebAssembly.instantiateStreaming(
    fetch(b),
    n.importObject
  );
  n.run(h.instance), _ = !0;
}
function d() {
  return globalThis.__tailscaleWeb;
}
function T(n) {
  return {
    status: n.status,
    statusText: n.statusText,
    ok: n.ok,
    headers: n.headers,
    text: async () => new TextDecoder().decode(n.body),
    json: async () => JSON.parse(new TextDecoder().decode(n.body)),
    arrayBuffer: async () => n.body.buffer,
    bytes: async () => n.body
  };
}
const p = {
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
  setStorage(n) {
    d().setStorage(n);
  },
  /**
   * Initialize and connect the Tailscale node. Must be called before any
   * other method. Resolves once the node is online and ready.
   *
   * If the node has persisted state from a previous session it reconnects
   * automatically. Otherwise the OAuth flow is triggered via onAuthRequired.
   */
  async init(n = {}) {
    return await x(), d().init(n);
  },
  /**
   * Probe TCP connectivity to addr and measure round-trip time.
   * addr may be "host" (port 443 assumed) or "host:port".
   */
  async ping(n) {
    return d().ping(n);
  },
  /**
   * Open a raw TCP connection through the Tailscale network.
   * Returns a Connection object for sending and receiving data.
   */
  async dial(n) {
    const h = await d().dial(n);
    return {
      onData(g) {
        h.onData(g);
      },
      write(g) {
        h.write(typeof g == "string" ? new TextEncoder().encode(g) : g);
      },
      close() {
        h.close();
      }
    };
  },
  /**
   * Make an HTTP request through the Tailscale network.
   * Mirrors the browser Fetch API signature.
   */
  async fetch(n, h = {}) {
    return T(await d().fetch(n, h));
  },
  /**
   * Return the current preferences (acceptRoutes, exitNodeId).
   * Synchronous — no await needed.
   */
  getPrefs() {
    return d().getPrefs();
  },
  /**
   * Enable or disable acceptance of subnet routes advertised by peers.
   * Equivalent to `tailscale set --accept-routes`.
   */
  async setAcceptRoutes(n) {
    return d().setAcceptRoutes(n);
  },
  /**
   * Return all peers that advertise exit-node capability.
   * Synchronous — no await needed.
   */
  listExitNodes() {
    return Array.from(d().listExitNodes());
  },
  /**
   * Activate an exit node by its stable node ID.
   * Pass an empty string (or omit) to clear the exit node.
   */
  async setExitNode(n = "") {
    return d().setExitNode(n);
  },
  /**
   * Return the full routing table (self + all peers).
   * Synchronous — no await needed.
   */
  getRoutes() {
    return Array.from(d().getRoutes());
  },
  /**
   * Return the current Tailscale-managed DNS configuration.
   * Synchronous — no await needed.
   */
  getDNS() {
    return d().getDNS();
  }
};
export {
  p as network
};
