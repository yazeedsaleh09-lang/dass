// Styles for the BACKFIRE Modes ("worlds") experience. Uses the existing site tokens
// (--surface, --line, --bf-*) and the per-mode --accent set inline on each element.
export function modesCss(): string {
  return `
  .modes-page .product-hero h1{line-height:.98}
  .mode-cover-art{display:block;width:100%;height:100%;object-fit:cover}

  /* local-only note (neutral, distinct from the amber demo banner) */
  .modes-note{display:flex;align-items:flex-start;gap:12px;margin:0 0 30px;padding:14px 16px;border:1px solid var(--line-2);border-radius:var(--r-2);background:var(--surface);color:var(--text-2)}
  .modes-note>div{display:grid;gap:3px}.modes-note b{color:var(--text)}.modes-note span:last-child{font-size:14px}
  .modes-note .demo-dot{background:var(--bf-red);box-shadow:0 0 14px var(--bf-red)}

  /* shared mode chrome */
  .mode-flags{display:flex;align-items:center;gap:10px}
  .mode-flag{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:900;letter-spacing:.04em;padding:5px 11px;border-radius:var(--r-pill);border:1px solid var(--line-2)}
  .mode-flag::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}
  .mode-flag.playable{color:var(--bf-red-soft);border-color:color-mix(in srgb,var(--bf-red-soft) 45%,transparent);background:color-mix(in srgb,var(--bf-red) 10%,transparent)}
  .mode-flag.playable::before{box-shadow:0 0 8px currentColor}
  .mode-flag.coming-soon{color:var(--bf-muted)}
  .mode-flag.waitlist{color:var(--bf-white)}
  .mode-code{font:900 11px/1 'Arial',sans-serif;letter-spacing:.16em;color:var(--bf-gray)}
  .mode-premise{color:var(--text);font-weight:700;line-height:1.5;margin:0}
  .mode-meta{display:flex;flex-wrap:wrap;gap:8px 18px;list-style:none;margin:0;padding:0}
  .mode-meta li{display:inline-flex;align-items:center;gap:7px;color:var(--text-2);font-size:14px;font-weight:700}
  .mode-meta svg{width:17px;height:17px;color:color-mix(in srgb,var(--accent) 78%,var(--bf-muted));flex:0 0 auto}
  .mode-hook{display:grid;gap:4px;margin:0;padding:14px 16px;border-inline-start:2px solid var(--accent);background:color-mix(in srgb,var(--accent) 8%,transparent);border-radius:0 var(--r-2) var(--r-2) 0;color:var(--text);font-weight:700;line-height:1.5}
  .mode-hook span{font-size:11px;font-weight:900;letter-spacing:.12em;color:color-mix(in srgb,var(--accent) 82%,var(--bf-white));text-transform:uppercase}
  .mode-actions{display:flex;gap:10px;flex-wrap:wrap}
  .btn.on{background:color-mix(in srgb,var(--bf-red) 22%,var(--surface));border-color:var(--line-2);color:var(--bf-white)}

  /* featured mode — the playable one, cinematic and wide */
  .mode-featured{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:clamp(20px,3vw,44px);align-items:stretch;margin:0 0 clamp(40px,6vw,68px);padding:clamp(18px,2.2vw,26px);border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(140deg,color-mix(in srgb,var(--accent) 12%,var(--surface-2)),var(--surface));position:relative;overflow:hidden}
  .mode-featured::before{content:'';position:absolute;inset:0;background:radial-gradient(80% 90% at 12% 0,color-mix(in srgb,var(--accent) 16%,transparent),transparent 60%);pointer-events:none}
  .mode-featured-art{position:relative;z-index:1;display:block;border-radius:var(--r-2);overflow:hidden;aspect-ratio:5/6;box-shadow:0 30px 80px rgba(0,0,0,.5);transition:transform var(--t-comp) var(--e-out)}
  .mode-featured-art:hover{transform:translateY(-4px)}
  .mode-featured-copy{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:16px;padding:6px 4px}
  .mode-featured-copy h2{font-size:clamp(34px,4.6vw,60px);line-height:1;letter-spacing:-.03em;margin:2px 0}
  .mode-featured-copy .mode-premise{font-size:clamp(17px,1.5vw,21px)}

  /* three labelled sections: متاح الآن / الأصلية / مستوحى من الأنمي */
  .modes-section{margin:0 0 clamp(46px,7vw,80px)}
  .modes-section-head{margin:0 0 22px;padding-bottom:16px;border-bottom:1px solid var(--line)}
  .modes-section-head h2{font-size:var(--fs-h2);margin:10px 0 6px;letter-spacing:-.02em}
  .modes-section-head p{color:var(--muted);font-size:15px;line-height:1.6;margin:0;max-width:60ch}
  .modes-section-tag{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:900;letter-spacing:.04em;padding:5px 12px;border-radius:var(--r-pill);border:1px solid var(--line-2);color:var(--bf-muted)}
  .modes-section-tag::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}
  .modes-section-tag.live{color:var(--bf-red-soft);border-color:color-mix(in srgb,var(--bf-red-soft) 45%,transparent);background:color-mix(in srgb,var(--bf-red) 10%,transparent)}
  .modes-section-tag.live::before{box-shadow:0 0 8px currentColor}
  .modes-section-tag.anime{color:#cbb9e6;border-color:color-mix(in srgb,#8a6fb8 45%,transparent);background:color-mix(in srgb,#8a6fb8 12%,transparent)}
  .modes-section-live .mode-featured{margin-bottom:0}
  /* anime concept cards read as previews: dimmed cover, pressure line, disabled action */
  .mode-card.anime .mode-hook-sm{margin:0;font-size:13px;padding:11px 13px}
  .mode-card.anime .mode-hook-sm span{font-size:10px}
  .mode-card.anime .btn[disabled]{margin-top:12px;width:100%;opacity:.68;cursor:not-allowed}
  .mode-card.anime .mode-card-art::after{background:linear-gradient(180deg,rgba(8,8,8,.28) 0,transparent 34%,color-mix(in srgb,var(--accent) 16%,transparent) 76%,rgba(8,8,8,.82))}

  /* portal grid */
  .modes-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
  .mode-card{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line-2);border-radius:var(--r-3);background:linear-gradient(180deg,var(--surface-2),var(--surface));transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp),box-shadow var(--t-comp)}
  .mode-card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line-2));box-shadow:0 30px 70px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent)}
  .mode-card-art{position:relative;display:block;aspect-ratio:5/6;overflow:hidden;border-bottom:1px solid var(--line)}
  .mode-card-art::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,color-mix(in srgb,var(--accent) 14%,transparent) 78%,rgba(8,8,8,.72));pointer-events:none}
  .mode-card-art .mode-cover-art{transition:transform var(--t-comp) var(--e-out)}
  .mode-card:hover .mode-card-art .mode-cover-art{transform:scale(1.045)}
  .mode-enter{position:absolute;z-index:2;inset-block-end:12px;inset-inline-start:14px;padding:7px 13px;border-radius:var(--r-pill);background:color-mix(in srgb,var(--accent) 88%,#000);color:var(--bf-white);font-size:12px;font-weight:900;opacity:0;transform:translateY(6px);transition:opacity var(--t-fast),transform var(--t-fast)}
  .mode-card:hover .mode-enter,.mode-card-art:focus-visible .mode-enter{opacity:1;transform:none}
  .mode-card-body{display:flex;flex-direction:column;gap:12px;padding:18px 18px 20px}
  .mode-card-body h3{margin:0;font-size:21px;letter-spacing:-.01em}
  .mode-card-body h3 a{color:inherit}
  .mode-card-body .mode-premise{font-size:15px;color:var(--text-2);font-weight:700;min-height:2.8em}
  .mode-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:14px;border-top:1px solid var(--line)}
  .mode-price{display:grid;gap:1px}.mode-price b{font-size:17px;color:var(--text)}.mode-price span{font-size:11px;color:var(--muted);font-weight:700}

  .modes-store-link{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:clamp(44px,6vw,72px) 0 0;padding:clamp(24px,3vw,36px);border:1px solid var(--line);border-radius:var(--r-3);background:var(--bg-1)}
  .modes-store-link h2{margin:8px 0 6px;font-size:clamp(22px,2.6vw,30px);letter-spacing:-.02em}
  .modes-store-link p{margin:0;color:var(--text-2);max-width:52ch;line-height:1.6}

  /* mode detail */
  .mode-back{display:inline-block;margin:0 0 14px;padding:4px 2px;color:var(--muted);font-weight:800}
  .mode-back:hover{color:var(--text)}
  .mode-detail{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:clamp(22px,4vw,52px);align-items:start}
  .mode-detail-art{position:relative;padding:0;overflow:hidden;aspect-ratio:5/6;border-radius:var(--r-3)}
  .mode-detail-art .mode-cover-art{width:100%;height:100%}
  .mode-detail-art-cap{position:absolute;inset-block-end:14px;inset-inline:14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mode-detail-copy{display:flex;flex-direction:column;gap:16px;padding-top:6px}
  .mode-detail-copy h1{font-size:clamp(40px,6vw,74px);line-height:.98;letter-spacing:-.03em;margin:0}
  .mode-detail-premise{font-size:clamp(18px,1.7vw,23px);font-weight:800;color:var(--text);line-height:1.4;margin:0}
  .mode-brief{color:var(--text-2);line-height:1.8;margin:0;font-size:16px}
  .mode-detail-meta{display:grid;grid-template-columns:repeat(4,1fr);margin:6px 0;border-block:1px solid var(--line)}
  .mode-detail-meta>div{display:grid;gap:5px;padding:16px 4px;border-inline-end:1px solid var(--line)}
  .mode-detail-meta>div:last-child{border-inline-end:0}
  .mode-detail-meta dt{color:var(--muted);font-size:12px;font-weight:800;letter-spacing:.04em}
  .mode-detail-meta dd{margin:0;font-weight:900;font-size:16px}
  .mode-detail-price{display:flex;align-items:baseline;gap:10px}
  .mode-detail-price b{font-size:26px}.mode-detail-price span{color:var(--muted);font-size:13px;font-weight:700}
  .mode-waitlist-note{margin:0;color:var(--text-2);font-size:13px;line-height:1.6}

  .mode-round{margin:clamp(50px,7vw,86px) 0 0;padding-top:clamp(30px,4vw,44px);border-top:1px solid var(--line)}
  .mode-round-head{margin-bottom:26px}
  .mode-round-head h2{font-size:var(--fs-h2);margin:12px 0 0;letter-spacing:-.02em}
  .mode-beats{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
  .mode-beats li{list-style:none;display:flex;gap:14px;align-items:flex-start;padding:26px 22px;background:var(--bg);min-height:120px}
  .mode-beats .beat-mark{flex:0 0 auto;width:9px;height:9px;margin-top:8px;background:var(--accent);transform:rotate(45deg)}
  .mode-beats span{font-size:17px;font-weight:700;color:var(--text);line-height:1.5}

  @media(max-width:900px){
    .mode-featured{grid-template-columns:1fr}
    .mode-featured-art{aspect-ratio:16/12;max-height:420px}
    .modes-grid{grid-template-columns:repeat(2,1fr)}
    .mode-detail{grid-template-columns:1fr}
    .mode-detail-art{max-width:440px;margin-inline:auto}
    .mode-beats{grid-template-columns:1fr}
    .mode-beats li{min-height:0}
  }
  @media(max-width:640px){
    .modes-grid{grid-template-columns:1fr}
    .mode-card-art{aspect-ratio:16/11}
    .mode-detail-meta{grid-template-columns:repeat(2,1fr)}
    .mode-detail-meta>div:nth-child(2n){border-inline-end:0}
    .mode-detail-meta>div:nth-child(-n+2){border-bottom:1px solid var(--line)}
    .modes-store-link{flex-direction:column;align-items:flex-start}
    .mode-featured-copy .mode-premise{min-height:0}
  }
  @media(prefers-reduced-motion:reduce){
    .mode-card,.mode-featured-art,.mode-card-art .mode-cover-art,.mode-enter{transition:none}
  }

  /* ---- home page featured-modes band (dark) ---- */
  .home-modes{position:relative;padding:clamp(80px,12vh,140px) var(--pad);background:radial-gradient(84% 80% at 78% 8%,#141013,var(--bf-black) 62%)}
  .home-modes-head{max-width:var(--maxw);margin:0 auto clamp(34px,5vw,54px)}
  .home-modes-head h2{font-size:clamp(2.1rem,4vw,4rem);line-height:1;letter-spacing:-.025em;margin:14px 0 16px;text-wrap:balance}
  .home-modes-head p{color:var(--bf-muted);font-size:clamp(16px,1.3vw,19px);line-height:1.7;max-width:52ch;margin:0}
  .home-modes-rail{max-width:var(--maxw);margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .home-mode{position:relative;display:block;border-radius:var(--r-3);overflow:hidden;border:1px solid var(--line);background:var(--bf-charcoal);transition:transform var(--t-comp) var(--e-out),border-color var(--t-comp)}
  .home-mode:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--accent) 55%,var(--line))}
  .home-mode-art{display:block;aspect-ratio:5/6;overflow:hidden}
  .home-mode-art .mode-cover-art{width:100%;height:100%;transition:transform var(--t-comp) var(--e-out)}
  .home-mode:hover .mode-cover-art{transform:scale(1.05)}
  .home-mode-cap{position:absolute;inset-block-end:0;inset-inline:0;display:grid;gap:3px;padding:16px 16px 14px;background:linear-gradient(transparent,rgba(8,8,8,.5) 34%,rgba(8,8,8,.92));text-align:start}
  .home-mode-cap .mode-flag{margin-bottom:6px;width:max-content;font-size:11px;padding:4px 9px}
  .home-mode-cap b{font-size:19px;color:var(--bf-white);letter-spacing:-.01em}
  .home-mode-cap small{font:900 10px/1 'Arial',sans-serif;letter-spacing:.16em;color:var(--bf-gray)}
  .home-modes-cta{max-width:var(--maxw);margin:clamp(30px,4vw,44px) auto 0;display:flex}
  @media(max-width:900px){.home-modes-rail{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.home-modes-rail{grid-template-columns:1fr 1fr;gap:12px}.home-mode-cap b{font-size:16px}.home-modes-cta .btn{width:100%}}
  `;
}
