/**
 * Phone styling. One screen, one job (§27). Everything is reachable with a thumb: 360px is the
 * design width, touch targets never drop below 56px, and nothing scrolls sideways (§32).
 */
export function playerCss(): string {
  return String.raw`
  html,body{min-height:100%;overflow-x:hidden}
  #app{min-height:100dvh}
  #root{min-height:100dvh;display:flex;flex-direction:column;
    padding:calc(var(--safe-t) + 12px) 16px calc(var(--safe-b) + 18px);max-width:560px;margin-inline:auto}

  .p-top{display:flex;align-items:center;gap:12px;justify-content:space-between;padding-block-end:12px;border-block-end:1px solid var(--line)}
  .p-brand{font-size:17px;color:var(--muted)}
  .icon-btn.sm{width:38px;height:38px;font-size:15px}
  .p-world{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.02em}
  .pw-item b{color:var(--white);font-weight:900}
  .pw-item i{font-style:normal;color:var(--red-soft)}
  .p-body{flex:1;display:flex;flex-direction:column;padding-block-start:18px}
  #banner{position:fixed;inset-block-start:0;inset-inline:0;z-index:60}
  .p-banner{padding:9px;text-align:center;font-weight:800;font-size:14px;background:var(--charcoal);border-block-end:1px solid var(--line-2)}
  .p-banner.err{color:var(--red-soft)} .p-banner.warn{color:var(--muted)} .p-banner.ok{color:var(--white)}

  /* ---- join ---- */
  .join{justify-content:center}
  .join-card{display:flex;flex-direction:column;gap:14px}
  .join-title{margin:0;font-size:clamp(26px,7vw,34px);font-weight:900;line-height:1.15;letter-spacing:-.02em}
  .join-form{display:flex;flex-direction:column;gap:12px;margin-block-start:8px}
  .join-code{font:900 clamp(30px,9vw,42px)/1 var(--font-latin);letter-spacing:.14em;text-align:center;direction:ltr;
    padding:14px;background:var(--charcoal);border:1px solid var(--line-2);border-radius:var(--r-1)}
  #code{direction:ltr;text-align:center;letter-spacing:.12em}
  .join-err{min-height:20px;text-align:center;font-weight:800;color:var(--red-soft)}

  /* ---- lobby ---- */
  .lobby{flex:1;display:flex;flex-direction:column;gap:14px}
  .lob-list{list-style:none;margin:0;padding:0;flex:1;display:flex;flex-direction:column;gap:8px}
  .lob-row{display:flex;align-items:center;gap:12px;padding:13px 14px;background:var(--charcoal);border:1px solid var(--line);border-radius:var(--r-1)}
  .lob-row.is-ready{border-color:var(--red)}
  .lob-row.is-you{background:var(--graphite)}
  .lob-name{flex:1;font-weight:800}
  .lob-state{font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.06em}
  .lob-actions{display:flex;flex-direction:column;gap:10px}
  .lob-hint{margin:0;text-align:center;font-size:14px}

  /* ---- intel ---- */
  .intel{flex:1;display:flex;flex-direction:column;gap:10px}
  .intel-card{margin:0;font-size:clamp(20px,5.4vw,26px);font-weight:800;line-height:1.5;
    padding:20px;background:var(--charcoal);border:1px solid var(--line-2);border-inline-start:3px solid var(--red);border-radius:var(--r-1)}
  .obj-eyebrow{margin-block-start:8px}
  .obj-card{margin:0;font-size:clamp(18px,4.8vw,22px);font-weight:800;line-height:1.5;
    padding:18px;background:var(--ink);border:1px dashed var(--line-2);border-radius:var(--r-1)}
  .privacy{margin:6px 0 0;text-align:center;font-size:13px}
  .intel .btn{margin-block-start:auto}

  /* ---- discussion ---- */
  .discuss{flex:1;display:flex;flex-direction:column;gap:14px}
  .discuss-head{font-size:clamp(24px,6.4vw,32px);font-weight:900;text-align:center;letter-spacing:-.02em}
  .mini{padding:14px 16px;background:var(--charcoal);border:1px solid var(--line);border-radius:var(--r-1)}
  .mini-label{font-size:11px;font-weight:800;letter-spacing:.14em;color:var(--red-soft);margin-block-end:6px}
  .mini-text{margin:0;font-size:16px;font-weight:700;line-height:1.5;color:var(--white)}

  /* ---- decision ---- */
  .decide{flex:1;display:flex;flex-direction:column;gap:14px}
  .decide-head{display:flex;flex-direction:column;gap:8px}
  .decide-hint{margin:0;font-size:clamp(19px,5vw,24px);font-weight:900;line-height:1.3}
  .decide-note{margin:0;font-size:13px;line-height:1.5}
  .decide-chosen{margin:0;font-size:14px;font-weight:800;color:var(--red-soft)}
  .targets{display:flex;flex-direction:column;gap:10px}
  .target{display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:12px 14px;text-align:start;
    background:var(--charcoal);border:1px solid var(--line-2);border-radius:var(--r-1);
    transition:border-color var(--t-micro),background var(--t-micro),transform var(--t-instant)}
  .target.sel{border-color:var(--red);background:var(--graphite);box-shadow:inset 0 0 0 1px var(--red)}
  .target:active{transform:scale(.99)}
  .target-name{flex:1;font-size:18px;font-weight:800}
  .target-tag{font-size:11px;font-weight:800;letter-spacing:.1em;color:var(--red-soft);border:1px solid var(--line-2);padding:3px 7px;border-radius:2px}
  .decide-actions{display:flex;flex-direction:column;gap:10px;margin-block-start:auto}
  .decide .btn.primary{margin-block-start:auto}
  .decide-actions .btn.primary{margin-block-start:0}

  .sides{display:flex;flex-direction:column;gap:10px}
  .side-btn{display:flex;flex-direction:column;align-items:flex-start;gap:4px;width:100%;min-height:76px;padding:16px;
    background:var(--charcoal);border:1px solid var(--line-2);border-radius:var(--r-1);text-align:start}
  .side-btn.sel{border-color:var(--red);background:var(--graphite);box-shadow:inset 0 0 0 1px var(--red)}
  .side-label{font-size:21px;font-weight:900}
  .side-sub{font-size:13px;font-weight:700;color:var(--muted)}

  /* ---- waiting ---- */
  .wait{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
  .wait-mark{font-size:56px;line-height:1;color:var(--red-soft)}
  .wait-mark.locked{color:var(--white)}
  .wait-title{margin:0;font-size:clamp(24px,6.4vw,32px);font-weight:900;letter-spacing:-.02em}
  .wait-sub{margin:0;font-size:15px}
  .wait-count{font-size:22px;font-weight:900;color:var(--muted)}

  /* ---- results ---- */
  .results{flex:1;display:flex;flex-direction:column;gap:14px}
  .rs-me{margin:0;font-size:clamp(32px,9vw,44px);font-weight:900;letter-spacing:-.03em}
  .rs-line{margin:0;font-size:16px;line-height:1.6;color:var(--muted)}
  .rs-objs{display:flex;gap:8px;flex-wrap:wrap}
  .rs-obj{font-size:12px;font-weight:800;padding:7px 10px;border:1px solid var(--line-2);border-radius:2px;color:var(--muted)}
  .rs-obj.won{border-color:var(--red);color:var(--white);background:var(--graphite)}
  .rs-actions{display:flex;flex-direction:column;gap:10px;margin-block-start:auto}
  `;
}
