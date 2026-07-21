export const SITE_CSS = String.raw`
:root[data-site-theme="backfire"]{
  color-scheme:dark;
  /* Editorial-noir palette: black / graphite / paper, with a single controlled red. */
  --bf-black:#080808;--bf-ink:#0c0c0d;--bf-charcoal:#151517;--bf-graphite:#222226;--bf-lead:#3a3a40;--bf-steel:#66666d;--bf-gray:#7c7c83;--bf-muted:#9a9a9f;--bf-paper:#f0efea;--bf-paper-shadow:#d8d6d0;--bf-white:#fafaf7;--bf-red:#b72e38;--bf-red-dark:#811c25;--bf-red-soft:#c8454d;--bf-ink-2:#404046;
  --maxw:1440px;--pad:clamp(20px,5vw,84px);
  --space-3:.75rem;--space-4:1rem;--space-5:1.5rem;--space-6:2rem;--space-7:3rem;--space-8:4.5rem;--space-9:6rem;
  --e-out:cubic-bezier(.22,1,.36,1);--t-fast:200ms;--t-micro:180ms;--t-instant:120ms;--t-comp:520ms;
  --line:rgba(250,250,247,.12);--line-2:rgba(250,250,247,.2);--line-3:rgba(250,250,247,.28);
  --shadow:0 30px 90px rgba(0,0,0,.6);--shadow-1:0 14px 40px rgba(0,0,0,.5);
  /* compatibility map for the commercial product/store pages (kept dark, neutral, warm-red accent) */
  --bg:var(--bf-black);--bg-1:var(--bf-ink);--surface:var(--bf-charcoal);--surface-2:var(--bf-graphite);--surface-3:#2c2c30;--text:var(--bf-white);--text-2:var(--bf-muted);--muted:var(--bf-gray);--warm:var(--bf-white);--warm-2:#d7d6d2;--crimson:var(--bf-red-dark);--wine:#1a1013;--red:var(--bf-red);--red-hot:var(--bf-red-soft);--ember:var(--bf-red-soft);--gold:var(--bf-red);--violet:var(--bf-red);--cyan:var(--bf-red-soft);--green:var(--bf-muted);--accent:var(--bf-red);
  --z-content:2;--r-2:8px;--r-3:12px;--r-pill:999px;--fs-h1:clamp(40px,6vw,74px);--fs-h2:clamp(28px,4vw,46px);--fs-h3:19px;
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{background:var(--bf-black);scroll-behavior:smooth;scrollbar-color:var(--bf-lead) var(--bf-black)}
body.backfire-site{margin:0;min-width:320px;background:var(--bf-black);color:var(--bf-white);font-family:'Tajawal','Segoe UI',Tahoma,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
/* One quiet film-grain layer across the whole page, blended so it reads on paper and black alike. */
body.backfire-site::after{content:'';position:fixed;inset:0;z-index:120;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.backfire-site a,.backfire-site button,.backfire-site input{font:inherit;color:inherit}
.backfire-site a{cursor:pointer;text-decoration:none}
.backfire-site a,.backfire-site button{touch-action:manipulation}
.backfire-site ::selection{background:var(--bf-red);color:var(--bf-white)}
:focus-visible{outline:2px solid var(--bf-red-soft);outline-offset:3px}
img,svg{max-width:100%}
em{font-style:normal;color:var(--bf-red)}

.scene{display:block;width:100%;height:100%}
[data-reveal]{opacity:0;transform:translateY(22px);transition:opacity .8s var(--e-out),transform .8s var(--e-out)}
[data-reveal].revealed{opacity:1;transform:none}
.rl-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.15s var(--e-out) .15s}
.revealed .rl-draw{stroke-dashoffset:0}
.rl-head,.cs-head,.cs-return,.fs-head,.rl-src,.cs-src,.cs-impact{opacity:0;transition:opacity .5s var(--e-out) .9s}
.revealed .rl-head,.revealed .cs-head,.revealed .cs-return,.revealed .fs-head,.revealed .rl-src,.revealed .cs-src,.revealed .cs-impact{opacity:1}
.pv-secret{opacity:0;transition:opacity .55s var(--e-out) .45s}.revealed .pv-secret{opacity:1}

.skip-link{position:fixed;z-index:1000;inset-block-start:10px;inset-inline-start:10px;transform:translateY(-160%);background:var(--bf-white);color:var(--bf-black);padding:10px 14px;border-radius:4px;font-weight:800}
.skip-link:focus{transform:none}

/* ---------------- header ---------------- */
.site-head{position:fixed;z-index:60;inset-block-start:0;inset-inline:0;height:74px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding-inline:var(--pad);transition:background var(--t-fast),border-color var(--t-fast),height var(--t-fast);border-block-end:1px solid transparent}
.site-head.scrolled{height:64px;background:rgba(8,8,8,.86);backdrop-filter:blur(10px);border-block-end-color:var(--line)}
.bf-word{display:inline-block;font:900 clamp(1.35rem,2vw,1.7rem)/1 'Arial Black','Segoe UI',sans-serif;letter-spacing:.03em;color:var(--bf-white);direction:ltr}
.head-nav{display:flex;align-items:center;gap:clamp(14px,2vw,28px)}
.head-nav a{font-size:14px;font-weight:700;color:var(--bf-muted)}
.head-nav a:hover{color:var(--bf-white)}
.head-actions{display:flex;align-items:center;gap:10px}.nav-logo{display:inline-flex;align-items:center;align-self:stretch}
.head-account{display:inline-flex;align-items:center;height:42px;padding-inline:14px;border:1px solid var(--line-2);color:var(--bf-white);font-weight:700;border-radius:4px;font-size:14px}
.head-account:hover,.head-account.on{border-color:var(--bf-white);background:rgba(255,255,255,.05)}
.head-cta{display:inline-flex;align-items:center;height:42px;padding-inline:18px;background:var(--bf-red);color:var(--bf-white);font-weight:800;border-radius:4px;font-size:14px}
.head-cta:hover{background:var(--bf-red-soft)}
.mobile-panel .mpanel-account{color:var(--bf-white)}
.mobile-panel .mpanel-cta{color:var(--bf-red);font-weight:800}
.head-menu{display:none;width:44px;height:44px;border:1px solid var(--line-2);background:transparent;border-radius:4px;place-items:center;cursor:pointer}
.head-menu span{position:absolute;width:18px;height:2px;background:var(--bf-white);transition:.2s}
.head-menu span:first-child{transform:translateY(-4px)}.head-menu span:last-child{transform:translateY(4px)}
.menu-open .head-menu span:first-child{transform:rotate(45deg)}.menu-open .head-menu span:last-child{transform:rotate(-45deg)}
.mobile-panel{position:fixed;z-index:59;inset-block-start:64px;inset-inline:12px;padding:8px;background:rgba(13,13,14,.98);border:1px solid var(--line-2);border-radius:8px}
.mobile-panel a{display:block;padding:15px;color:var(--bf-white);font-weight:700;border-block-end:1px solid var(--line)}
.mobile-panel a:last-child{border:0}

/* ---------------- buttons ---------------- */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding-inline:24px;border:1px solid transparent;border-radius:5px;font-weight:800;cursor:pointer;transition:transform var(--t-micro) var(--e-out),background var(--t-micro),border-color var(--t-micro),color var(--t-micro)}
.btn.lg{min-height:56px;padding-inline:30px;font-size:16px}
.btn.wide{width:100%}
.btn.primary{background:var(--bf-red);color:var(--bf-white)}
.btn.primary:hover{background:var(--bf-red-soft);transform:translateY(-2px)}
.btn.ghost{background:transparent;border-color:var(--line-3);color:var(--bf-white)}
.btn.ghost:hover{border-color:var(--bf-white);transform:translateY(-2px)}
.on-paper .btn.ghost{border-color:rgba(13,13,14,.28);color:var(--bf-ink)}
.on-paper .btn.ghost:hover{border-color:var(--bf-ink)}
.btn[disabled]{opacity:.55;cursor:wait;transform:none}
.text-link{color:var(--bf-red-soft);font-weight:700;text-underline-offset:5px}
.on-paper .text-link{color:var(--bf-red)}

/* ---------------- section scaffolding + tonal rhythm ---------------- */
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--bf-red-soft);text-transform:uppercase}
.eyebrow::before{content:'';width:26px;height:2px;background:currentColor}
.on-paper .eyebrow{color:var(--bf-red)}
.poster{position:relative;min-height:clamp(560px,84svh,880px);display:grid;align-items:center;padding-block:clamp(80px,12vh,148px);padding-inline:var(--pad)}
.poster-inner{width:100%;max-width:var(--maxw);margin-inline:auto;display:grid;gap:clamp(28px,5vw,80px);align-items:center}
.poster h2{font-size:clamp(2.2rem,4.2vw,4.8rem);line-height:1;letter-spacing:-.025em;margin:14px 0 18px;text-wrap:balance}
.poster p{font-size:clamp(17px,1.35vw,21px);line-height:1.7;max-width:34ch;margin:0}
.on-dark{color:var(--bf-white)}.on-dark p{color:var(--bf-muted)}
.on-paper{color:var(--bf-ink)}.on-paper p{color:var(--bf-lead)}

/* hero */
.hero-noir{position:relative;min-height:100svh;overflow:hidden;background:radial-gradient(130% 100% at 50% 8%,#141416,var(--bf-black) 60%);display:flex;align-items:flex-start}
.hero-inner{position:relative;z-index:2;width:100%;max-width:var(--maxw);margin-inline:auto;padding:clamp(110px,14vh,172px) var(--pad) 0}
.hero-copy{max-width:min(620px,92%)}
.hero-noir h1{font-size:clamp(3rem,6vw,6.4rem);line-height:.98;letter-spacing:-.035em;margin:18px 0 20px;text-wrap:balance}
.hero-lead{font-size:clamp(17px,1.35vw,21px);line-height:1.7;color:var(--bf-muted);max-width:34ch;margin:0}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-block-start:30px}
.hero-note{display:flex;align-items:center;gap:9px;margin-block-start:22px;color:var(--bf-gray);font-size:12px}
.hero-note i{width:7px;height:7px;border-radius:50%;background:var(--bf-red);flex:0 0 auto}
.hero-facts{display:flex;flex-wrap:wrap;align-items:center;gap:9px 18px;list-style:none;margin:20px 0 0;padding:0;color:var(--bf-muted);font-size:13px;font-weight:700}
.hero-facts li{display:inline-flex;align-items:center;gap:8px}
.hero-facts li::before{content:'';width:5px;height:5px;background:var(--bf-red);transform:rotate(45deg);flex:0 0 auto}
.hero-art{position:absolute;z-index:1;left:calc(var(--pad) - 10px);bottom:8%;width:min(52%,880px)}
.hero-art .hero-scene{width:100%;height:auto;display:block}
.scroll-cue{position:absolute;z-index:2;inset-block-end:22px;inset-inline-start:50%;transform:translateX(-50%);display:grid;justify-items:center;gap:6px;color:var(--bf-gray);font-size:10px}
.scroll-cue i{width:1px;height:26px;background:linear-gradient(var(--bf-red),transparent)}

/* Poster 01 — incomplete picture: a paper editorial panel framed by a dark section,
   so the jump from black is a bridge, not a wall. A red seam carries the eye across. */
.poster-incomplete{position:relative;background:var(--bf-charcoal)}
.poster-incomplete .poster-inner{grid-template-columns:1.05fr .95fr;background:var(--bf-paper);color:var(--bf-ink);padding:clamp(34px,4.4vw,70px);box-shadow:0 46px 100px rgba(0,0,0,.5)}
.poster-incomplete .poster-art{order:-1}
.incomplete-scene{aspect-ratio:660/560;filter:drop-shadow(0 14px 30px rgba(0,0,0,.16))}

/* Poster 02 — private knowledge (graphite) */
.poster-private{background:var(--bf-graphite)}
.poster-private .poster-inner{grid-template-columns:.92fr 1.08fr}
.private-scene{aspect-ratio:640/520}

/* Social tension — one editorial, typographic beat: a statement + a wall of overheard accusations. No cards, no chat UI. */
.social-noir{position:relative;min-height:clamp(520px,76svh,800px);display:grid;align-items:center;padding:clamp(80px,12vh,146px) var(--pad);background:radial-gradient(78% 72% at 28% 42%,#150a0c,var(--bf-black) 60%)}
.social-inner{width:100%;max-width:var(--maxw);margin-inline:auto;display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(28px,5vw,66px);align-items:center}
.social-copy{max-width:22ch}
.social-head{font-size:clamp(2.2rem,4.4vw,4.8rem);line-height:1;letter-spacing:-.025em;margin:14px 0 18px;text-wrap:balance}
.social-note{color:var(--bf-muted);font-size:clamp(15px,1.2vw,18px);line-height:1.7;max-width:44ch;margin:0}
.social-lines{position:relative;height:clamp(300px,44vh,430px)}
.sl{position:absolute;white-space:nowrap;font-weight:900;color:var(--bf-white);letter-spacing:-.01em}
.sl-1{top:3%;inset-inline-end:2%;font-size:clamp(19px,2.4vw,32px);transform:rotate(-2deg)}
.sl-2{top:31%;inset-inline-start:0;font-size:clamp(16px,1.9vw,25px);color:var(--bf-muted);transform:rotate(1deg)}
.sl-3{top:55%;inset-inline-end:5%;font-size:clamp(17px,2.1vw,27px);transform:rotate(-1deg)}
.sl-4{bottom:2%;inset-inline-start:3%;font-size:clamp(22px,2.9vw,40px);color:var(--bf-red-soft);transform:rotate(2deg)}

/* Consequence (black, the red event) */
.poster-consequence{background:radial-gradient(88% 78% at 60% 52%,#160a0c,var(--bf-black) 62%)}
.poster-consequence .poster-inner{grid-template-columns:.94fr 1.06fr}
.poster-consequence h2{font-size:clamp(2.3rem,4vw,4.5rem)}
.consequence-scene{aspect-ratio:1000/580}

/* ---------------- product reality (paper) — the only devices on the site ---------------- */
.product-noir{background:var(--bf-paper);color:var(--bf-ink);padding-block:clamp(84px,13vh,150px);padding-inline:var(--pad)}
.product-inner{width:100%;max-width:var(--maxw);margin-inline:auto}
.product-head{max-width:min(620px,92%);margin-bottom:clamp(38px,5vw,62px)}
.product-head h2{font-size:clamp(2.2rem,4vw,4.4rem);line-height:1;letter-spacing:-.025em;margin:14px 0 16px}
.product-head p{font-size:clamp(17px,1.3vw,20px);line-height:1.7;color:var(--bf-lead);margin:0;max-width:46ch}
.product-stage{display:grid;grid-template-columns:1.55fr 1fr;gap:clamp(30px,4vw,64px);align-items:center;max-width:1180px}
.stage-tv{position:relative}
.stage-tv figcaption,.stage-phones figcaption{margin-block-start:16px;display:flex;gap:9px;align-items:baseline;color:var(--bf-lead);font-size:14px}
.stage-tv figcaption b,.stage-phones figcaption b{color:var(--bf-ink);font-weight:800}
.stage-phones{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2vw,28px);align-items:center}
.stage-phones .phone-unit{width:100%}
.product-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin:clamp(40px,6vw,68px) 0 0;padding:0;list-style:none;background:rgba(13,13,14,.14);counter-reset:none}
.product-steps li{list-style:none;display:flex;align-items:center;justify-content:center;gap:14px;padding:26px 12px;background:var(--bf-paper);border-block-start:2px solid var(--bf-red)}
.product-steps span{font-size:clamp(17px,1.6vw,20px);font-weight:700;color:var(--bf-ink)}

/* ---------------- final CTA (black) ---------------- */
.final-noir{position:relative;min-height:clamp(560px,80svh,820px);display:grid;place-items:center;overflow:hidden;padding:clamp(90px,12vh,150px) var(--pad);text-align:center;background:radial-gradient(80% 70% at 50% 46%,#140a0c,var(--bf-black) 60%)}
.final-art{position:absolute;z-index:0;inset:0;display:grid;place-items:center;opacity:.9}
.final-art .final-scene{width:min(760px,92%)}
.final-inner{position:relative;z-index:2;display:grid;justify-items:center;gap:22px}
.final-noir h2{font-size:clamp(2.6rem,6vw,6rem);line-height:.98;letter-spacing:-.035em;margin:0;text-wrap:balance}
.final-noir p{color:var(--bf-muted);font-size:18px;margin:0}

/* ---------------- footer ---------------- */
.foot-noir{background:var(--bf-black);border-block-start:1px solid var(--line);padding:clamp(46px,7vw,72px) var(--pad) 26px}
.foot-inner{max-width:var(--maxw);margin-inline:auto;display:flex;flex-wrap:wrap;gap:24px 60px;align-items:flex-start;justify-content:space-between}
.foot-brand{display:grid;gap:8px;max-width:34ch}
.foot-brand p{color:var(--bf-gray);font-size:13px;line-height:1.6;margin:0}
.foot-links{display:flex;gap:44px;flex-wrap:wrap}
.foot-links div{display:grid;gap:11px}
.foot-links b{color:var(--bf-muted);font-size:12px;letter-spacing:.06em}
.foot-links a{color:var(--bf-gray);font-size:14px}
.foot-links a:hover{color:var(--bf-white)}
.foot-cap{max-width:var(--maxw);margin:36px auto 0;padding-block-start:20px;border-block-start:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;color:#5a5a5e;font-size:12px}

/* ---------------- entry pages: create / join ---------------- */
.door{min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.82fr);background:var(--bf-black)}
.door-form{display:flex;flex-direction:column;justify-content:center;gap:6px;padding:clamp(110px,14vh,150px) var(--pad) 60px}
.door-form .eyebrow{margin-bottom:8px}
.door-form h1{font-size:clamp(2.4rem,4.6vw,4.4rem);line-height:1;letter-spacing:-.03em;margin:0 0 14px}
.door-form>p{color:var(--bf-muted);font-size:17px;line-height:1.7;max-width:40ch;margin:0 0 26px}
.field{display:grid;gap:8px;margin-bottom:16px}
.field span{font-size:13px;font-weight:700;color:var(--bf-muted)}
.input{width:100%;min-height:54px;padding:13px 15px;border:1px solid var(--line-2);border-radius:5px;background:var(--bf-ink);color:var(--bf-white);outline:none;transition:border-color var(--t-micro),box-shadow var(--t-micro)}
.input:focus{border-color:var(--bf-red);box-shadow:0 0 0 3px rgba(179,32,45,.22)}
.input.err{border-color:var(--bf-red-soft)}
.input.mono{direction:ltr;text-align:center;font-family:ui-monospace,monospace;letter-spacing:.16em;font-weight:800}
.door-specs{display:flex;gap:26px;margin:6px 0 24px}
.door-specs span{display:grid;gap:3px;font-size:12px;color:var(--bf-gray)}
.door-specs b{font-size:15px;color:var(--bf-white);font-weight:800}
.j-err{min-height:20px;color:var(--bf-red-soft);font-size:13px;font-weight:700}
.door-form .text-link{margin-block-start:20px}
.door-aside{position:relative;overflow:hidden;display:grid;place-items:center;padding:60px;background:var(--bf-graphite)}
.door-aside .scene{width:min(88%,420px)}
.door-caption{position:absolute;inset-block-end:8%;inset-inline:8%;display:grid;gap:5px}
.door-caption span{color:var(--bf-red-soft);font-size:12px;font-weight:800}
.door-caption b{font-size:clamp(18px,2.4vw,30px);color:var(--bf-white);max-width:20ch}
.spinner{width:17px;height:17px;border:2px solid rgba(255,255,255,.35);border-block-start-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* create scene uses the product TV; join scene uses a private phone */
.door-aside .tv-stage{width:100%}
.door-aside .phone-unit{width:min(62%,230px)}

/* ---------------- how to play ---------------- */
.how-noir{background:var(--bf-black)}
.how-hero{min-height:64svh;display:grid;align-content:center;gap:12px;padding:clamp(118px,16vh,180px) var(--pad) clamp(50px,7vh,80px);max-width:var(--maxw);margin-inline:auto}
.how-hero h1{font-size:clamp(2.6rem,5.4vw,5rem);line-height:1;letter-spacing:-.03em;margin:0;max-width:16ch}
.how-hero p{color:var(--bf-muted);font-size:18px;line-height:1.7;max-width:48ch;margin:6px 0 0}
.how-steps{max-width:var(--maxw);margin-inline:auto;padding:0 var(--pad) clamp(70px,10vh,120px);display:grid;gap:1px;background:var(--line)}
.how-step{display:grid;grid-template-columns:1fr auto;gap:clamp(16px,3vw,44px);align-items:center;padding:clamp(26px,4vw,44px) 4px;background:var(--bf-black)}
.how-step h3{position:relative;padding-inline-start:22px}
.how-step h3::before{content:"";position:absolute;inset-inline-start:0;top:.32em;width:9px;height:9px;background:var(--bf-red);transform:rotate(45deg)}
.how-step h3{font-size:clamp(20px,2.4vw,28px);margin:0 0 6px}
.how-step p{color:var(--bf-muted);font-size:16px;line-height:1.6;margin:0;max-width:48ch}
.how-step .step-art{width:120px;height:78px}
.how-cta{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad) clamp(80px,12vh,130px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:22px}
.how-cta h2{font-size:clamp(2rem,4vw,3.4rem);margin:0;letter-spacing:-.02em}
/* how-to-play: what you need */
.how-needs{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad) clamp(50px,7vh,86px);display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,5vw,64px);align-items:center}
.how-needs-copy h2{font-size:clamp(1.9rem,3.4vw,3.2rem);line-height:1;letter-spacing:-.025em;margin:12px 0 12px}
.how-needs-copy p{color:var(--bf-muted);font-size:17px;line-height:1.7;max-width:38ch;margin:0}
.how-need-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
.how-need-list li{list-style:none;display:grid;gap:6px;padding:26px 20px;background:var(--bf-black)}
.how-need-list b{font:900 clamp(26px,3vw,40px)/1 'Arial',sans-serif;color:var(--bf-red)}
.how-need-list span{font-weight:800;font-size:16px;color:var(--bf-white)}
.how-need-list small{color:var(--bf-gray);font-size:13px;line-height:1.5}
/* how-to-play: endgame band */
.how-endgame{position:relative;padding:clamp(70px,10vh,120px) var(--pad);background:radial-gradient(80% 80% at 24% 40%,#160a0c,var(--bf-black) 62%);border-block:1px solid var(--line)}
.how-endgame-inner{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(28px,5vw,66px);align-items:center}
.he-copy h2{font-size:clamp(2rem,3.8vw,3.6rem);line-height:1;letter-spacing:-.025em;margin:12px 0 14px;text-wrap:balance}
.he-copy p{color:var(--bf-muted);font-size:clamp(16px,1.3vw,19px);line-height:1.8;max-width:52ch;margin:0}
.he-facts{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.he-facts li{list-style:none;display:flex;align-items:baseline;gap:16px;padding:18px 22px;border:1px solid var(--line);border-radius:var(--r-3);background:rgba(255,255,255,.02)}
.he-facts b{font:900 24px/1 'Arial',sans-serif;color:var(--bf-red-soft);min-width:2.4em}
.he-facts span{color:var(--bf-white);font-weight:700}
/* how-to-play: tips */
.how-tips{max-width:var(--maxw);margin:0 auto;padding:clamp(60px,9vh,110px) var(--pad) 0}
.how-tips-grid{margin-block-start:24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.how-tips-grid article{padding:26px 22px;border:1px solid var(--line);border-radius:var(--r-3);background:var(--bf-ink)}
.how-tips-grid b{display:block;font-size:18px;color:var(--bf-white);margin-bottom:8px;letter-spacing:-.01em}
.how-tips-grid p{color:var(--bf-muted);font-size:15px;line-height:1.65;margin:0}
/* how-to-play: faq */
.how-faq{max-width:var(--maxw);margin:0 auto;padding:clamp(56px,8vh,100px) var(--pad) 0}
.how-faq .faq-list{margin:0}
.how-faq .faq-list>h2{font-size:clamp(1.8rem,3vw,2.6rem);margin:0 0 8px;letter-spacing:-.02em}
@media(max-width:900px){
  .how-needs{grid-template-columns:1fr;gap:26px}
  .how-endgame-inner{grid-template-columns:1fr;gap:28px}
  .how-tips-grid{grid-template-columns:1fr}
}
@media(max-width:560px){
  .how-need-list{grid-template-columns:1fr}
}

/* ---------------- devices (restyled neutral; used only in product + create) ---------------- */
.tv-stage{position:relative;width:100%;padding-bottom:6.5%}
.tv-frame{position:relative;padding:.8%;border-radius:12px;background:linear-gradient(160deg,#3a3a3e,#161618 44%,#0c0c0d);box-shadow:0 40px 100px rgba(0,0,0,.5)}
.tv-frame::before{content:'';position:absolute;inset:0;border-radius:12px;padding:1px;background:linear-gradient(160deg,rgba(255,255,255,.22),transparent 34%,transparent 66%,rgba(0,0,0,.5));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.tv-bezel{position:relative;overflow:hidden;aspect-ratio:16/9;border-radius:5px;background:#050505;box-shadow:0 0 0 1px #000,0 0 0 3px #1c1c1f}
.tv-glare{position:absolute;inset:0;z-index:6;pointer-events:none;background:linear-gradient(132deg,rgba(255,255,255,.05) 0 7%,transparent 22%)}
.tv-led{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--bf-red);inset-block-end:-1%;inset-inline-start:50%;transform:translateX(-50%);box-shadow:0 0 9px var(--bf-red)}
.tv-neck{position:absolute;width:6%;height:4.2%;inset-block-end:1.1%;inset-inline-start:47%;background:linear-gradient(#242427,#0d0d0e);border-radius:0 0 3px 3px}
.tv-foot{position:absolute;width:24%;height:1.4%;inset-block-end:0;inset-inline-start:38%;border-radius:0 0 46% 46%/0 0 100% 100%;background:#1d1d20;box-shadow:0 14px 28px rgba(0,0,0,.6)}
.game-screen{height:100%;padding:4.4% 4.8%;display:flex;flex-direction:column;color:var(--bf-white);background:radial-gradient(120% 92% at 84% 6%,rgba(179,32,45,.16),transparent 46%),linear-gradient(155deg,#111112,#070707 76%);container-type:inline-size;font-size:clamp(6px,3.05cqw,16px);line-height:1.3}
.gs-hud{display:flex;align-items:center;gap:.7em;color:var(--bf-gray)}
.gs-brand{font:900 1.1em/1 'Arial Black',sans-serif;letter-spacing:.05em;color:var(--bf-white)}
.gs-phase{font-weight:900;color:var(--bf-red-soft)}
.gs-round{margin-inline-start:auto;color:var(--bf-muted);font-weight:800;letter-spacing:.04em}
.gs-chip{margin-inline-start:auto;padding:.32em .68em;border:1px solid rgba(210,72,80,.4);border-radius:.4em;color:var(--bf-red-soft);font-weight:800}
.gs-chip.live::before{content:'';display:inline-block;width:.48em;height:.48em;border-radius:50%;background:var(--bf-red-soft);margin-inline-end:.42em;box-shadow:0 0 6px var(--bf-red-soft)}
.gs-ring{width:2.1em;height:2.1em;flex:0 0 auto;border-radius:50%;background:conic-gradient(var(--bf-red) calc(var(--p)*360deg),rgba(250,250,247,.14) 0);-webkit-mask:radial-gradient(farthest-side,transparent 60%,#000 62%);mask:radial-gradient(farthest-side,transparent 60%,#000 62%)}
.p-av{width:2.4em;height:2.4em;border-radius:.58em;display:grid;place-items:center;background:var(--av,var(--bf-red));color:var(--bf-white);font-weight:900;font-style:normal;flex:0 0 auto;font-size:.92em}
.p-av.ghost{background:transparent;border:1px dashed var(--line-2);color:var(--bf-gray)}
.tv-lobby-screen{padding:4% 5.4%}.lobby-body{flex:1;display:grid;grid-template-columns:auto 1fr;gap:6%;align-items:center}
.lobby-qr{width:min(34%,140px);aspect-ratio:1;padding:3.5%;background:var(--bf-paper);border-radius:6px}
.lobby-qr svg{display:block;width:100%;height:100%}
.lobby-join{display:flex;flex-direction:column;gap:.5em}.lobby-join small{color:var(--bf-gray)}
.lobby-join strong{font:900 3.4em/1 ui-monospace,monospace;letter-spacing:.14em;color:var(--bf-white)}
.lobby-count{color:var(--bf-red-soft);font-weight:800}
.lobby-roster{display:flex;gap:.7em;margin-block-start:auto;padding-block-start:4%}
.round-prompt{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.1em;margin:.5em 0 .7em}
.round-prompt small{color:var(--bf-red-soft);font-weight:900;font-size:1.05em}
.round-count{font:900 2.4em/1 ui-monospace,monospace;color:var(--bf-white)}
.round-floor{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:3.5%;padding-block-end:.2em}
.round-floor .p-av{width:1.9em;height:1.9em;border-radius:.42em}
.rf-col{flex:1;max-width:15%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:.55em}
.rf-intent{width:1.5em;height:1.5em;color:var(--bf-gray)}.rf-intent.up{color:var(--bf-muted)}.rf-intent.dn{color:var(--bf-red-soft)}.rf-intent svg{width:100%;height:100%}
.rf-bar{width:48%;height:var(--h);max-height:62%;min-height:8%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--bf-red-soft),var(--bf-red-dark))}
.rf-col.wait .rf-bar{background:linear-gradient(180deg,#45454a,#232326)}
.tv-reveal-screen{padding:4% 5%}.reveal-list{flex:1;display:flex;flex-direction:column;justify-content:center;gap:.7em}
.rv{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.9em;padding:.85em 1em;border:1px solid var(--line);border-radius:.7em;background:rgba(255,255,255,.02)}
.rv.dassa{border-color:rgba(210,72,80,.5);background:rgba(179,32,45,.08)}
.rv-copy{display:grid;gap:.12em;min-width:0}.rv-copy small{color:var(--bf-gray)}.rv-copy b{color:var(--bf-white);font-size:1.12em}
.rv-tag{padding:.34em .72em;border-radius:.5em;font-weight:900;font-size:.86em}.rv-tag.dassa{background:var(--bf-red);color:#fff}.rv-tag.kept{border:1px solid var(--line-2);color:var(--bf-muted)}
.reveal-foot{display:flex;align-items:center;justify-content:space-between;color:var(--bf-gray);padding-block-start:.6em;margin-block-start:.4em;border-block-start:1px solid var(--line)}
.reveal-foot strong{color:var(--bf-red-soft)}
.tv-conseq-screen{padding:4.4% 5.2%}.conseq-body{display:flex;flex-direction:column;justify-content:center;gap:.15em}
.conseq-eyebrow{color:var(--bf-red-soft);font-weight:900}.tv-conseq-screen h3{margin:.2em 0 0;font-size:2.3em;line-height:1.08}
.conseq-bars{display:flex;align-items:stretch;justify-content:space-between;gap:3%;height:44%;margin-block-start:auto}
.conseq-bars .p-av{width:1.9em;height:1.9em;border-radius:.42em}
.cb{flex:1;display:grid;grid-template-rows:1fr auto auto;justify-items:center;align-items:end;gap:.35em}
.cb::before{content:'';grid-row:1;align-self:end;width:54%;height:var(--h);min-height:8%;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--bf-red-soft),var(--bf-red-dark))}
.cb.down::before{background:linear-gradient(180deg,#4a3033,#232326)}.cb.flat::before{background:linear-gradient(180deg,#55474a,#232326)}
.cb i{font-style:normal;font-weight:900;color:var(--bf-muted);font-size:.86em}.cb.up i{color:var(--bf-white)}.cb.down i{color:var(--bf-red-soft)}
.phone-unit{position:relative;width:210px;flex:0 0 auto}
.device-label{position:absolute;z-index:7;inset-block-start:-11px;inset-inline-start:50%;transform:translateX(-50%);white-space:nowrap;padding:5px 9px;border-radius:3px;background:var(--bf-ink);color:var(--bf-white);font-size:10px;font-weight:800;box-shadow:0 8px 22px rgba(0,0,0,.5)}
.on-paper .device-label{background:var(--bf-ink);color:var(--bf-paper)}
.phone-shell{position:relative;aspect-ratio:9/19;padding:2.9%;border-radius:14%;background:linear-gradient(152deg,#2c2c30,#0d0d0e 60%);box-shadow:0 30px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05) inset,0 1.4px 0 rgba(255,255,255,.12) inset}
.phone-island{position:absolute;z-index:4;inset-block-start:5.5%;inset-inline-start:50%;transform:translateX(-50%);width:30%;height:3.4%;border-radius:99px;background:#040404}
.phone-btn{position:absolute;width:2px;border-radius:2px;background:#3d3d42}.phone-btn.vol{height:9%;inset-block-start:23%;inset-inline-start:-2px}.phone-btn.pow{height:6%;inset-block-start:25%;inset-inline-end:-2px}
.phone-screen{position:relative;height:100%;overflow:hidden;border-radius:11%;background:radial-gradient(120% 58% at 88% 3%,rgba(179,32,45,.18),transparent 44%),#0a0a0b;display:flex;flex-direction:column;container-type:inline-size;font-size:5.2cqw;line-height:1.4}
.app-top{display:flex;align-items:center;justify-content:space-between;padding:11cqw 8cqw 4cqw;color:var(--bf-gray)}
.app-brand{display:flex;align-items:center;gap:1.4cqw}.app-mark{width:2.6cqw;height:2.6cqw;border:.7cqw solid var(--bf-red)}
.app-brand b{font:900 3.1cqw/1 'Arial Black',sans-serif;color:var(--bf-white);letter-spacing:.02em}
.app-chip{font-size:2.7cqw;font-weight:800;color:var(--bf-red-soft);padding:.7cqw 2.4cqw;border:1px solid rgba(210,72,80,.35);border-radius:99px}.app-chip.ghost{color:var(--bf-gray);border-color:var(--line)}
.app-body{flex:1;display:flex;padding:2cqw 8cqw 9cqw}
.home-ind{position:absolute;z-index:5;inset-block-end:3%;inset-inline-start:50%;transform:translateX(-50%);width:26%;height:1.4%;border-radius:99px;background:rgba(250,250,247,.5)}
.scr{flex:1;display:flex;flex-direction:column;font-size:3.5cqw}
.scr-eyebrow{font-size:.85em;font-weight:900;color:var(--bf-red-soft);letter-spacing:.02em}.scr-eyebrow.warn{color:var(--bf-red-soft)}
.scr-lead{margin:.5em 0;font-size:1.55em;font-weight:800;line-height:1.22;color:var(--bf-white)}.scr-note{font-size:.82em;color:var(--bf-gray)}
.scr-secret{justify-content:center;gap:.2em}.scr-secret .scr-lead{margin:.5em 0}
.scr-seal{margin-block-start:1em;display:flex;align-items:center;gap:.5em;padding-block-start:.9em;border-block-start:1px solid var(--line);color:var(--bf-muted);font-size:.82em}
.seal-mark{width:.7em;height:.7em;background:var(--bf-red);transform:rotate(45deg);flex:0 0 auto}
.scr-pick .scr-eyebrow{margin-block-end:.8em}
.pick-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:.5em}
.pa{display:flex;flex-direction:column;align-items:center;gap:.34em;padding:.7em .2em;border:1.5px solid var(--line);border-radius:.6em;color:var(--bf-gray);font-size:.82em;font-weight:800}
.pa svg{width:1.5em;height:1.5em}.pa b{color:var(--bf-muted)}
.pa.up{--c:var(--bf-muted)}.pa.dn{--c:var(--bf-red-soft)}.pa.gd{--c:var(--bf-red-soft)}
.pa.on{border-color:var(--c);color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}.pa.on b{color:var(--bf-white)}
.pick-label{margin:.9em 0 .5em;font-size:.82em;color:var(--bf-gray);font-weight:800}
.pick-chips{display:flex;flex-direction:column;gap:.45em}
.pchip{display:flex;align-items:center;gap:.5em;padding:.5em .6em;border:1.5px solid var(--line);border-radius:.55em;font-weight:800;color:var(--bf-muted)}
.pchip.on{border-color:var(--bf-red);background:rgba(179,32,45,.12);color:var(--bf-white)}
.p-av.sm{width:2em;height:2em;border-radius:.45em;font-size:.9em}
.scr-confirm{margin-block-start:auto;margin-block-end:1em;padding:.85em;text-align:center;border-radius:.6em;background:var(--bf-red);color:#fff;font-weight:900}
.scr-wait{align-items:center;justify-content:center;text-align:center;gap:1em}
.wait-seal{width:3.4em;height:3.4em;border-radius:1em;display:grid;place-items:center;color:var(--bf-red-soft);border:1px solid rgba(210,72,80,.4);background:rgba(179,32,45,.08)}
.wait-seal svg{width:1.7em;height:1.7em}.scr-wait .scr-lead{margin:0}
.wait-dots{display:flex;gap:.5em}.wait-dots i{width:.62em;height:.62em;border-radius:50%;border:1px solid var(--bf-gray)}.wait-dots i.on{background:var(--bf-red-soft);border-color:var(--bf-red-soft)}
.scr-result{align-items:center;justify-content:center;text-align:center;gap:.4em}
.result-arrow{font-size:3.4em;line-height:1;color:var(--bf-red-soft);transform:rotate(-8deg)}
.result-delta{font:900 3.2em/1 ui-monospace,monospace;color:var(--bf-red-soft)}.scr-result .scr-lead{margin:.1em 0;font-size:1.42em}
.scr-join{gap:.7em}.scr-title{font-size:1.85em;font-weight:900;color:var(--bf-white)}
.join-field{padding:.85em .8em;border:1px solid var(--line-2);border-radius:.55em;color:var(--bf-white)}
.join-field.mono{font-family:ui-monospace,monospace;letter-spacing:.14em;font-weight:900;text-align:center}.join-field.ghost{color:var(--bf-gray)}
.scr-join .scr-confirm{margin-block-start:.2em;margin-block-end:0}

/* ---------------- error / misc ---------------- */
.network-notice{position:fixed;z-index:200;inset-block-end:16px;inset-inline-start:50%;transform:translateX(-50%);padding:11px 16px;background:var(--bf-white);color:var(--bf-black);box-shadow:var(--shadow);font-weight:800;font-size:12px;border-radius:4px}
.cinema-page{min-height:100svh;display:grid;place-items:center;padding:130px var(--pad)}
.door-card{width:min(560px,100%);padding:44px;background:var(--bf-charcoal);border:1px solid var(--line);border-radius:8px;text-align:center}
.door-card h1{font-size:44px;margin:.2em 0}
.panel{background:var(--surface);border-color:var(--line-2)!important}.muted{color:var(--bf-gray)!important}

/* ---------------- responsive ---------------- */
@media(max-width:1080px){
  .head-nav{display:none}.head-menu{display:grid}
  .poster-inner,.poster-incomplete .poster-inner,.poster-private .poster-inner,.poster-consequence .poster-inner{grid-template-columns:1fr;gap:34px}
  .social-inner{grid-template-columns:1fr;gap:28px}.social-copy{max-width:100%}.social-lines{height:clamp(240px,40vh,340px)}
  .poster-incomplete .poster-art,.poster-private .poster-art,.poster-consequence .poster-art{order:0}
  .poster .poster-art{max-width:560px}
  .product-stage{grid-template-columns:1fr;gap:34px}
  .door{grid-template-columns:1fr}
  .door-aside{min-height:auto;padding:60px var(--pad)}
}
@media(max-width:760px){
  .site-head{height:60px}.site-head.scrolled{height:56px}.mobile-panel{inset-block-start:58px}
  .hero-noir{display:flex;flex-direction:column;min-height:auto}
  .hero-inner{padding-block-start:clamp(104px,15vh,150px);padding-block-end:8px}
  .hero-art{position:relative;left:auto;bottom:auto;width:100%;margin-block-start:22px}
  .hero-copy{max-width:100%}
  .scroll-cue{display:none}
  .poster{min-height:auto;padding-block:clamp(70px,11vh,110px)}
  .poster .poster-art{max-width:440px;margin-inline:auto}
  .product-steps{grid-template-columns:1fr}
  .stage-phones{max-width:420px}
  .how-step{grid-template-columns:1fr;gap:16px}
  .how-step .step-art{display:none}
  .foot-links{gap:30px}
  .door{display:flex;flex-direction:column}
  .door-form{order:1;padding:96px var(--pad) 40px}
  .door-aside{order:2}
}
@media(max-width:430px){
  .hero-noir h1{font-size:clamp(2.6rem,12vw,3.4rem)}
  .hero-cta{display:grid;grid-template-columns:1fr}
  .foot-inner{flex-direction:column}
  .foot-cap{flex-direction:column;gap:6px}
}

/* ---------------- reduced motion & a11y ---------------- */
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  [data-reveal]{transition:none;opacity:1;transform:none}
  .rl-draw{transition:none;stroke-dashoffset:0}
  .rl-head,.cs-head,.cs-return,.fs-head,.rl-src,.cs-src,.cs-impact,.pv-secret{transition:none;opacity:1}
  .spinner{animation:none}
}
.dass-reduced-motion *{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}
.dass-high-contrast{--bf-muted:#d0d0d2;--bf-gray:#b8b8ba;--line:rgba(250,250,247,.3);--line-2:rgba(250,250,247,.5)}
.dass-large-text{font-size:112%}
`;
