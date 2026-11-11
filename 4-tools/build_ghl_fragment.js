// One self-contained block to paste into a GoHighLevel "Custom JS/HTML" element (no iframe).
// Source: site/thanksgiving.html (run build_thanksgiving.js first). Output: argv[2] (default ghl-thanksgiving-2026.html).
// - No <html>/<head>/<body>/<base>: CSS and all JS are inlined in order, so it works however GHL inserts the code.
// - Images, videos and fonts load from the live site (absolute URLs).
// - Lead form posts to the live Worker /api/lead as a "simple" cross-site request (no CORS needed) -> GHL contact.
// - Buttons go to the live checkout. The spots counter shows "Only 10 available" (live count needs CORS on /api/spots).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const LIVE = 'https://blackfriday2026.detailersmovement.com/';
const out = process.argv[2] || path.join(root, 'ghl-thanksgiving-2026.html');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
let h = read('site/thanksgiving.html');

function rep(s, from, to, all) {
  const n = s.split(from).length - 1;
  if (!n) throw new Error('not found: ' + from.slice(0, 80));
  return all ? s.split(from).join(to) : s.replace(from, () => to);
}
const abs = s => s
  .replace(/(\b(?:src|href|poster|srcset)=")(assets\/|checkout\/|thank-you\/)/g, (_, a, p) => a + LIVE + p)
  .replace(/'assets\/'/g, "'" + LIVE + "assets/'");

// ---- head: keep fonts, the in-app-video script and the Thanksgiving styles ----
const head = h.slice(0, h.indexOf('</head>'));
const fonts = head.match(/<link rel="preconnect"[\s\S]*?display=swap" rel="stylesheet">/)[0];
const headScript = head.match(/<script>[\s\S]*?<\/script>/)[0];
const tgStyle = head.match(/<style id="tg-fixes">[\s\S]*?<\/style>/)[0];
const v3css = read('site/assets/bf-v3.css').replace(/url\((['"]?)(?!data:|https?:|#)([^)'"]+)\1\)/g, (_, q, u) => 'url(' + q + LIVE + 'assets/' + u + q + ')');

// ---- body ----
let body = h.slice(h.indexOf('>', h.indexOf('<body')) + 1, h.lastIndexOf('</body>'));
body = abs(body);

// scripts: inline in the same order (lenis, bf.js, bf-v3.js), with the paths that must point at the live site
const lenis = read('site/assets/js/lenis.min.js');
let bf = read('site/assets/bf.js');
bf = rep(bf, "ghlWebhook: '/api/lead'", "ghlWebhook: '" + LIVE + "api/lead'");
// text/plain + no-cors = a simple request: the browser sends it from the GHL domain without a CORS preflight;
// the Worker reads the body as JSON either way. We can't read the reply, so success is assumed (same as before).
bf = rep(bf, "{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }",
  "{ method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body), keepalive: true }");
bf = rep(bf, "fetch(base + 'api/spots')", "Promise.reject(new Error('spots: no CORS from GHL'))");
bf = rep(bf, "location.href = 'checkout/';", "location.href = '" + LIVE + "checkout/';");
let v3js = read('site/assets/bf-v3.js');
v3js = rep(v3js, "location.href = 'checkout/?pkg='", "location.href = '" + LIVE + "checkout/?pkg='");
body = rep(body, '<script src="' + LIVE + 'assets/js/lenis.min.js"></script>', '<script>\n' + lenis + '\n</script>');
body = rep(body, '<script src="' + LIVE + 'assets/bf.js"></script>', '<script>\n' + bf + '\n</script>');
body = rep(body, '<script src="' + LIVE + 'assets/bf-v3.js"></script>', '<script>\n' + v3js + '\n</script>');

const left = body.match(/(?:src|href|poster)="(?:assets|checkout|thank-you)\//g);
if (left) throw new Error('relative URLs left: ' + left.length);
if (/<script src=/.test(body)) throw new Error('external script left');

// ---- GHL glue (first) and cleanup (last) ----
const glueStart = `<script>
/* GHL: if the page already finished loading when this block runs, "load" listeners in the scripts below
   would never fire; run them right away instead (restored at the end of the block). */
(function () {
  if (document.readyState !== 'complete') return;
  var add = window.addEventListener;
  window.__dmiAdd = add;
  window.addEventListener = function (t, f, o) {
    if (t === 'load') { setTimeout(function () { (f.handleEvent ? f.handleEvent : f).call(window, new Event('load')); }, 0); return; }
    return add.call(this, t, f, o);
  };
})();
document.documentElement.lang = 'en';
document.body.style.margin = '0';
document.body.style.background = '#06111F';
</script>`;
const glueEnd = `<script>
if (window.__dmiAdd) { window.addEventListener = window.__dmiAdd; delete window.__dmiAdd; }
/* GHL wraps custom code in sections/rows/columns with padding and a max width: open them up to full width */
(function () {
  var el = document.getElementById('dmi-tg-root');
  for (var p = el && el.parentElement; p && p !== document.body; p = p.parentElement) {
    p.style.setProperty('padding', '0', 'important');
    p.style.setProperty('margin', '0', 'important');
    p.style.setProperty('max-width', 'none', 'important');
    p.style.setProperty('width', '100%', 'important');
    p.style.setProperty('overflow', 'visible', 'important');
    p.style.setProperty('transform', 'none', 'important');
  }
})();
</script>`;

const outHtml = `<!--
  DMI Thanksgiving Website Sale 2026, paste-in version for GoHighLevel (built ${new Date().toISOString().slice(0, 10)}).
  Paste ALL of this into ONE "Custom JS/HTML" element on an empty funnel step (remove the default header/footer).
  Leads go to GHL through ${LIVE}api/lead; buttons open the live checkout (${LIVE}checkout/).
  Images, videos and fonts load from ${LIVE} - keep that site online.
-->
${fonts}
<style>
${v3css}
</style>
${tgStyle}
${headScript}
${glueStart}
<div id="dmi-tg-root">
${body}
</div>
${glueEnd}
`;
fs.writeFileSync(out, outHtml);
console.log(out, (Buffer.byteLength(outHtml) / 1024 | 0) + ' KB');
