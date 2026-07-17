// دسّ — Design System. One central token layer + reusable component classes + keyframes.
// Injected once per client; screens compose from these, never redefine them.

export const baseCss = `
:root{
  /* ground & surfaces (warm-cool near-black, layered depth) */
  --bg:#08070C; --bg-1:#0D0A13; --bg-2:#120E1B;
  --surface:#171122; --surface-2:#1F1830; --surface-3:#2A2140;
  --line:rgba(245,239,228,.07); --line-2:rgba(245,239,228,.14); --line-3:rgba(245,239,228,.22);
  /* functional colors (max 4 over bg+text) */
  --gold:#EBB24C; --gold-2:#F7CE72; --gold-deep:#A9762A;   /* primary + Vault (locked) */
  --green:#35D6A0;                                          /* support / live up */
  --red:#FF4D5E;                                            /* attack / betray / live down */
  --violet:#8B79F2;                                         /* secret / focus accent */
  /* text */
  --text:#F5EFE4; --text-2:#CFC7DA; --muted:#948CA6;
  /* elevation / glow / blur */
  --sh-1:0 2px 10px rgba(0,0,0,.35);
  --sh-2:0 10px 34px rgba(0,0,0,.5);
  --sh-card:0 18px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
  --glow-gold:0 0 42px rgba(235,178,76,.28);
  --glow-green:0 0 34px rgba(53,214,160,.3);
  --glow-red:0 0 34px rgba(255,77,94,.32);
  --blur-1:8px; --blur-2:18px;
  /* radius / spacing / type */
  --r-1:8px; --r-2:14px; --r-3:22px; --r-pill:999px;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:72px;
  --fs-display:clamp(44px,9vw,132px); --fs-h1:clamp(28px,5vw,64px); --fs-h2:clamp(22px,3.4vw,40px);
  --fs-h3:clamp(18px,2.4vw,26px); --fs-body:clamp(15px,1.6vw,19px); --fs-label:13px; --fs-cap:12px;
  --fs-vault:clamp(30px,4.4vw,72px); --fs-code:clamp(40px,7vw,96px);
  /* motion (mirror motion.ts) */
  --t-instant:110ms; --t-micro:190ms; --t-comp:340ms; --t-scene:680ms;
  --e-out:cubic-bezier(.2,.85,.25,1); --e-inout:cubic-bezier(.65,0,.35,1);
  --e-sharp:cubic-bezier(.9,.03,.2,1); --e-pull:cubic-bezier(.16,1,.3,1); --e-spring:cubic-bezier(.34,1.56,.64,1);
  /* z-layers */
  --z-bg:0; --z-content:10; --z-hud:20; --z-overlay:30; --z-toast:40; --z-modal:50;
  /* safe areas */
  --safe-t:env(safe-area-inset-top,0px); --safe-b:env(safe-area-inset-bottom,0px);
  --safe-l:env(safe-area-inset-left,0px); --safe-r:env(safe-area-inset-right,0px);
  --font:'Tajawal','Segoe UI','Tahoma',system-ui,sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{
  background:var(--bg); color:var(--text); font-family:var(--font); font-weight:500;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; overflow:hidden;
  overscroll-behavior:none; -webkit-tap-highlight-color:transparent;
}
button{font-family:inherit;color:inherit;background:none;border:0;cursor:pointer}
input{font-family:inherit}
:focus{outline:none}
:focus-visible{outline:2px solid var(--violet);outline-offset:3px;border-radius:6px}
.mono{font-variant-numeric:tabular-nums;letter-spacing:.02em}
.muted{color:var(--muted)}
.dim{color:var(--text-2)}
.up{color:var(--green)} .dn{color:var(--red)} .gold{color:var(--gold)}
.center{display:flex;align-items:center;justify-content:center}
.col{display:flex;flex-direction:column}
.hide{display:none!important}

/* --- wordmark --- */
.wordmark{font-weight:900;letter-spacing:-.02em;line-height:.9;
  background:linear-gradient(180deg,var(--text),#d9cdb6);-webkit-background-clip:text;background-clip:text;color:transparent}
.wordmark.g{background:linear-gradient(120deg,var(--gold-2),var(--gold),var(--gold-deep));-webkit-background-clip:text;background-clip:text;color:transparent}

/* --- buttons --- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);
  padding:15px 26px;font-size:var(--fs-body);font-weight:700;border-radius:var(--r-2);
  background:var(--surface-2);color:var(--text);border:1px solid var(--line-2);
  transition:transform var(--t-instant) var(--e-out),background var(--t-micro) var(--e-out),border-color var(--t-micro) var(--e-out),box-shadow var(--t-micro) var(--e-out);
  min-height:52px}
.btn:hover{background:var(--surface-3);border-color:var(--line-3)}
.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(180deg,var(--gold-2),var(--gold));color:#241704;border-color:transparent;box-shadow:var(--glow-gold)}
.btn.primary:hover{filter:brightness(1.06)}
.btn.ghost{background:transparent}
.btn.danger{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.btn.wide{width:100%}
.btn[disabled]{opacity:.4;pointer-events:none;box-shadow:none}
.icon-btn{width:46px;height:46px;border-radius:var(--r-pill);display:grid;place-items:center;
  background:var(--surface-2);border:1px solid var(--line-2);color:var(--text-2);
  transition:transform var(--t-instant) var(--e-out),color var(--t-micro),border-color var(--t-micro)}
.icon-btn:hover{color:var(--text);border-color:var(--line-3)}
.icon-btn:active{transform:scale(.92)}

/* --- input --- */
.input{width:100%;padding:16px 18px;font-size:clamp(18px,4.5vw,22px);font-weight:700;text-align:center;
  color:var(--text);background:var(--surface);border:1.5px solid var(--line-2);border-radius:var(--r-2);
  transition:border-color var(--t-micro) var(--e-out),box-shadow var(--t-micro) var(--e-out)}
.input::placeholder{color:var(--muted);font-weight:500}
.input:focus{border-color:var(--violet);box-shadow:0 0 0 4px color-mix(in srgb,var(--violet) 18%,transparent)}
.input.err{border-color:var(--red);box-shadow:0 0 0 4px color-mix(in srgb,var(--red) 18%,transparent)}

/* --- panel / card --- */
.panel{background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line-2);
  border-radius:var(--r-3);box-shadow:var(--sh-card);position:relative;overflow:hidden}
.panel::before{content:'';position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,var(--line-3),transparent)}

/* --- player card + avatar --- */
.pcard{display:flex;align-items:center;gap:var(--s3);padding:12px 14px;border-radius:var(--r-2);
  background:var(--surface);border:1px solid var(--line-2);transition:border-color var(--t-micro) var(--e-out),opacity var(--t-micro),transform var(--t-micro) var(--e-out)}
.pcard.is-ready{border-color:color-mix(in srgb,var(--green) 55%,transparent)}
.pcard.is-you{background:linear-gradient(180deg,var(--surface-2),var(--surface));border-color:var(--line-3)}
.pcard.is-off{opacity:.45}
.pcard .nm{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.avatar{width:38px;height:38px;flex:0 0 auto;border-radius:12px;display:grid;place-items:center;font-weight:900;
  color:#0c0a12;font-size:17px}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-cap);font-weight:800;padding:4px 9px;border-radius:var(--r-pill);
  background:var(--surface-3);color:var(--text-2);border:1px solid var(--line-2)}
.badge.ok{color:var(--green);border-color:color-mix(in srgb,var(--green) 40%,transparent)}
.badge.host{color:var(--gold);border-color:color-mix(in srgb,var(--gold) 40%,transparent)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--muted)}
.dot.on{background:var(--green);box-shadow:0 0 8px var(--green)}
.dot.off{background:var(--red)}

/* --- timer ring --- */
.ring{--p:1;position:relative;width:var(--rs,56px);height:var(--rs,56px);border-radius:50%;
  background:conic-gradient(var(--gold) calc(var(--p)*360deg),var(--surface-3) 0);
  -webkit-mask:radial-gradient(closest-side,transparent 70%,#000 72%);mask:radial-gradient(closest-side,transparent 70%,#000 72%);
  transition:background .25s linear}
.ring.urgent{background:conic-gradient(var(--red) calc(var(--p)*360deg),var(--surface-3) 0)}

/* --- live bar + vault --- */
.bar{width:100%;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,var(--green),color-mix(in srgb,var(--green) 30%,#0a1a12));
  transition:height var(--t-scene) var(--e-out),background var(--t-scene) var(--e-out),box-shadow var(--t-micro)}
.bar.falling{background:linear-gradient(180deg,color-mix(in srgb,var(--red) 60%,#180a0d),var(--red))}
.vaultnum{font-weight:900;color:var(--gold);font-variant-numeric:tabular-nums;letter-spacing:-.02em;text-shadow:0 0 22px rgba(235,178,76,.35)}
.vaultnum.snap{animation:vaultSnap var(--t-scene) var(--e-spring)}

/* --- الوسيط --- */
.waseet{display:inline-flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--surface-2) 88%,transparent);
  backdrop-filter:blur(var(--blur-1));border:1px solid var(--line-2);border-radius:var(--r-pill);padding:9px 16px;
  font-weight:700;box-shadow:var(--sh-1)}
.waseet .wm{flex:0 0 auto}

/* --- toast --- */
.toast{position:fixed;left:50%;top:calc(var(--safe-t) + 12px);transform:translateX(-50%);z-index:var(--z-toast);
  background:var(--surface-3);border:1px solid var(--line-2);border-radius:var(--r-pill);padding:10px 18px;font-weight:800;
  box-shadow:var(--sh-2);animation:toastIn var(--t-comp) var(--e-spring)}
.toast.err{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.toast.ok{color:var(--green)}

/* --- scene container --- */
.scene{position:relative;z-index:var(--z-content);width:100%;min-height:100dvh;
  padding:calc(var(--safe-t) + var(--s5)) calc(var(--safe-r) + var(--s5)) calc(var(--safe-b) + var(--s5)) calc(var(--safe-l) + var(--s5))}

/* keyframes */
@keyframes vaultSnap{0%{transform:scale(.55);opacity:0}55%{transform:scale(1.14)}100%{transform:scale(1);opacity:1}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:.9}}
@keyframes sealSweep{from{transform:translateX(-120%)}to{transform:translateX(120%)}}
@keyframes crackDraw{to{stroke-dashoffset:0}}
@keyframes floatUp{to{transform:translateY(-14vh);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:34px;height:34px;border-radius:50%;border:3px solid var(--line-2);border-top-color:var(--gold);animation:spin .8s linear infinite}

/* scroll reveal */
[data-reveal]{opacity:0;transform:translateY(30px);transition:opacity .8s var(--e-pull),transform .8s var(--e-pull)}
[data-reveal].in{opacity:1;transform:none}
[data-reveal] [data-rc]{opacity:0;transform:translateY(18px);transition:opacity .7s var(--e-pull),transform .7s var(--e-pull)}
[data-reveal].in [data-rc]{opacity:1;transform:none}
[data-reveal].in [data-rc]:nth-child(2){transition-delay:.08s}
[data-reveal].in [data-rc]:nth-child(3){transition-delay:.16s}
[data-reveal].in [data-rc]:nth-child(4){transition-delay:.24s}
[data-reveal].in [data-rc]:nth-child(5){transition-delay:.32s}
[data-px]{will-change:transform;transition:transform .25s var(--e-out)}
@media (prefers-reduced-motion: reduce){[data-reveal],[data-reveal] [data-rc]{opacity:1;transform:none;transition:none}}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;

export function injectBase(): void {
  const s = document.createElement('style');
  s.id = 'dass-base';
  s.textContent = baseCss;
  document.head.appendChild(s);
}
