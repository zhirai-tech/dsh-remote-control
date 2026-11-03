// src/index.ts
import os2 from "node:os";
import fs2 from "node:fs";
import { spawn as spawn2 } from "node:child_process";
import { fileURLToPath } from "node:url";
import path2 from "node:path";

// src/host/remote-server.ts
import http from "node:http";
import net from "node:net";
import os from "node:os";
import crypto3 from "node:crypto";
import fsMod from "node:fs/promises";
import pathMod from "node:path";
import { spawn, execFile } from "node:child_process";

// src/host/state.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
function loadOrCreateState(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "state.json");
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (raw.secret && raw.accessKey) return raw;
  } catch {
  }
  const state = {
    secret: crypto.randomBytes(20).toString("base64"),
    accessKey: "zr-" + crypto.randomBytes(4).toString("hex"),
    createdAt: Date.now()
  };
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
  return state;
}

// src/shared/totp.ts
import crypto2 from "node:crypto";
function totp(secretBase64, nowMs = Date.now(), periodSec = 60) {
  const key = Buffer.from(secretBase64, "base64");
  const counter = Math.floor(nowMs / 1e3 / periodSec);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto2.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const bin = (hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255;
  return String(bin % 1e6).padStart(6, "0");
}
function verifyTotp(secretBase64, code, nowMs = Date.now(), periodSec = 60, window = 5) {
  const normalized = String(code || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const current = Math.floor(nowMs / 1e3 / periodSec);
  for (let d = -window; d <= window; d++) {
    if (totp(secretBase64, (current + d) * periodSec * 1e3, periodSec) === normalized) return true;
  }
  return false;
}

// src/host/remote-server.ts
var MOBILE_CSS = [
  '<style id="rc-mobile">',
  "@media (max-width: 640px){",
  "  .dsh-pet-root,.pet-tooltip{display:none!important}",
  "  body{overscroll-behavior:none}",
  "}",
  "#rc-top{position:fixed;z-index:99999;top:0;left:0;right:0;height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 6px;pointer-events:none}",
  "#rc-title{margin-left:4px;max-width:clamp(90px,34vw,150px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:13px system-ui,sans-serif;color:#eef2ff;opacity:.95;pointer-events:none}",
  ,
  "#rc-top button{pointer-events:auto;background:transparent;border:0;color:#eef2ff;line-height:1;padding:4px 5px;border-radius:8px;display:flex;align-items:center;justify-content:center}#rc-actions{display:flex;align-items:center;gap:4px}",
  "#rc-new{border:0!important;background:transparent!important;color:#eef2ff!important;width:28px!important;height:28px!important;border-radius:0!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important}",
  ,
  "#rc-confirm{position:fixed;left:50%;top:56px;transform:translateX(-50%);z-index:100002;display:none}",
  "#rc-confirm .card{background:#1b1e26;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px 16px;text-align:center;color:#ff6b6b;font:13px/1.45 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);max-width:86vw}",
  "#rc-confirm button{font:13px system-ui;padding:5px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#eef2ff}",
  "#rc-modal{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55)}",
  "#rc-modal .card{background:#1b1e26;border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:20px;min-width:240px;text-align:center;color:#eef2ff;font:14px/1.4 system-ui,sans-serif}",
  "#rc-code{font-size:34px;letter-spacing:8px;margin:12px 0;font-variant-numeric:tabular-nums}",
  "#rc-modal button{margin-top:6px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#eef2ff;border-radius:10px;padding:8px 14px}",
  ".acoR2W_iconButton{display:none!important}",
  "#rc-modal .card{position:relative}",
  "#rc-x{position:absolute;top:6px;right:8px;background:transparent;border:0;color:#9aa4b2;font-size:20px;line-height:1;padding:2px 6px}",
  "#rc-remask{margin-top:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#eef2ff;border-radius:10px;padding:8px 14px;font:13px system-ui}",
  "#rc-files{position:fixed;inset:0;z-index:100003;background:#0f1218;color:#eef2ff;display:none;flex-direction:column;font:14px system-ui,sans-serif}",
  "#rc-files header{display:flex;align-items:center;gap:6px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.1)}",
  "#rc-files .path{order:1;flex:1}",
  "#rc-files-back{order:2;display:flex;align-items:center}",
  "#rc-files-close{order:3;font-size:26px!important;padding:0 10px!important}",
  "#rc-files header button{background:transparent;border:0;color:#eef2ff;font-size:20px;padding:2px 6px}",
  "#rc-files .path{flex:1;font-size:12px;opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  "#rc-files .list{flex:1;overflow:auto}",
  "#rc-files .row{display:flex;gap:10px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.06)}",
  "#rc-files .view{display:none;flex:1;overflow:auto;padding:10px 12px;white-space:pre-wrap;font:12px ui-monospace,monospace;background:#0b0e14;margin:0}",
  "#rc-files .view.show{display:block}",
  "#rc-row2{position:fixed;top:46px;left:0;right:0;height:30px;display:flex;align-items:center;gap:2px;padding:0 8px;z-index:99998;background:#151517}",
  "#rc-row2 button{background:transparent;border:0;color:#eef2ff;font:13px system-ui;padding:4px 8px;display:flex;align-items:center;gap:4px;border-radius:6px}",
  "#rc-row2 button.on{background:rgba(255,255,255,.08)}",
  "#rc-row2 .sp{flex:1}",
  "#rc-ws-modal{position:fixed;inset:0;z-index:100004;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5)}",
  "#rc-ws-modal .card{background:#1b1e26;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px;color:#eef2ff;font:13px system-ui;width:280px;max-width:88vw}",
  "#rc-ws-modal select,#rc-ws-modal input{width:100%;box-sizing:border-box;background:#0e1118;border:1px solid rgba(255,255,255,.16);border-radius:8px;color:#eef2ff;padding:8px;margin:6px 0 10px;font:13px system-ui}",
  "#rc-ws-modal .row{display:flex;gap:8px;justify-content:flex-end}",
  "#rc-ws-modal button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#eef2ff;border-radius:8px;padding:7px 12px;font:13px system-ui}",
  "</style>"
].join("\n");
var WIDGET = [
  '<div id="rc-top">',
  '<button id="rc-menu" title="\u83DC\u5355"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>',
  '<div id="rc-title"></div>',
  '<div id="rc-actions">',
  '<button id="rc-ws" title="\u65B0\u5EFA\u5DE5\u4F5C\u533A"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v6M9 14h6"/></svg></button>',
  '<button id="rc-new" title="\u65B0\u5EFA\u4F1A\u8BDD"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>',
  '<button id="rc-code-btn" title="\u89E3\u9501\u7801"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="15" r="3"/><path d="M10.5 12.5 20 3m-3 3 2 2m-5-1 2 2"/></svg></button>',
  '<button id="rc-lock-btn" title="\u9501\u5B9A\u7535\u8111"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></button>',
  '<button id="rc-off-btn" title="\u65AD\u5F00"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v9"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/></svg></button>',
  "</div>",
  "</div>",
  '<div id="rc-confirm"><div class="card"><div id="rc-confirm-text">\u786E\u8BA4\uFF1F</div><div style="display:flex;gap:10px;justify-content:center;margin-top:14px"><button id="rc-confirm-no">\u53D6\u6D88</button><button id="rc-confirm-yes">\u786E\u5B9A</button></div></div></div>',
  '<div id="rc-row2"><button data-rc="chat" class="on">\u5BF9\u8BDD</button><button data-rc="traj">\u8F68\u8FF9</button><span class="sp"></span><button data-rc="mode" title="\u6A21\u5F0F"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h8M16 6h4M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg></button><button data-rc="agents" title="\u5B50\u667A\u80FD\u4F53"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 8V5M9 13h.01M15 13h.01"/></svg><span id="rc-ag"></span></button><button data-rc="tasks" title="\u540E\u53F0\u4EFB\u52A1"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/></svg><span id="rc-tk"></span></button><button data-rc="files" title="\u6587\u4EF6"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></button></div>',
  '<div id="rc-ws-modal"><div class="card"><div>\u65B0\u5EFA\u5DE5\u4F5C\u533A</div><select id="rc-ws-drive"><option value="C:\\">C:</option><option value="D:\\">D:</option><option value="E:\\" selected>E:</option></select><input id="rc-ws-name" placeholder="\u6587\u4EF6\u5939\u540D\u79F0"/><div class="row"><button id="rc-ws-cancel">\u53D6\u6D88</button><button id="rc-ws-create">\u521B\u5EFA</button></div></div></div>',
  '<div id="rc-files"><header><div class="path" id="rc-files-path">\u9879\u76EE\u6839\u76EE\u5F55</div><button id="rc-files-back" title="\u8FD4\u56DE\u4E0A\u7EA7"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg></button><button id="rc-files-close" title="\u5173\u95ED">\xD7</button></header><div class="list" id="rc-files-list"></div><pre class="view" id="rc-files-view"></pre></div>',
  '<div id="rc-modal"><div class="card"><button id="rc-x" title="\u5173\u95ED">\xD7</button><div>\u89E3\u9501\u7801</div><div id="rc-code">------</div><div id="rc-left"></div><div id="rc-warn" style="display:none;color:#facc15;font-size:12px;margin-top:6px">\u26A0\uFE0F \u68C0\u6D4B\u5230\u591A\u6B21\u9519\u8BEF\u89E3\u9501\u5C1D\u8BD5\uFF0C\u53EF\u80FD\u6709\u4EBA\u5728\u5F3A\u5236\u89E3\u9501</div><button id="rc-remask">\u91CD\u65B0\u906E\u6321\u7535\u8111</button></div></div>',
  "<script>(function(){",
  'var el=document.getElementById("rc-modal"),code=document.getElementById("rc-code"),left=document.getElementById("rc-left");',
  'function show(v){el.style.display="flex";code.textContent=v}',
  'async function refresh(){try{var r=await fetch("/rc/api/code");var j=await r.json();if(j.ok){show(j.data.code);left.textContent="\u5269\u4F59 "+j.data.expiresIn+" \u79D2"}}catch(e){}}',
  'document.getElementById("rc-ws").onclick=function(){document.getElementById("rc-ws-modal").style.display="flex"};document.getElementById("rc-ws-cancel").onclick=function(){document.getElementById("rc-ws-modal").style.display="none"};document.getElementById("rc-ws-create").onclick=async function(){var d=document.getElementById("rc-ws-drive").value,n=document.getElementById("rc-ws-name").value;try{var r=await fetch("/rc/api/mkdir",{method:"POST",headers:{"content-type":"application/json","x-rc-key":window.__RC_KEY__||""},body:JSON.stringify({parent:d,name:n})});var j=await r.json();if(!j.ok){alert("\u521B\u5EFA\u5931\u8D25: "+((j.error&&j.error.message)||""));return}if(window.__rcMakeWorkspace)await window.__rcMakeWorkspace(j.data.path);document.getElementById("rc-ws-modal").style.display="none";alert("\u5DF2\u521B\u5EFA\u5E76\u6CE8\u518C\u5DE5\u4F5C\u533A: "+j.data.path)}catch(e){alert("\u5931\u8D25: "+e)}};',
  'document.getElementById("rc-menu").onclick=function(){var open=document.body.classList.toggle("rc-nav-open");var bs=document.querySelectorAll("button");for(var i=0;i<bs.length;i++){var a=bs[i].getAttribute("aria-label")||"";if(a===(open?"\u6253\u5F00\u4FA7\u8FB9\u680F":"\u6536\u8D77\u4FA7\u8FB9\u680F")){bs[i].click();break}}};',
  'document.getElementById("rc-new").onclick=function(){var b=document.querySelector("[aria-label*=\u65B0\u5EFA\u4F1A\u8BDD]");if(b){b.click();return}document.body.classList.add("rc-nav-open");setTimeout(function(){var x=document.querySelector("[aria-label*=\u65B0\u5EFA\u4F1A\u8BDD]");if(x)x.click()},120)};',
  "/* auto-close sidebar on pick */",
  'document.addEventListener("click",function(e){if(!document.body.classList.contains("rc-nav-open"))return;if(e.target.closest("#rc-menu"))return;var _b=e.target.closest("button");var _a=_b?(_b.getAttribute("aria-label")||""):"";if(_a==="\u6253\u5F00\u4FA7\u8FB9\u680F"||_a==="\u6536\u8D77\u4FA7\u8FB9\u680F")return;if(e.target.closest(".mP3x-q_sidebarCol")){setTimeout(function(){document.body.classList.remove("rc-nav-open");var bs=document.querySelectorAll("button");for(var i=0;i<bs.length;i++){var a=bs[i].getAttribute("aria-label")||"";if(a==="\u6536\u8D77\u4FA7\u8FB9\u680F"){bs[i].click();break}}},180)}});',
  'function markAt(){try{var bs=document.querySelectorAll("button");for(var i=0;i<bs.length;i++){var a=bs[i].getAttribute("aria-label")||"";if(a.indexOf("\u6DFB\u52A0\u6587\u4EF6\u6216\u8C03\u7528\u6307\u4EE4")>=0){bs[i].innerHTML="@";bs[i].style.fontSize="18px";bs[i].style.color="#eef2ff"}}}catch(e){}}markAt();setTimeout(markAt,1200);setTimeout(markAt,3000);',
  'document.getElementById("rc-code-btn").onclick=function(){if(window.__rcMasked){refresh();setTimeout(refresh,2000);return}rcConfirm("\u5F53\u524D\u5C4F\u853D\u5DF2\u89E3\u9501\uFF0C\u662F\u5426\u786E\u8BA4\u91CD\u65B0\u5C4F\u853D\uFF1F",async function(){try{await fetch("/rc/api/remask",{method:"POST"})}catch(e){};window.__rcMasked=true})};',
  'document.getElementById("rc-x").onclick=function(){el.style.display="none"};document.getElementById("rc-remask").onclick=async function(){try{await fetch("/rc/api/remask",{method:"POST"})}catch(e){};el.style.display="none"};',
  'function rcConfirm(msg,fn){var m=document.getElementById("rc-confirm");document.getElementById("rc-confirm-text").textContent=msg;m.style.display="flex";document.getElementById("rc-confirm-yes").onclick=async function(){m.style.display="none";await fn()};document.getElementById("rc-confirm-no").onclick=function(){m.style.display="none"}}document.getElementById("rc-lock-btn").onclick=function(){rcConfirm("\u662F\u5426\u9501\u5B9A\u5F53\u524D\u7535\u8111\u684C\u9762\uFF1F",async function(){try{await fetch("/rc/api/lock",{method:"POST"})}catch(e){}})};',
  'document.getElementById("rc-off-btn").onclick=function(){rcConfirm("\u786E\u8BA4\u65AD\u5F00\u624B\u673A\u63A5\u7BA1\uFF1F",async function(){try{await fetch("/rc/api/disconnect",{method:"POST"})}catch(e){};location.reload()})};',
  'var __rcRel="";function __rcF(path){return fetch(path,{headers:{"x-rc-key":window.__RC_KEY__||""}}).then(function(r){return r.json()})}',
  'function __rcLoad(rel){__rcRel=rel;var box=document.getElementById("rc-files"),list=document.getElementById("rc-files-list"),view=document.getElementById("rc-files-view"),pth=document.getElementById("rc-files-path");box.style.display="flex";list.style.display="block";view.className="view";view.textContent="";document.getElementById("rc-files-back").style.visibility=rel?"visible":"hidden";pth.textContent=rel?("\u9879\u76EE\u6839\u76EE\u5F55 / "+rel):"\u9879\u76EE\u6839\u76EE\u5F55";list.innerHTML="";__rcF("/rc/api/files?path="+encodeURIComponent(rel)).then(function(j){if(!j.ok){list.textContent="\u8BFB\u53D6\u5931\u8D25";return}var items=j.data.items||[];if(!rel){items=[{name:"..",dir:true}].concat(items)}items.forEach(function(it){var row=document.createElement("div");row.className="row";row.textContent=(it.dir?"\u{1F4C1} ":"\u{1F4C4} ")+it.name;row.onclick=function(){var next=rel?rel+"/"+it.name:it.name;if(it.name===".."){__rcLoad(rel.split("/").slice(0,-1).join("/"));return}if(it.dir){__rcLoad(next);return}__rcOpenFile(next)};list.appendChild(row)})})}',
  'function __rcOpenFile(rel){var list=document.getElementById("rc-files-list"),view=document.getElementById("rc-files-view");__rcF("/rc/api/file?path="+encodeURIComponent(rel)).then(function(j){list.style.display="none";view.className="view show";view.textContent=j.ok?j.data.content:("\u8BFB\u53D6\u5931\u8D25: "+(j.error&&j.error.message||""))})}',
  'window.__rcOpenFiles=function(){__rcLoad("")};document.getElementById("rc-files-close").onclick=function(){document.getElementById("rc-files").style.display="none"};',
  'document.getElementById("rc-files-back").onclick=function(){__rcLoad(__rcRel.split("/").slice(0,-1).join("/"))};',
  'document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var a=b.getAttribute("aria-label")||"";if(a.indexOf("\u6587\u4EF6")>=0&&a.indexOf("\u6DFB\u52A0")<0){e.preventDefault();e.stopPropagation();__rcLoad("")}},true);',
  'function __rcTitle(){try{var t=(document.title||"").split("\u2014")[0].trim();var e=document.getElementById("rc-title");if(e)e.textContent=t}catch(e){}}__rcTitle();setInterval(__rcTitle,2000);',
  'function __rcInjectFolder(){try{var tabs=document.querySelector(".an3WzG_tabs");if(!tabs)return;var u=document.querySelector(".an3WzG_headerUtilities");var acts=document.querySelector(".an3WzG_headerActions");if(acts)acts.style.display="none";var mk=function(id,title){var b=document.createElement("button");b.id=id;b.title=title;b.style.cssText="background:transparent;border:0;color:#eef2ff;padding:2px 5px;display:flex;align-items:center;gap:3px;font:12px system-ui";return b};var svg=function(){var s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("width","17");s.setAttribute("height","17");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("fill","none");s.setAttribute("stroke","currentColor");s.setAttribute("stroke-width","1.8");s.setAttribute("stroke-linecap","round");return s};var el=function(tag,attrs){var e=document.createElementNS("http://www.w3.org/2000/svg",tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e};var badge=function(parent,txt){var s=document.createElement("span");s.textContent=txt;s.style.cssText="opacity:.85;font-size:11px";parent.appendChild(s)};var txt=document.body.innerText;var mAg=txt.match(/(d+)s*\u4E2A\u5B50\u667A\u80FD\u4F53/);var mTask=txt.match(/(d+)s*\u4E2A\u540E\u53F0\u4EFB\u52A1/);if(!document.getElementById("rc-team")){var team=mk("rc-team","\u667A\u80FD\u4F53\u56E2\u961F");var s1=svg();s1.appendChild(el("circle",{cx:"9",cy:"7",r:"3"}));s1.appendChild(el("path",{d:"M3 19a6 6 0 0 1 12 0"}));s1.appendChild(el("path",{d:"M16 4a3 3 0 0 1 0 6M18.5 19a6 6 0 0 0-2.2-4.6"}));team.appendChild(s1);var robot=mk("rc-robot","\u5B50\u667A\u80FD\u4F53");var s2=svg();s2.appendChild(el("rect",{x:"5",y:"8",width:"14",height:"10",rx:"3"}));s2.appendChild(el("path",{d:"M12 8V5M9 13h.01M15 13h.01"}));robot.appendChild(s2);if(mAg)badge(robot,mAg[1]);var task=mk("rc-task","\u540E\u53F0\u4EFB\u52A1");var s3=svg();s3.appendChild(el("path",{d:"M20 12a8 8 0 1 1-2.3-5.6"}));s3.appendChild(el("path",{d:"M20 4v4h-4"}));task.appendChild(s3);if(mTask)badge(task,mTask[1]);tabs.insertBefore(team,u||null);tabs.insertBefore(robot,u||null);tabs.insertBefore(task,u||null)}}catch(e){}}',
  'function __rcHideMenu(){try{var all=document.querySelectorAll("body *");for(var i=0;i<all.length;i++){var el=all[i];if(el.children.length>0)continue;var x=(el.textContent||"").trim();if(x.indexOf("\u6D4F\u89C8\u66F4\u591A\u63D2\u4EF6")>=0||x.indexOf("\u521B\u5EFA\u4F60\u7684\u63D2\u4EF6")>=0){var p=el.closest("[role=menuitem],button,li,a");if(p&&p!==document.body&&p!==document.documentElement)p.style.setProperty("display","none","important")}}}catch(e){}}',
  "try{new MutationObserver(function(){__rcHideMenu()}).observe(document.body,{childList:true,subtree:true})}catch(e){}",
  'setInterval(function(){if(el.style.display==="flex")refresh()},3000);',
  'setInterval(async function(){try{var r=await fetch("/rc/api/state");var j=await r.json();var d=j.data||{};var k=document.getElementById("rc-code-btn"),p=document.getElementById("rc-off-btn");var lk=document.getElementById("rc-lock-btn");if(k)k.style.color=(d.failedAttempts>=3)?"#facc15":(d.masked?"#4ade80":"#f87171");if(lk)lk.style.color=d.screenLocked?"#4ade80":"#f87171";if(p)p.style.color=d.connected?"#4ade80":"#f87171";window.__rcMasked=!!d.masked;window.__rcFailures=d.failedAttempts||0;var w=document.getElementById("rc-warn");if(w)w.style.display=(window.__rcFailures>=3)?"block":"none"}catch(e){}},4000);',
  "})()</script>"
].join("\n");
function lanIps() {
  const scored = [];
  for (const [name2, list] of Object.entries(os.networkInterfaces())) {
    if (/vEthernet|WSL|Docker|VirtualBox|VMware|Loopback|Tailscale|ZeroTier|Hyper-V|本地连接\s*\*|Bluetooth/i.test(name2)) continue;
    for (const info of list || []) {
      if (!info || info.family !== "IPv4" || info.internal) continue;
      const ip = info.address;
      if (ip.startsWith("169.254.")) continue;
      let score = 0;
      if (ip.startsWith("192.168.")) score = 30;
      else if (ip.startsWith("10.")) score = 20;
      else if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) score = 10;
      else score = 5;
      scored.push({ ip, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.ip);
}
async function createRemoteServer(ctx, config) {
  const port = Number(config.port || 7466);
  const dataDir = String(config.dataDir || "");
  if (!dataDir) throw new Error("dataDir is required");
  const state = loadOrCreateState(dataDir);
  const accessKey = "zr-" + crypto3.randomBytes(4).toString("hex");
  const origin = ctx.webServer.getOrigin();
  let authCookie = "";
  let lastSeen = 0;
  let masked = false;
  let failedAttempts = 0;
  let screenLocked = false;
  let lockProbe = null;
  async function refreshCookie() {
    const authed = ctx.connection.authenticatedUrl(origin + "/");
    const res = await fetch(authed, { redirect: "manual" });
    const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    const auth = raw.find((c) => c.startsWith("dsh-auth-"));
    if (!auth) throw new Error("auth cookie not issued");
    authCookie = auth.split(";")[0];
    return authCookie;
  }
  function rewrite(value) {
    return String(value).replace(/^https?:\/\/[^/]+/, origin);
  }
  function headersFor(req) {
    const h = { ...req.headers };
    h.host = new URL(origin).host;
    h.cookie = authCookie;
    h["accept-encoding"] = "identity";
    if (h.origin) h.origin = origin;
    if (h.referer) h.referer = rewrite(String(h.referer));
    return h;
  }
  function authorized(req) {
    const url = new URL(req.url || "/", "http://x");
    if (url.searchParams.get("k") === accessKey) return true;
    if (String(req.headers.cookie || "").includes("rc_key=" + accessKey)) return true;
    return String(req.headers["x-rc-key"] || "") === accessKey;
  }
  function json(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
    res.end(body);
  }
  async function readJson(req) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      return {};
    }
  }
  async function handleApi(req, res, pathname) {
    if (pathname === "/rc/api/state") {
      return json(res, 200, { ok: true, data: { connected: Date.now() - lastSeen < 15e3, masked, failedAttempts, screenLocked, port, lan: lanIps(), key: accessKey } });
    }
    if (false) {
      return json(res, 200, { ok: true, data: { connected: Date.now() - lastSeen < 15e3, port, lan: lanIps(), key: accessKey } });
    }
    if (pathname === "/rc/api/code") {
      const now = Date.now();
      const period = 6e4;
      const expiresIn = Math.ceil(((Math.floor(now / period) + 1) * period - now) / 1e3);
      return json(res, 200, { ok: true, data: { code: totp(state.secret, now), expiresIn } });
    }
    if (pathname === "/rc/api/verify" && req.method === "POST") {
      const body = await readJson(req);
      return json(res, 200, { ok: true, data: { valid: verifyTotp(state.secret, String(body.code || "")) } });
    }
    if (pathname === "/rc/api/lock" && req.method === "POST") {
      try {
        spawn("rundll32.exe", ["user32.dll,LockWorkStation"], { detached: true, stdio: "ignore" }).unref();
        return json(res, 200, { ok: true, data: { locked: true } });
      } catch (error) {
        return json(res, 500, { ok: false, error: { code: "LOCK_FAILED", message: String(error) } });
      }
    }
    if (pathname === "/rc/api/remask" && req.method === "POST") {
      masked = true;
      return json(res, 200, { ok: true, data: { masked: true } });
    }
    if (pathname === "/rc/api/disconnect" && req.method === "POST") {
      lastSeen = 0;
      return json(res, 200, { ok: true, data: { disconnected: true } });
    }
    if (pathname === "/rc/api/mkdir" && req.method === "POST") {
      const body = await readJson(req);
      const parent = String(body.parent || "E:\\");
      const name2 = String(body.name || "").trim();
      if (!/^[A-Za-z0-9._\-\u4e00-\u9fa5 ]{1,64}$/.test(name2)) return json(res, 400, { ok: false, error: { code: "BAD_NAME", message: "invalid folder name" } });
      const target = pathMod.resolve(parent, name2);
      if (!inside(parent, target)) return json(res, 403, { ok: false, error: { code: "FORBIDDEN", message: "outside parent" } });
      try {
        await fsMod.mkdir(target);
        return json(res, 200, { ok: true, data: { path: target } });
      } catch (error) {
        return json(res, 500, { ok: false, error: { code: "MKDIR_FAILED", message: String(error) } });
      }
    }
    if (pathname === "/rc/api/files") {
      const url = new URL(req.url || "/", "http://x");
      const base = currentCwd();
      const rel = url.searchParams.get("path") || "";
      const target = pathMod.resolve(base, rel);
      if (!inside(base, target)) return json(res, 403, { ok: false, error: { code: "FORBIDDEN", message: "outside workspace" } });
      try {
        const entries = await fsMod.readdir(target, { withFileTypes: true });
        const items = entries.map((e) => ({ name: e.name, dir: e.isDirectory() })).sort((a, b) => a.dir === b.dir ? a.name.localeCompare(b.name) : a.dir ? -1 : 1);
        return json(res, 200, { ok: true, data: { base, path: rel, items } });
      } catch (error) {
        return json(res, 500, { ok: false, error: { code: "LIST_FAILED", message: String(error) } });
      }
    }
    if (pathname === "/rc/api/file") {
      const url = new URL(req.url || "/", "http://x");
      const base = currentCwd();
      const rel = url.searchParams.get("path") || "";
      const target = pathMod.resolve(base, rel);
      if (!inside(base, target)) return json(res, 403, { ok: false, error: { code: "FORBIDDEN", message: "outside workspace" } });
      try {
        const stat = await fsMod.stat(target);
        if (!stat.isFile()) return json(res, 400, { ok: false, error: { code: "NOT_FILE", message: "not a file" } });
        if (stat.size > 512 * 1024) return json(res, 413, { ok: false, error: { code: "TOO_LARGE", message: "file too large" } });
        const content = await fsMod.readFile(target, "utf8");
        return json(res, 200, { ok: true, data: { path: rel, size: stat.size, content } });
      } catch (error) {
        return json(res, 500, { ok: false, error: { code: "READ_FAILED", message: String(error) } });
      }
    }
    return json(res, 404, { ok: false, error: { code: "NOT_FOUND", message: "unknown endpoint" } });
  }
  const server = http.createServer(async (req, res) => {
    req.on("error", () => {
    });
    res.on("error", () => {
    });
    try {
      const url = new URL(req.url || "/", "http://x");
      if (url.pathname.startsWith("/rc/api/")) {
        if (!authorized(req) && url.pathname !== "/rc/api/state") return json(res, 401, { ok: false, error: { code: "UNAUTHORIZED", message: "key required" } });
        lastSeen = Date.now();
        return void await handleApi(req, res, url.pathname);
      }
      if (!authorized(req)) {
        res.writeHead(401, { "content-type": "text/html; charset=utf-8" });
        res.end('<meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#151517;color:#eef2ff;font:16px system-ui;padding:40px">\u9700\u8981\u914D\u5BF9\u53E3\u4EE4\u624D\u80FD\u4F7F\u7528\u3002<br>\u8BF7\u4ECE\u7535\u8111\u7AEF\u63D2\u4EF6\u9762\u677F\u83B7\u53D6\u8BBF\u95EE\u5730\u5740\uFF08\u542B ?k=\u2026\uFF09\u3002</body>');
        return;
      }
      const wasConnected = Date.now() - lastSeen < 15e3;
      lastSeen = Date.now();
      if (!wasConnected) masked = true;
      if (!authCookie) await refreshCookie();
      const upstream = http.request({ host: "127.0.0.1", port: Number(new URL(origin).port || 80), path: req.url, method: req.method, headers: headersFor(req) }, (ur) => {
        const type = String(ur.headers["content-type"] || "");
        const headers = { ...ur.headers };
        const current = Array.isArray(headers["set-cookie"]) ? headers["set-cookie"] : [];
        headers["set-cookie"] = [...current.map((x) => x.replace(/;\s*SameSite=Strict/i, "; SameSite=Lax")), "rc_key=" + accessKey + "; Path=/; SameSite=Lax"];
        if (type.includes("text/html")) {
          const chunks = [];
          ur.on("data", (c) => chunks.push(c));
          ur.on("end", () => {
            let html = Buffer.concat(chunks).toString("utf8");
            const keyScript = "<script>window.__RC_KEY__=" + JSON.stringify(accessKey) + "</script>";
            html = html.replace("</head>", MOBILE_CSS + "</head>").replace("</body>", keyScript + WIDGET + "</body>");
            const buf = Buffer.from(html, "utf8");
            headers["content-length"] = String(buf.length);
            delete headers["transfer-encoding"];
            delete headers["content-encoding"];
            res.writeHead(ur.statusCode || 502, headers);
            res.end(buf);
          });
        } else {
          res.writeHead(ur.statusCode || 502, headers);
          ur.pipe(res);
        }
      });
      upstream.on("error", () => {
        try {
          res.writeHead(502);
          res.end("proxy error");
        } catch {
        }
      });
      req.pipe(upstream);
    } catch (error) {
      ctx.logger?.warn?.("[remote-control] request failed:", String(error));
      try {
        res.writeHead(500);
        res.end("remote-control error");
      } catch {
      }
    }
  });
  server.on("upgrade", (req, socket, head) => {
    socket.on("error", () => {
      try {
        socket.destroy();
      } catch {
      }
    });
    if (!authorized(req)) {
      socket.destroy();
      return;
    }
    lastSeen = Date.now();
    const target = net.connect(Number(new URL(origin).port || 80), "127.0.0.1", () => {
      const h = headersFor(req);
      const lines = ["GET " + req.url + " HTTP/1.1"];
      for (const [k, v] of Object.entries(h)) {
        if (Array.isArray(v)) v.forEach((x) => lines.push(k + ": " + x));
        else lines.push(k + ": " + v);
      }
      target.write(lines.join("\r\n") + "\r\n\r\n");
      if (head && head.length) target.write(head);
      target.pipe(socket);
      socket.pipe(target);
    });
    target.on("error", () => socket.destroy());
  });
  server.on("clientError", (_err, socket) => {
    try {
      socket.destroy();
    } catch {
    }
  });
  await refreshCookie();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", () => resolve());
  });
  const ips = lanIps();
  ctx.logger?.info?.("[remote-control] listening on " + port + " for " + ips.join(", "));
  const probeLock = () => {
    try {
      execFile("tasklist", ["/FI", "IMAGENAME eq LogonUI.exe", "/FO", "CSV", "/NH"], { windowsHide: true, timeout: 3e3 }, (error, stdout) => {
        if (!error) screenLocked = /LogonUI\.exe/i.test(String(stdout));
      });
    } catch {
    }
  };
  probeLock();
  lockProbe = setInterval(probeLock, 4e3);
  lockProbe.unref?.();
  const sessionsSvc = ctx.get?.("sessions");
  const currentCwd = () => {
    try {
      const list = sessionsSvc?.list?.() || [];
      const last = list[list.length - 1];
      const cwd = last?.header?.cwd;
      return typeof cwd === "string" && cwd ? cwd : process.cwd();
    } catch {
      return process.cwd();
    }
  };
  const inside = (base, target) => {
    const b = pathMod.resolve(base);
    const t = pathMod.resolve(target);
    return t === b || t.startsWith(b + pathMod.sep);
  };
  const getState = () => {
    const connected = Date.now() - lastSeen < 15e3;
    if (!connected && masked) masked = false;
    return { connected, masked, failedAttempts, screenLocked, port };
  };
  const verifyCode = (code) => {
    const ok = verifyTotp(state.secret, code);
    if (ok) {
      masked = false;
      failedAttempts = 0;
    } else {
      failedAttempts += 1;
    }
    return ok;
  };
  const remask = () => {
    masked = true;
    return masked;
  };
  const urls = (config.publicUrl ? [String(config.publicUrl).replace(/\/$/, "")] : ips.map((ip) => "http://" + ip + ":" + port)).map((base) => base + "/?k=" + accessKey);
  return {
    key: accessKey,
    secret: state.secret,
    port,
    urls,
    addTunnelUrl: (base) => {
      const full = String(base).replace(/\/$/, "") + "/?k=" + accessKey;
      if (!urls.includes(full)) urls.unshift(full);
      return urls;
    },
    getState,
    verifyCode,
    remask,
    close: () => new Promise((resolve) => {
      if (lockProbe) clearInterval(lockProbe);
      server.close(() => resolve());
    })
  };
}

// src/index.ts
var name = "dsh-remote-control";
var inject = ["webServer", "connection"];
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}
function apply(ctx, config = {}) {
  const dataDir = config.dataDir || path2.join(os2.homedir(), ".dsh", "dsh-remote-control");
  const g = globalThis;
  let server = g.__dshRcServer || null;
  let starting = false;
  let tunnel = g.__dshRcTunnel || null;
  let disposed = false;
  let mode = "remote";
  const start = async (choose = "remote") => {
    mode = choose;
    if (g.__dshRcServer) {
      server = g.__dshRcServer;
      return server;
    }
    if (server) return server;
    if (starting) throw new Error("starting");
    starting = true;
    try {
      const created = await createRemoteServer(ctx, { enabled: true, port: config.port, publicUrl: config.publicUrl, dataDir });
      if (disposed) {
        await created.close();
        return created;
      }
      server = created;
      g.__dshRcServer = created;
      try {
        const exe = path2.join(path2.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cloudflared.exe");
        if (mode === "remote" && fs2.existsSync(exe)) {
          const port = config.port || 7466;
          tunnel = spawn2(exe, ["tunnel", "--url", "http://127.0.0.1:" + port, "--no-autoupdate"], { windowsHide: true });
          const onData = (buf) => {
            const m = buf.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (m) {
              created.addTunnelUrl(m[0]);
              ctx.logger?.info?.("[remote-control] tunnel: " + m[0]);
            }
          };
          tunnel.stdout?.on("data", onData);
          tunnel.stderr?.on("data", onData);
          tunnel.on("exit", () => {
            tunnel = null;
            g.__dshRcTunnel = null;
          });
          g.__dshRcTunnel = tunnel;
        }
      } catch (error) {
        ctx.logger?.warn?.("[remote-control] tunnel failed: " + String(error));
      }
      ctx.logger?.info?.("[remote-control] started: " + created.urls.join(" , "));
      return created;
    } finally {
      starting = false;
    }
  };
  const stop = async () => {
    const current = server;
    server = null;
    try {
      const tr = tunnel || g.__dshRcTunnel;
      if (tr) {
        tr.kill();
        tunnel = null;
        g.__dshRcTunnel = null;
      }
    } catch {
    }
    g.__dshRcServer = null;
    if (current) await current.close();
  };
  ctx.effect?.(() => {
    const send = (res, status, payload) => {
      const body = JSON.stringify(payload);
      res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
      res.end(body);
    };
    let disposeRoute;
    try {
      disposeRoute = ctx.webServer?.register({
        kind: "prefix",
        path: "/remote-control",
        handler: async (req, res) => {
          const url = new URL(req.url || "/", "http://localhost");
          try {
            if (url.pathname === "/remote-control/api/status" && req.method === "GET") {
              return send(res, 200, { ok: true, data: { running: Boolean(server), urls: server ? server.urls : [], state: server ? server.getState() : { connected: false, masked: false } } });
            }
            if (url.pathname === "/remote-control/api/start" && req.method === "POST") {
              const m = url.searchParams.get("mode") === "lan" ? "lan" : "remote";
              const created = await start(m);
              return send(res, 200, { ok: true, data: { running: true, urls: created.urls } });
            }
            if (url.pathname === "/remote-control/api/stop" && req.method === "POST") {
              await stop();
              return send(res, 200, { ok: true, data: { running: false } });
            }
            if (url.pathname === "/remote-control/api/mask/state") {
              return send(res, 200, { ok: true, data: server ? server.getState() : { connected: false, masked: false } });
            }
            if (url.pathname === "/remote-control/api/mask/verify" && req.method === "POST") {
              const body = await readBody(req);
              return send(res, 200, { ok: true, data: { valid: server ? server.verifyCode(String(body.code || "")) : false } });
            }
            return send(res, 404, { ok: false, error: { code: "NOT_FOUND", message: "unknown" } });
          } catch (error) {
            try {
              fs2.appendFileSync(path2.join(os2.homedir(), ".dsh", "dsh-remote-control", "control-error.log"), (/* @__PURE__ */ new Date()).toISOString() + " " + String(error?.stack || error) + "\n");
            } catch {
            }
            try {
              return send(res, 500, { ok: false, error: { code: "FAILED", message: String(error?.message || error) } });
            } catch {
              return;
            }
          }
        }
      });
    } catch (error) {
      ctx.logger?.warn?.("[remote-control] routes failed: " + String(error));
    }
    if (config.autoStart) void start().catch((error) => ctx.logger?.warn?.("[remote-control] auto start failed: " + String(error)));
    return () => {
      disposed = true;
      if (disposeRoute) disposeRoute();
    };
  }, "remote-control: control-api");
}
var index_default = { name, inject, apply };
export {
  apply,
  index_default as default,
  inject,
  name
};
