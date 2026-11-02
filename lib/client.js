window.__ModuleLoader__.load({
  id: "dsh-remote-control",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  Mask: () => Mask,
  MobileHeader: () => MobileHeader,
  apply: () => apply,
  default: () => index_default,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var API = "/remote-control/mask";
var HEADER_CSS = `
.tm-livebar{display:none!important}
button[aria-label="\u5C55\u5F00\u5E95\u90E8\u9762\u677F"]{display:none!important}
.nArs4W_toggleButton{display:none!important}
@media (max-width: 640px){
button[aria-label="\u66F4\u591A\u64CD\u4F5C"]{display:none!important}
.an3WzG_titleRow{height:26px!important;padding:0 4px!important}
.an3WzG_tabs{height:26px!important}
.mP3x-q_frame{padding-top:74px!important}

.an3WzG_titleRow{display:flex!important;align-items:center!important;height:30px!important;padding:0 6px!important}
.an3WzG_viewsMore{display:none!important}
.mP3x-q_rightbarCol{display:none!important}
button[aria-label*="\u53F3\u4FA7\u8FB9\u680F"]{display:none!important}

#rc-row2{display:none!important}
.mP3x-q_frame{grid-template-columns:0 1fr 0!important;padding-top:46px!important;height:100dvh!important;box-sizing:border-box!important}
.mP3x-q_sidebarCol{width:0!important;min-width:0!important;overflow:hidden!important;padding:0!important}
body.rc-nav-open .mP3x-q_sidebarCol{position:fixed!important;left:0;top:76px;bottom:0;width:min(88vw,330px)!important;overflow:auto!important;z-index:100001!important;background:#151517!important;padding:8px!important}
.an3WzG_crumbs{display:none!important}
.an3WzG_titleRow{display:flex!important;align-items:center!important;height:30px!important;padding:0 6px!important}
.an3WzG_headerActions{display:flex!important;align-items:center!important;gap:2px!important}
.dscfja_label,.rezYhW_trigger{font-size:0!important}

}
`;
function iconSvg(paths) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", children: paths.split("|").map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d }, i)) });
}
function MobileHeader() {
  const [counts, setCounts] = (0, import_react.useState)({ agents: "", tasks: "" });
  (0, import_react.useEffect)(() => {
    const style = document.createElement("style");
    style.id = "rc-client-mobile";
    style.textContent = HEADER_CSS;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  (0, import_react.useEffect)(() => {
    const tick = () => {
      const text = document.body.innerText;
      const a = text.match(/(\d+)\s*个子智能体/);
      const t = text.match(/(\d+)\s*个后台任务/);
      setCounts({ agents: a ? a[1] : "", tasks: t ? t[1] : "" });
    };
    tick();
    const timer = window.setInterval(tick, 1500);
    return () => window.clearInterval(timer);
  }, []);
  const click = (selector) => {
    const el = document.querySelector(selector);
    if (el && typeof el.click === "function") el.click();
  };
  const btn = { background: "transparent", border: 0, color: "#eef2ff", font: "13px system-ui", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, borderRadius: 6 };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "fixed", top: 46, left: 0, right: 0, height: 30, display: "flex", alignItems: "center", gap: 2, padding: "0 8px", zIndex: 9990, background: "#151517" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn, onClick: () => click(".an3WzG_tab"), children: "\u5BF9\u8BDD" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn, onClick: () => click(".an3WzG_tab:nth-of-type(2)"), children: "\u8F68\u8FF9" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1 } }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn, title: "\u6A21\u5F0F", onClick: () => click(".dscfja_label"), children: iconSvg("M4 6h16|M4 12h16|M4 18h16") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { style: btn, title: "\u5B50\u667A\u80FD\u4F53", onClick: () => click(".rezYhW_trigger"), children: [
      iconSvg("M5 8h14v10H5z|M12 8V5|M9 13h.01|M15 13h.01"),
      counts.agents
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { style: btn, title: "\u540E\u53F0\u4EFB\u52A1", onClick: () => click('button[aria-label*="\u540E\u53F0\u4EFB\u52A1"]'), children: [
      iconSvg("M20 12a8 8 0 1 1-2.3-5.6|M20 4v4h-4"),
      counts.tasks
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: btn, title: "\u6587\u4EF6", onClick: () => {
      const w = window;
      if (w.__rcOpenFiles) w.__rcOpenFiles();
      else click('button[aria-label*="\u6587\u4EF6\u8D44\u6E90\u7BA1\u7406\u5668"]');
    }, children: iconSvg("M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z") })
  ] });
}
function Mask() {
  if (typeof window !== "undefined" && (window.location.port === "7466" || window.location.search.includes("k="))) return null;
  const [masked, setMasked] = (0, import_react.useState)(false);
  const [failures, setFailures] = (0, import_react.useState)(0);
  const [unlocked, setUnlocked] = (0, import_react.useState)(false);
  const [code, setCode] = (0, import_react.useState)("");
  const [error, setError] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(API + "/state");
        const json = await res.json();
        if (!alive) return;
        setMasked(Boolean(json?.data?.masked));
        setFailures(Number(json?.data?.failedAttempts || 0));
      } catch {
      }
    };
    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 2500);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);
  if (!masked) return null;
  const verify = async () => {
    setError("");
    try {
      const res = await fetch(API + "/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const json = await res.json();
      if (json?.data?.valid) {
        setMasked(false);
        setCode("");
      } else setError("\u89E3\u9501\u7801\u4E0D\u6B63\u786E\u6216\u5DF2\u8FC7\u671F");
    } catch {
      setError("\u9A8C\u8BC1\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "fixed", inset: 0, zIndex: 999999, background: "#0b0d12", color: "#f2f5fa", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { width: 340, maxWidth: "90vw", background: "#161a22", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 34, marginBottom: 8 }, children: "\u{1F4F1}" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 6 }, children: "\u5DF2\u7531\u624B\u673A\u7AEF\u63A5\u7BA1" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, opacity: 0.7, marginBottom: 18, lineHeight: 1.5 }, children: [
      "\u7535\u8111\u7AEF\u5DF2\u9501\u5B9A\u64CD\u4F5C\u3002",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
      "\u8BF7\u5728\u624B\u673A\u7AEF\u751F\u6210\u89E3\u9501\u7801\u540E\u8F93\u5165\u3002"
    ] }),
    failures >= 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: "#facc15", fontSize: 12, marginBottom: 10 }, children: [
      "\u26A0\uFE0F \u5DF2\u68C0\u6D4B\u5230\u591A\u6B21\u9519\u8BEF\u89E3\u9501\u5C1D\u8BD5\uFF08",
      failures,
      " \u6B21\uFF09\uFF0C\u53EF\u80FD\u6709\u4EBA\u5728\u5F3A\u5236\u89E3\u9501\u3002"
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        value: code,
        onChange: (e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6)),
        placeholder: "6 \u4F4D\u89E3\u9501\u7801",
        inputMode: "numeric",
        style: { width: "100%", boxSizing: "border-box", background: "#0e1118", border: "1px solid rgba(255,255,255,.16)", borderRadius: 10, color: "#f2f5fa", fontSize: 20, letterSpacing: 6, textAlign: "center", padding: "10px 8px", outline: "none" }
      }
    ),
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { color: "#ff6b6b", fontSize: 12, marginTop: 8 }, children: error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        onClick: () => {
          void verify();
        },
        style: { marginTop: 14, width: "100%", padding: "10px 0", borderRadius: 10, border: 0, background: "#4f7cff", color: "#fff", fontSize: 14, cursor: "pointer" },
        children: "\u89E3\u9501\u63A5\u7BA1"
      }
    )
  ] }) });
}
var inject = ["slots", "layout"];
function apply(ctx) {
  try {
    window.__rcMakeWorkspace = async (dir) => {
      const ws = ctx.get?.("workspaces");
      return ws?.create?.({ path: dir });
    };
  } catch {
  }
  try {
    const st = document.createElement("style");
    st.id = "rc-client-mobile";
    st.textContent = HEADER_CSS;
    document.head.appendChild(st);
  } catch {
  }
  try {
    ctx.effect(() => {
      return () => {
      };
    }, "remote-control: header overlay");
  } catch {
  }
  try {
    const theme = ctx.get?.("theme");
    window.__rcTheme = {
      toggle: () => {
        try {
          const snap = theme?.getTheme?.();
          const dark = snap?.active?.colorScheme === "dark";
          theme?.setTheme?.(dark ? "light" : "dark");
        } catch {
        }
      }
    };
  } catch {
  }
  try {
    console.info("[remote-control] client apply");
  } catch {
  }
  ctx.effect(() => {
    try {
      return ctx.slots.register({ name: "shell.overlay", id: "remote-control-mask", order: 5 }, Mask);
    } catch (error) {
      try {
        console.error("[remote-control] overlay register failed", error);
      } catch {
      }
      return () => {
      };
    }
  }, "remote-control: mask overlay");
}
var index_default = { inject, apply };

    return module.exports;
  }
});

