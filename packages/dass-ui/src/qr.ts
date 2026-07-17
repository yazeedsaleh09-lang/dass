import qrcode from 'qrcode-generator';

/** Render a scannable QR for `text` as a self-contained SVG string (crisp, no external asset). */
export function qrSvg(text: string, fg = '#0b0a0f', bg = '#f4eee3', margin = 2): string {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const size = n + margin * 2;
  let path = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${bg}"/><path d="${path}" fill="${fg}"/></svg>`;
}
