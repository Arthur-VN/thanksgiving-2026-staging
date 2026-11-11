// Thanksgiving 2026 variant of the live landing + the UI fixes from the 11/11 audit.
// Reads site/index.html (the live Black Friday landing), writes site/thanksgiving.html (same folder, so
// every relative path keeps working). Re-run after the landing changes: node 4-tools/build_thanksgiving.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(root, 'site/index.html'), 'utf8');

function sub(from, to, all) {
  const n = typeof from === 'string' ? h.split(from).length - 1 : (h.match(from) || []).length;
  if (!n) throw new Error('not found: ' + from);
  h = all ? h.split(from).join(to) : h.replace(from, () => to);
}

// ---------- 1. Campaign: Black Friday -> Thanksgiving (copy only, prices and offer unchanged) ----------
sub('<title>Black Friday Website Sale 2026 | Detailers Movement</title>',
  '<title>Thanksgiving Website Sale 2026 | Detailers Movement</title>\n<meta name="robots" content="noindex, nofollow"><!-- staging: remove once approved -->');
sub('<h1 id="dmx-hero-h">Black Friday <span class="text-gradient-blue">Website Sale 2026</span></h1>',
  '<p class="tg-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21c.5-4.5 2.5-8 6-10.5"/><path d="M9 18c-4-1-5.5-5-4.5-10 5 .5 8.5 2 10.5 5.5C17 10 16 6 12.5 3c5.5 1 8.5 5 8 10.5-.5 5.5-6.5 7.5-11.5 4.5z"/></svg>Thanksgiving week special</p>\n   <h1 id="dmx-hero-h">Thanksgiving <span class="text-gradient-blue">Website Sale 2026</span></h1>');
sub('Website design, Black Friday 2026', 'Website design, Thanksgiving 2026');
sub('Get the Black Friday deal', 'Get the Thanksgiving deal', true);
sub('Claim your <span class="text-gradient-blue">Black Friday offer</span>', 'Claim your <span class="text-gradient-blue">Thanksgiving offer</span>');
sub('Claim my Black Friday offer', 'Claim my Thanksgiving offer');
sub('Black Friday, 50% off<strong>', 'Thanksgiving, 50% off<strong>');
sub('Get your Black Friday <span class="text-gradient-blue">website quote</span>', 'Get your Thanksgiving <span class="text-gradient-blue">website quote</span>');
sub('reserves your Black Friday price', 'reserves your Thanksgiving price');
sub('Our Black Friday offers end soon.', 'Our Thanksgiving offers end soon.');
if (/Black Friday/.test(h.replace(/<!--[\s\S]*?-->/g, ''))) throw new Error('Black Friday copy left: ' + h.match(/.{40}Black Friday.{40}/)[0]);
// leads from this page are labelled Thanksgiving in GHL (bf.js reads it)
sub('<script src="assets/bf.js"></script>', '<script>window.BF_CAMPAIGN = \'Thanksgiving 2026 Website Sale\';</script>\n<script src="assets/bf.js"></script>');

// ---------- 2. Header + mobile drawer: in-page links instead of the full DMI site menu ----------
const LINKS = [['#standard', 'Standard'], ['#premium', 'Premium'], ['#reviews', 'Reviews'], ['#contact', 'FAQ']];
sub(/<nav class="hd-nav" aria-label="Main">[\s\S]*?<\/ul><\/nav>/,
  '<nav class="hd-nav" aria-label="Page sections"><ul>' + LINKS.map(l => '<li class="it"><a class="lk" href="' + l[0] + '">' + l[1] + '</a></li>').join('') + '</ul></nav>');
sub(/<ul class="mnav">[\s\S]*?<\/ul><\/nav>/,
  '<ul class="mnav">' + LINKS.map(l => '<li><a class="mlk" href="' + l[0] + '">' + l[1] + '</a></li>').join('') + '</ul></nav>');
sub('<a class="hd-logo" href="https://www.detailersmovement.com/"', '<a class="hd-logo" href="#top"');
// "Website Solutions" was marked as the current page (copied from the main site)
sub(' aria-current="page"', '', true);

// ---------- 3. CSS: Messenger bubble off, mobile spacing/order, footer tap targets, Thanksgiving accent ----------
const CSS = `
<style id="tg-fixes">
:root{--tg:#F5A524}
/* Messenger bubble opened Messenger instead of the offer and sat on the Premium "next" arrow */
.dmx-float{display:none!important}
.tg-pill{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;padding:6px 14px 6px 10px;border-radius:999px;background:rgba(245,165,36,.14);border:1px solid rgba(245,165,36,.45);color:#FFD08A;font:600 13px/1 Inter,system-ui,sans-serif;letter-spacing:.02em}
.tg-pill svg{width:16px;height:16px;color:var(--tg)}
/* the pill takes the kicker's place, so the hero keeps three small lines max */
.bf-hero .bf-k{display:none}
.bf-strip{border-top:3px solid var(--tg)}
.bf-strip b{color:#FFD08A}
@media(max-width:1024px){
  /* claim form before the FAQ on small screens */
  .dmx.dmx-end .grid .cta{order:-1}
}
@media(max-width:640px){
  /* headline had 8px under the header */
  .bf-hero .tg-pill{margin-top:18px}
  /* footer links were 17px tall */
  .dmx-ft .ft-col a{display:inline-block;padding:12px 0}
  .dmx-ft .ft-col li{margin:0}
}
</style>
</head>`;
sub('</head>', CSS);

fs.writeFileSync(path.join(root, 'site/thanksgiving.html'), h);
console.log('site/thanksgiving.html', (Buffer.byteLength(h) / 1024 | 0) + ' KB');
