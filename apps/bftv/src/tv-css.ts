/** TV scene styling. Composition, not decoration: the frame tightens as the world destabilizes. */
export function tvCss(): string {
  return String.raw`
  html,body{height:100%;overflow:hidden}
  #app{height:100%}
  .tv-stage{height:100dvh;display:flex;flex-direction:column;padding:clamp(14px,2vh,28px) clamp(18px,2.4vw,44px)}
  .tv-mute{position:fixed;inset-block-start:calc(var(--safe-t) + 14px);inset-inline-start:calc(var(--safe-l) + 14px);z-index:80;font-size:18px}
  .tv-err{flex:1;display:grid;place-items:center;font-size:var(--fs-h2);font-weight:800}

  .cue-caption{position:fixed;inset-block-end:calc(var(--safe-b) + 14px);inset-inline:0;text-align:center;z-index:90;
    font-size:15px;font-weight:800;letter-spacing:.06em;color:var(--muted);opacity:0;transition:opacity var(--t-micro)}
  .cue-caption.show{opacity:1}

  /* ---------------- opening ---------------- */
  .opening{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
  .op-word{font-size:clamp(48px,10vw,150px)}
  .op-rule{width:min(60vw,620px);height:2px;background:var(--red);transform-origin:center}
  .op-tag{font-size:var(--fs-h3);color:var(--muted)}

  /* ---------------- lobby ---------------- */
  .lobby{flex:1;display:grid;grid-template-rows:auto auto 1fr auto;gap:clamp(16px,2.6vh,34px);
    max-width:1500px;width:100%;margin-inline:auto}
  .lb-head{display:flex;align-items:baseline;gap:18px;border-block-end:1px solid var(--line);padding-block-end:14px}
  .lb-brand{font-size:clamp(26px,3vw,44px)}
  .lb-scenario{font-size:var(--fs-h3);color:var(--muted)}
  .lb-body{display:grid;grid-template-columns:auto 1fr;gap:clamp(28px,5vw,80px);align-items:center}
  .qr-frame{width:clamp(180px,19vw,270px);height:clamp(180px,19vw,270px);background:var(--paper);padding:12px}
  .qr-cap{margin-block-start:10px;text-align:center;font-size:14px;font-weight:800;color:var(--muted)}
  .lb-join{display:flex;flex-direction:column;gap:12px}
  .lb-code{font:900 clamp(44px,7vw,104px)/1 var(--font-latin);letter-spacing:.08em;direction:ltr;color:var(--white)}
  .lb-url{font-size:clamp(14px,1.4vw,19px);color:var(--muted);direction:ltr}
  .lb-seats{display:flex;flex-direction:column;gap:14px;min-height:0}
  .seat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
  .seat-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 12px;
    background:var(--charcoal);border:1px solid var(--line);border-radius:var(--r-2)}
  .seat-card.is-ready{border-color:var(--red)}
  .seat-card.is-off{opacity:.4}
  .seat-card.ghost{border-style:dashed;background:transparent}
  .seat-card.ghost .seat,.seat-card.ghost .seat-name{color:var(--lead);border-color:var(--line)}
  .seat-name{font-size:clamp(16px,1.5vw,22px);font-weight:800;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .seat-state{font-size:13px;font-weight:800;letter-spacing:.08em;color:var(--muted)}
  .seat-card.is-ready .seat-state{color:var(--red-soft)}
  .lb-foot{display:flex;align-items:center;justify-content:space-between;gap:20px;border-block-start:1px solid var(--line);padding-block-start:16px}
  .lb-hint{font-size:var(--fs-h3);color:var(--muted)}

  /* ---------------- world ---------------- */
  .world{flex:1;display:grid;grid-template-rows:auto auto 1fr auto;gap:clamp(8px,1.4vh,20px);
    border:1px solid var(--line);border-radius:var(--r-3);padding:clamp(14px,2vh,26px) clamp(16px,2.2vw,38px);
    position:relative;transition:border-color var(--t-scene) var(--e-out)}
  .world.frozen{filter:saturate(.5)}
  .hud{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px}
  .hud-left{display:flex;align-items:baseline;gap:14px}
  .hud-brand{font-size:clamp(16px,1.5vw,22px);color:var(--muted)}
  .hud-round{color:var(--muted)}
  .hud-right{display:flex;align-items:center;justify-content:flex-end;gap:18px}
  .threat-state{font-size:14px;font-weight:800;color:var(--muted);letter-spacing:.06em}
  .echo-chip{display:inline-flex;align-items:center;gap:9px;font-size:15px;font-weight:800;color:var(--muted)}
  .echo-chip:empty{display:none}
  .echo-dot{width:9px;height:9px;background:var(--red);border-radius:50%}
  .echo-chip.critical{color:var(--red-soft)}
  .echo-state{padding:3px 8px;border:1px solid var(--line-2);border-radius:2px;font-size:12px}
  .timer{font-size:clamp(28px,3.2vw,54px);font-weight:900;color:var(--muted);min-width:1.6ch;text-align:center}
  .timer.urgent{color:var(--red)}

  .scene-title{min-height:clamp(72px,11vh,132px);display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:8px;text-align:center;opacity:0;transition:opacity var(--t-comp) var(--e-out)}
  .scene-title.show{opacity:1}
  .st-main{font-size:var(--fs-h1);font-weight:900;line-height:1.08;letter-spacing:-.02em;text-wrap:balance;max-width:20ch}
  .st-sub{font-size:var(--fs-h3);color:var(--muted);text-wrap:balance}
  .scene-title.alarm .st-main{color:var(--red-soft)}

  .relay-wrap{min-height:0;display:grid;place-items:center}
  .relay-svg{width:100%;height:100%;max-height:52vh;overflow:visible}

  .relay-line{stroke:var(--lead);stroke-width:1.5;fill:none}
  .relay-line.running{stroke:var(--steel);stroke-dasharray:14 10;animation:relayFlow 2.4s linear infinite}
  .relay-line.broken{stroke:var(--red-dark);stroke-dasharray:5 16}
  @keyframes relayFlow{to{stroke-dashoffset:-48}}
  .fracture{stroke:var(--red);stroke-width:2.6;fill:none;opacity:0;transition:opacity var(--t-micro) var(--e-sharp)}
  .fracture.show{opacity:1}

  .rnode{opacity:0;transition:opacity var(--t-comp) var(--e-out)}
  .rnode.visible,.world .rnode{opacity:1}
  .relay-svg.intro-mode .rnode{opacity:0}
  .relay-svg.intro-mode .rnode.visible{opacity:1}
  .rn-box{fill:var(--charcoal);stroke:var(--line-2);stroke-width:1}
  .rn-glyph{fill:var(--white);font-size:22px;font-weight:900}
  .rn-name{fill:var(--white);font-size:20px;font-weight:800;font-family:var(--font)}
  .rn-tag{fill:var(--muted);font-size:14px;font-weight:800;font-family:var(--font)}
  .rn-echo{fill:none;stroke:var(--red);stroke-width:1.5;opacity:0;transition:opacity var(--t-comp) var(--e-out)}
  .rn-shield{fill:none;stroke:var(--paper);stroke-width:1.5;stroke-dasharray:6 6;opacity:0;transition:opacity var(--t-micro)}
  .rnode.is-echo .rn-echo{opacity:1}
  .rnode.shielded .rn-shield{opacity:1}
  .rnode.is-candidate .rn-box{stroke:var(--white);stroke-width:2}
  .rnode.is-carrier .rn-box{fill:var(--graphite);stroke:var(--white)}
  .rnode.spotlight .rn-box{fill:var(--paper)} .rnode.spotlight .rn-glyph{fill:var(--black)}
  .rnode.dimmed{opacity:.22}
  .rnode.is-off{opacity:.35}
  .rnode.final-hit .rn-box{fill:var(--red);stroke:var(--red)}
  .rnode.final-hit .rn-glyph{fill:var(--white)}
  .rnode.is-redirector .rn-tag,.rnode.is-guardian .rn-tag{fill:var(--red-soft)}

  .support-arc{stroke:var(--steel);stroke-width:2;fill:none;stroke-linecap:round}
  .support-arc.cut{stroke:var(--red-dark);stroke-dasharray:4 8}
  .support-arc.moved{stroke:var(--paper)}
  .return-path{stroke:var(--red);stroke-width:3;fill:none;stroke-linecap:round}
  .return-path.rejected{stroke:var(--red-soft);filter:drop-shadow(0 0 10px rgba(183,46,56,.5))}
  .relay-svg.echo-live .relay-line{stroke:var(--red-dark)}

  .stage-foot{display:flex;flex-direction:column;align-items:center;gap:10px;min-height:60px}
  .lock-strip{display:none;align-items:center;gap:14px}
  .lock-strip.show{display:flex}
  .lock-count{font-size:clamp(22px,2.4vw,36px);font-weight:900}
  .lock-word{font-size:15px;font-weight:800;color:var(--muted);letter-spacing:.06em}
  .lock-pips{display:flex;gap:6px}
  .pip{width:22px;height:4px;background:var(--graphite);transition:background var(--t-micro) var(--e-out)}
  .pip.on{background:var(--paper)}
  .prompt-line{font-size:var(--fs-h3);color:var(--muted);text-align:center;min-height:1.4em}

  .progress{position:absolute;inset-block-start:0;inset-inline:0;height:2px;background:var(--red);
    transform:scaleX(var(--p,0));transform-origin:right;transition:transform .25s linear;opacity:.7}

  /* ---------------- final reveal ---------------- */
  .final{flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:24px;border:1px solid var(--line);
    border-radius:var(--r-3);padding:clamp(18px,3vh,40px) clamp(20px,3vw,56px)}
  .fn-head{display:flex;align-items:baseline;gap:18px;border-block-end:1px solid var(--line);padding-block-end:14px}
  .fn-head .bf-word{font-size:clamp(18px,1.6vw,24px);color:var(--muted)}
  .fn-title{font-size:var(--fs-h3);color:var(--muted)}
  .fn-card{display:grid;place-items:center}
  .rc{max-width:26ch;text-align:center;display:flex;flex-direction:column;gap:18px}
  .rc-index{font-size:14px;color:var(--muted);letter-spacing:.14em}
  .rc-title{margin:0;font-size:var(--fs-h1);font-weight:900;letter-spacing:-.02em}
  .rc-line{margin:0;font-size:var(--fs-h2);line-height:1.35;color:var(--white);text-wrap:balance;max-width:24ch}
  .rc.tone-interference .rc-title{color:var(--muted)}
  .rc.tone-backfire .rc-title{color:var(--red-soft)}
  .rc.tone-backfire .rc-line{color:var(--white)}
  .rc.summary{max-width:30ch;gap:22px}
  .rc-summary{margin:0;font-size:var(--fs-h1);font-weight:900;line-height:1.18;text-wrap:balance}
  .rc-origin{margin:0;font-size:var(--fs-h3);color:var(--muted);text-wrap:balance}
  .rc-collapse{margin:0;font-size:var(--fs-h3);color:var(--red-soft);font-weight:800}
  .fn-dots{display:flex;justify-content:center;gap:8px}
  .fn-dot{width:34px;height:3px;background:var(--graphite)}
  .fn-dot.on{background:var(--red)}

  /* ---------------- results ---------------- */
  .results{flex:1;display:grid;grid-template-rows:auto 1fr auto auto;gap:clamp(14px,2.4vh,30px);
    border:1px solid var(--line);border-radius:var(--r-3);padding:clamp(18px,3vh,40px) clamp(20px,3vw,56px)}
  .rs-head{display:flex;flex-direction:column;gap:10px}
  .rs-title{margin:0;font-size:var(--fs-display);font-weight:900;line-height:.95;letter-spacing:-.03em}
  .rs-note{margin:0;font-size:var(--fs-h3);color:var(--red-soft)}
  .rs-rows{display:flex;flex-direction:column;gap:10px;align-content:start}
  .rs-row{display:flex;align-items:center;gap:16px;padding:14px 18px;background:var(--charcoal);border:1px solid var(--line);border-radius:var(--r-2)}
  .rs-row.is-winner{border-color:var(--red)}
  .rs-rank{width:2ch;color:var(--muted);font-weight:900}
  .rs-name{flex:1;font-size:var(--fs-h3);font-weight:800}
  .rs-objs{display:flex;gap:6px}
  .obj{width:16px;height:16px;border:1px solid var(--line-2)}
  .obj.won{background:var(--red);border-color:var(--red)}
  .rs-inf{font-size:var(--fs-h3);font-weight:900}
  .rs-summary{font-size:var(--fs-h3);color:var(--muted);text-wrap:balance;max-width:60ch}
  .rs-foot{font-size:15px}

  @media (max-width:900px){
    .lb-body{grid-template-columns:1fr}
    .seat-grid{grid-template-columns:repeat(2,1fr)}
  }
  `;
}
