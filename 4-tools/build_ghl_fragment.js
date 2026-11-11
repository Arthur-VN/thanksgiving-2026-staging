// Paste-in blocks for GoHighLevel "Custom JS/HTML" elements (no iframe), one per funnel step:
//   <outDir>/ghl-thanksgiving-2026.html           landing   (from site/thanksgiving.html)
//   <outDir>/ghl-thanksgiving-2026-checkout.html  checkout  (from site/thanksgiving-checkout/index.html)
// Run build_thanksgiving.js first.  usage: node 4-tools/build_ghl_fragment.js [outDir]
// - No <html>/<head>/<body>/<base>: CSS and all JS are inlined in order, so it works however GHL inserts the code.
// - Images, videos and fonts load from the live site (absolute URLs).
// - Leads / checkout starts post to the live Worker /api/lead as a "simple" cross-site request (no CORS needed).
// - The two steps link to each other through DMI_TG (GHL step paths, editable at the top of each file).
//   Both on the GHL domain -> the checkout is prefilled from the landing form (sessionStorage).
// - Spots counter shows "Only 10 available" (a live count needs CORS on /api/spots).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const LIVE = 'https://blackfriday2026.detailersmovement.com/';
const outDir = process.argv[2] || root;
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const STEPS = { landing: '/thanksgiving', checkout: '/thanksgiving-checkout' };

function rep(s, from, to, all) {
  const n = s.split(from).length - 1;
  if (!n) throw new Error('not found: ' + from.slice(0, 80));
  return all ? s.split(from).join(to) : s.replace(from, () => to);
}
const cssAbs = css => css.replace(/url\((['"]?)(?!data:|https?:|#)([^)'"]+)\1\)/g, (_, q, u) => 'url(' + q + LIVE + 'assets/' + u + q + ')');
const ghlBf = () => {
  let bf = read('site/assets/bf.js');
  bf = rep(bf, "ghlWebhook: '/api/lead'", "ghlWebhook: '" + LIVE + "api/lead'");
  // text/plain + no-cors = a simple request: sent from the GHL domain without a CORS preflight; the Worker reads the
  // body as JSON either way. The reply can't be read, so success is assumed (as before).
  bf = rep(bf, "{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }",
    "{ method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body), keepalive: true }");
  bf = rep(bf, "fetch(base + 'api/spots')", "Promise.reject(new Error('spots: no CORS from GHL'))");
  return bf;
};
const script = code => '<script>\n' + code + '\n</script>';

const config = `<script>
/* ===== EDIT HERE if your GHL step paths are different (same values in both files) ===== */
window.DMI_TG = { landing: '${STEPS.landing}', checkout: '${STEPS.checkout}' };
</script>`;
const glueStart = bg => `<script>
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
document.body.style.background = '${bg}';
</script>`;
const glueEnd = `<script>
if (window.__dmiAdd) { window.addEventListener = window.__dmiAdd; delete window.__dmiAdd; }
/* links between the two GHL steps */
[].forEach.call(document.querySelectorAll('#dmi-tg-root a[href^="dmi:"]'), function (a) {
  var h = a.getAttribute('href').slice(4), i = h.search(/[?#]/), step = i < 0 ? h : h.slice(0, i);
  a.setAttribute('href', window.DMI_TG[step] + (i < 0 ? '' : h.slice(i)));
});
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
const header = (what, path) => `<!--
  DMI Thanksgiving Website Sale 2026: ${what}, paste-in version for GoHighLevel (built ${new Date().toISOString().slice(0, 10)}).
  Paste ALL of this into ONE "Custom JS/HTML" element on an empty funnel step (remove the default header/footer).
  Set this step's path to ${path} (or change DMI_TG below, in both files).
  Leads go to GHL through ${LIVE}api/lead. Images, videos and fonts load from ${LIVE} - keep that site online.
-->`;
function check(body) {
  const left = body.match(/(?:src|href|poster)="(?:\.\.\/)?(?:assets|checkout|thank-you|thanksgiving)[\/"#?-]/g);
  if (left) throw new Error('relative URLs left: ' + left.join(', '));
  if (/<script src=/.test(body)) throw new Error('external script left');
}
function write(name, html) {
  const f = path.join(outDir, name);
  fs.writeFileSync(f, html);
  console.log(f, (Buffer.byteLength(html) / 1024 | 0) + ' KB');
}

// ================= landing =================
{
  const h = read('site/thanksgiving.html');
  const head = h.slice(0, h.indexOf('</head>'));
  const fonts = head.match(/<link rel="preconnect"[\s\S]*?display=swap" rel="stylesheet">/)[0];
  const headScript = head.match(/<script>[\s\S]*?<\/script>/)[0];
  const tgStyle = head.match(/<style id="tg-fixes">[\s\S]*?<\/style>/)[0];
  let body = h.slice(h.indexOf('>', h.indexOf('<body')) + 1, h.lastIndexOf('</body>'));
  body = body
    .replace(/(\b(?:src|href|poster|srcset)=")assets\//g, '$1' + LIVE + 'assets/')
    .replace(/'assets\/'/g, "'" + LIVE + "assets/'")
    .replace(/href="thanksgiving-checkout\/\?/g, 'href="dmi:checkout?');
  body = rep(body, "window.BF_CHECKOUT = 'thanksgiving-checkout/';", 'window.BF_CHECKOUT = window.DMI_TG.checkout;');
  body = rep(body, '<script src="' + LIVE + 'assets/js/lenis.min.js"></script>', script(read('site/assets/js/lenis.min.js')));
  body = rep(body, '<script src="' + LIVE + 'assets/bf.js"></script>', script(ghlBf()));
  body = rep(body, '<script src="' + LIVE + 'assets/bf-v3.js"></script>', script(read('site/assets/bf-v3.js')));
  check(body);
  write('ghl-thanksgiving-2026.html', [header('landing page', STEPS.landing), config, fonts,
    '<style>\n' + cssAbs(read('site/assets/bf-v3.css')) + '\n</style>', tgStyle, headScript, glueStart('#06111F'),
    '<div id="dmi-tg-root">', body, '</div>', glueEnd, ''].join('\n'));
}

// ================= checkout =================
{
  const h = read('site/thanksgiving-checkout/index.html');
  const head = h.slice(0, h.indexOf('</head>'));
  const fonts = head.match(/<link rel="preconnect"[\s\S]*?display=swap" rel="stylesheet">/)[0];
  const tgStyle = head.match(/<style id="tg-checkout">[\s\S]*?<\/style>/)[0];
  let body = h.slice(h.indexOf('>', h.indexOf('<body')) + 1, h.lastIndexOf('</body>'));
  body = body
    .replace(/(\b(?:src|href)=")\.\.\/assets\//g, '$1' + LIVE + 'assets/')
    .replace(/href="\.\.\/thanksgiving([#"])/g, 'href="dmi:landing$1');
  body = rep(body, '<script src="' + LIVE + 'assets/bf.js"></script>', script(ghlBf()));
  // demo fallback only (both payment links are set): the thank-you page lives on the Worker
  body = rep(body, "('../thank-you/?pkg='", "('" + LIVE + "thank-you/?pkg='");
  check(body);
  write('ghl-thanksgiving-2026-checkout.html', [header('checkout ($99 deposit)', STEPS.checkout), config, fonts,
    '<style>\n' + cssAbs(read('site/assets/bf.css')) + '\n</style>', tgStyle, glueStart('#06111F'),
    '<div id="dmi-tg-root">', body, '</div>', glueEnd, ''].join('\n'));
}
