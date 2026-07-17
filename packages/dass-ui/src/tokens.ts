// دسّ — shared design tokens + identity primitives + keyframes. Both clients inject this,
// then add their own layout CSS. Overshoot easing is used ONLY for the crack + the winner.

export const baseCss = `
:root{
  --bg:#0A0A0F; --surface:#14141B; --surface-2:#1C1C25;
  --line:rgba(245,240,232,.10); --line-strong:rgba(245,240,232,.18);
  --up:#23E27E; --down:#FF2E43; --gold:#F2B33D; --gold-deep:#C8912A;
  --text:#F5F0E8; --muted:#8A8A94; --white:#FFFFFF;
  /* motion tokens (mirror motion.ts) */
  --t-instant:90ms; --t-quick:180ms; --t-base:300ms; --t-declare:460ms;
  --t-stock:640ms; --t-reveal:700ms; --t-vault:520ms; --t-stab:200ms; --t-dramatic:1400ms;
  --ease-out:cubic-bezier(.16,1,.3,1);
  --ease-stock:cubic-bezier(.4,0,.2,1);      /* no overshoot */
  --ease-firm:cubic-bezier(.2,.9,.3,1);       /* vault snap: firm settle */
  --ease-overshoot:cubic-bezier(.34,1.7,.5,1); /* RESERVED: dassة + winner only */
  --font-ar:'Tajawal','Segoe UI','Tahoma',system-ui,sans-serif;
  --font-mono:'Cascadia Code','Consolas',ui-monospace,monospace;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{
  background:var(--bg); color:var(--text); font-family:var(--font-ar);
  -webkit-font-smoothing:antialiased; overflow:hidden;
  text-rendering:optimizeLegibility;
}
button{font-family:inherit; color:inherit; cursor:pointer; border:0; background:none}
:focus-visible{outline:2px solid var(--gold); outline-offset:3px}
.mono{font-family:var(--font-mono); font-variant-numeric:tabular-nums}
.muted{color:var(--muted)}

/* --- buttons --- */
.btn{
  background:var(--surface-2); border:1px solid var(--line-strong); color:var(--text);
  padding:14px 22px; font-size:18px; font-weight:700; border-radius:2px;
  transition:transform var(--t-instant) var(--ease-out), background var(--t-quick) var(--ease-out);
}
.btn:active{transform:scale(.97)}
.btn.primary{background:var(--gold); color:#1a1206; border-color:var(--gold)}
.btn[disabled]{opacity:.4; pointer-events:none}

/* --- action choices (support/attack/sell) --- */
.action{
  display:flex; flex-direction:column; align-items:center; gap:8px;
  padding:16px; border:2px solid var(--line-strong); border-radius:3px; background:var(--surface);
  transition:transform var(--t-instant) var(--ease-out), border-color var(--t-quick) var(--ease-out);
  font-weight:800; font-size:19px;
}
.action:active{transform:scale(.97)}
.action.up{color:var(--up)} .action.dump{color:var(--down)} .action.sell{color:var(--gold)}
.action.selected.up{border-color:var(--up)} .action.selected.dump{border-color:var(--down)} .action.selected.sell{border-color:var(--gold)}
.action .lbl{color:var(--text)}

/* --- live stock bar (numberless) --- */
.bar-wrap{display:flex; flex-direction:column; align-items:center; justify-content:flex-end}
.bar{width:100%; background:linear-gradient(180deg,var(--up),#137a49);
  transition:height var(--t-stock) var(--ease-stock), background var(--t-stock) var(--ease-stock)}
.bar.dn{background:linear-gradient(180deg,#8f1a26,var(--down))}

/* --- vault number (gold, still, "settled fact") --- */
.vault{font-weight:900; color:var(--gold); font-variant-numeric:tabular-nums; letter-spacing:-.02em}
.vault.snap{animation:vaultSnap var(--t-vault) var(--ease-firm)}

/* --- الوسيط bubble --- */
.waseet{display:flex; align-items:center; gap:10px; background:var(--surface); border:1px solid var(--line);
  border-radius:3px; padding:10px 14px; max-width:520px; animation:bloomIn var(--t-base) var(--ease-out)}
.waseet .txt{font-weight:700}

/* --- countdown ring (low visual weight on purpose) --- */
.ring{--p:1; width:56px; height:56px; border-radius:50%;
  background:conic-gradient(var(--muted) calc(var(--p)*360deg), transparent 0);
  -webkit-mask:radial-gradient(closest-side, transparent 72%, #000 74%);
          mask:radial-gradient(closest-side, transparent 72%, #000 74%);
  transition:background 250ms linear}
.ring.urgent{background:conic-gradient(var(--gold) calc(var(--p)*360deg), transparent 0)}

/* --- dassة crack overlay --- */
.crack path{stroke:var(--white); stroke-width:3; fill:none; stroke-linejoin:miter;
  stroke-dasharray:240; stroke-dashoffset:240}
.crack.go path{animation:crackDraw var(--t-stab) var(--ease-overshoot) forwards}

@keyframes bloomIn{from{opacity:0; transform:scale(.92)} to{opacity:1; transform:scale(1)}}
@keyframes vaultSnap{0%{transform:scale(.6); opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1); opacity:1}}
@keyframes crackDraw{to{stroke-dashoffset:0}}
@keyframes shake{10%,90%{transform:translateX(-1px)} 30%,70%{transform:translateX(2px)} 50%{transform:translateX(-2px)}}
@keyframes breathe{0%,100%{opacity:.5} 50%{opacity:.85}}
@keyframes sealSweep{from{transform:translateX(-100%)} to{transform:translateX(100%)}}
.shake{animation:shake var(--t-base) var(--ease-out)}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms !important; transition-duration:.001ms !important}
}
`;

export function injectBase(): void {
  const s = document.createElement('style');
  s.textContent = baseCss;
  document.head.appendChild(s);
}
