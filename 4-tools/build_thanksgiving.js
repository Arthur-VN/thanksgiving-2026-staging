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
// ...and every "reserve" button goes to the Thanksgiving checkout (site/thanksgiving-checkout/)
sub('<script src="assets/bf.js"></script>', '<script>window.BF_CAMPAIGN = \'Thanksgiving 2026 Website Sale\'; window.BF_CHECKOUT = \'thanksgiving-checkout/\';</script>\n<script src="assets/bf.js"></script>');
sub('href="checkout/', 'href="thanksgiving-checkout/', true);


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

// ---------- 5. Redesign (Fender 12/11): giveaway hero with Jesse's video, compact package headers, FAQ | form, strip ----------
// Video: E:\Detailers Movement\Products\WEBSITE\Thanksgiving\DM_Thanksgiving_Giveaway_16x9.mp4, encoded into
// site/assets/tg/ (giveaway.mp4 720p with sound, giveaway-teaser.mp4 = first 14 s muted, giveaway-poster.webp).
const GIFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const formFields = h.match(/<label class="bf-f">[\s\S]*?Business name"><\/label>/)[0]; // the 3 fields, same as Black Friday
const SEC = h.match(/<p class="bf-sec">[\s\S]*?<\/p>/)[0];

// --- hero ---
sub(/<div class="wrap copy bf-hero">[\s\S]*?<\/form>\r?\n <\/div>/, `<div class="wrap copy bf-hero tg-hero">
  <p class="tg-pill tg-give">${GIFT}Thanksgiving Giveaway</p>
  <h1 id="dmx-hero-h"><span class="tg-l1">Thanksgiving</span> <span class="text-gradient-blue">Website Sale 2026</span></h1>
  <div class="tg-grid">
   <div class="tg-main">
   <div class="tg-vid" data-full="assets/tg/giveaway.mp4">
    <div class="in">
     <video class="tg-v" src="assets/tg/giveaway-teaser.mp4" poster="assets/tg/giveaway-poster.webp" muted loop autoplay playsinline webkit-playsinline preload="metadata" width="1280" height="720" aria-label="Jesse from Detailers Movement on the Thanksgiving giveaway"></video>
     <div class="scrim" aria-hidden="true"></div>
     <button class="tg-play" type="button"><i>${PLAY}</i><span><b>Watch Jesse's Thanksgiving message</b><small>1:14 · sound on</small></span></button>
    </div>
   </div>
    <div class="tg-offer">
     <p class="tg-off"><b>50%</b><span>OFF<small>Website design, Thanksgiving 2026</small></span></p>
     <p class="tg-tiers"><a href="#standard"><span>Standard</span><s>$1,000</s><b>$500</b></a><a href="#premium"><span>Premium</span><s>$2,000</s><b>$1,000</b></a></p>
     <div class="bf-spots tg-spots" data-spots><p><b>Only 10 available</b><small>at 50% off</small><span data-left></span></p><i aria-hidden="true"></i></div>
    </div>
   </div>
   <div class="tg-side">
    <form class="bf-form" data-lead="hero" id="claim">
     <h2>Claim your <span class="text-gradient-blue">Thanksgiving offer</span></h2>
     <p>Fill in your details, then reserve your spot with a $99 deposit.</p>
     ${formFields}
     <button class="btn btn-primary" type="submit">Claim my Thanksgiving offer</button>
     ${SEC}
    </form>
   </div>
  </div>
  <ul class="tg-proof"><li><b>1,000+</b>websites built since 2021</li><li><b>30 days</b>to launch</li><li><b>$99</b>deposit holds your spot</li></ul>
 </div>`);
// the web wall behind the hero opens client sites on click: not when the click is on the video
sub("over.closest('.copy a,.copy button,.bf-form,.dmx-hd')", "over.closest('.copy a,.copy button,.bf-form,.tg-vid,.tg-offer,.dmx-hd')");
sub("if(e.target.closest('.bf-form'))return;", "if(e.target.closest('.bf-form,.tg-vid,.tg-offer'))return;");

// --- Standard: one compact header (label, promise, inclusions as chips | price card with the button) ---
const chips = a => '<ul class="tg-chips">' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
sub(/<div class="hd">\s*<div>\s*<h2 class="tname" id="std-h">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/, `<div class="hd tg-pk">
   <div class="tg-pk-l">
    <p class="tg-pk-k"><span>01</span>Standard website</p>
    <h2 class="tname" id="std-h">Choose any website we've built.<span class="sr"> Standard website, $500, normally $1,000.</span></h2>
    <p class="lead">A few of the 1,000+ we've built since 2021. Pick one and we build yours the same way, with your logo, photos and colours.</p>
    ${chips(['Up to 20 pages', 'Mobile &amp; tablet optimised', 'Lead forms &amp; contact integration', 'SEO-friendly setup', 'Google Analytics &amp; Search Console'])}
   </div>
   <div class="tg-px" aria-label="Standard price">
    <p class="tg-px-top"><s>$1,000</s><em>50% OFF</em></p>
    <p class="tg-px-now">$500</p>
    <p class="tg-px-sub">+ hosting from $25/month</p>
    <a class="btn btn-primary" href="thanksgiving-checkout/?pkg=standard">Get Standard</a>
   </div>
  </div>`);
sub(/\s*<ul class="inc">[\s\S]*?<\/ul>/, ''); // now the chips + price card

// --- Premium: same header, dark ---
sub(/<header class="p3-hd">[\s\S]*?<\/header>/, `<header class="p3-hd tg-pk">
   <div class="tg-pk-l p3-in">
    <p class="tg-pk-k"><span>02</span>Premium website<b>Best value</b></p>
    <h2 class="tname" id="dmx-prm-h">Pick a design. Live in 30 days.<span class="sr"> Premium website, $1,000, normally $2,000.</span></h2>
    <p class="lead">We fit it to your brand, your services and every screen.</p>
    ${chips(['Up to 30 pages', 'Everything in Standard', '3 months Local SEO, valued at $897', 'Free DMI Atomic G5 coating'])}
   </div>
   <div class="tg-px p3-in" aria-label="Premium price">
    <p class="tg-px-top"><s>$2,000</s><em>50% OFF</em></p>
    <p class="tg-px-now">$1,000</p>
    <p class="tg-px-sub">+ hosting from $25/month. Pick your design below.</p>
   </div>
  </header>`);

// --- end: FAQ left, form right (form first on phones), giveaway label on the form ---
sub('<h3 class="fq rv">FAQ</h3>', '<p class="tg-pk-k rv"><span>?</span>FAQ</p>\n   <h3 class="tg-fqh rv">Questions, answered.</h3>');
sub(/<div class="cta">\s*<h2 id="dmx-cta-h"/,'<div class="cta">\n   <p class="tg-pill tg-give">' + GIFT + 'Thanksgiving Giveaway</p>\n   <h2 id="dmx-cta-h"');

// --- limited-time strip ---
const MQ = ['Thanksgiving Giveaway', '50% off website design', 'Only 10 spots', '$99 deposit holds your spot'].map(x => '<span>' + x + '</span><i>✦</i>').join('');
sub(/<section class="dmx bf-strip"[\s\S]*?<\/section>/, `<section class="dmx bf-strip tg-strip" aria-label="Offer ends soon">
 <div class="tg-mq" aria-hidden="true"><div>${MQ}${MQ}${MQ}${MQ}</div></div>
 <div class="wrap">
  <div class="tg-s-l">
   <p class="tg-s-k">${GIFT}Limited time only</p>
   <p class="tg-s-t">Our Thanksgiving offers <span>end soon.</span></p>
  </div>
  <p class="tg-s-big"><b>50%</b><span>OFF<small>Website design.<br>Don't miss out.</small></span></p>
  <a class="btn btn-primary tg-s-go" href="#claim">Claim my spot</a>
 </div>
</section>`);

const CSS2 = `<style id="tg-redesign">
@property --tga{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes tgSpin{to{--tga:360deg}}
@keyframes tgShine{0%{background-position:120% 0}100%{background-position:-120% 0}}
@keyframes tgPing{0%{box-shadow:0 0 0 0 rgba(0,118,255,.55)}100%{box-shadow:0 0 0 16px rgba(0,118,255,0)}}
@keyframes tgMq{to{transform:translate3d(-50%,0,0)}}
.tg-give{background:linear-gradient(90deg,rgba(245,165,36,.22),rgba(245,165,36,.08));border-color:rgba(245,165,36,.55);color:#FFD08A;text-transform:uppercase;letter-spacing:.12em;font-size:12px;padding:8px 15px 8px 11px}
.tg-give svg{color:#F5A524}

/* ===== hero ===== */
#top .bf-shade{background:radial-gradient(900px 520px at 30% 60%,rgba(5,13,24,.94),rgba(5,13,24,.74) 60%,rgba(5,13,24,.45)),linear-gradient(180deg,rgba(5,13,24,.6),rgba(5,13,24,.2) 30%,rgba(5,13,24,.85))}
#top .bf-shade:after{content:"";position:absolute;inset:0;background:radial-gradient(640px 360px at 18% 100%,rgba(245,165,36,.16),transparent 70%),radial-gradient(700px 420px at 85% 10%,rgba(0,118,255,.22),transparent 70%)}
#top .hint{display:none}
#top .copy.bf-hero.tg-hero{display:block;width:100%;padding-top:22px;padding-bottom:30px}
#top .tg-hero .tg-pill{margin:0 0 14px;animation:dmxRise 1.4s cubic-bezier(.22,1,.36,1) .5s both}
#top .tg-hero h1{margin:0;max-width:none;font-size:clamp(38px,4.7vw,74px);line-height:1;letter-spacing:-.045em;text-shadow:none}
#top .tg-hero h1 .tg-l1{background:linear-gradient(100deg,#fff 0%,#fff 35%,#FFD48F 45%,#F5A524 50%,#FFD48F 55%,#fff 65%,#fff 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:tgShine 7s cubic-bezier(.45,.05,.35,1) 2s infinite}
#top .tg-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,392px);gap:20px;margin-top:24px;align-items:stretch}
#top .tg-main{display:flex;flex-direction:column;gap:14px;min-width:0}
/* video: thin turning amber/blue edge, poster + muted teaser, click = full film with sound */
#top .tg-vid{position:relative;pointer-events:auto;align-self:start;padding:1.5px;border-radius:24px;background:conic-gradient(from var(--tga),rgba(245,165,36,.95),rgba(0,118,255,.15) 22%,rgba(108,203,255,.9) 50%,rgba(0,118,255,.15) 78%,rgba(245,165,36,.95));animation:tgSpin 9s linear infinite,dmxRise 1.6s cubic-bezier(.22,1,.36,1) .9s both;box-shadow:0 60px 120px -50px rgba(0,0,0,1),0 0 90px -40px rgba(245,165,36,.5)}
#top .tg-vid .in{position:relative;aspect-ratio:16/9;border-radius:22.5px;overflow:hidden;background:#050d18}
#top .tg-vid video{display:block;width:100%;height:100%;object-fit:cover}
#top .tg-vid .scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,13,24,0) 50%,rgba(5,13,24,.82));transition:opacity .5s}
#top .tg-play{position:absolute;left:20px;bottom:20px;display:flex;align-items:center;gap:14px;padding:8px 22px 8px 8px;border:0;border-radius:999px;background:rgba(255,255,255,.97);color:#0A1222;font:inherit;text-align:left;cursor:pointer;box-shadow:0 20px 40px -16px rgba(0,0,0,.7);transition:transform .35s cubic-bezier(.22,1,.36,1),opacity .4s}
#top .tg-play:hover{transform:translateY(-2px) scale(1.02)}
#top .tg-play i{display:grid;place-items:center;flex:none;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#0055FF,#2E8BFF);color:#fff;animation:tgPing 2s infinite}
#top .tg-play i svg{width:20px;height:20px;margin-left:2px}
#top .tg-play b{display:block;font:800 15px/1.2 Manrope,Inter,sans-serif;letter-spacing:-.01em}
#top .tg-play small{display:block;margin-top:2px;font:500 12.5px Inter,sans-serif;color:#5A6782}
#top .tg-vid.on .scrim,#top .tg-vid.on .tg-play{opacity:0;pointer-events:none}
/* offer + form */
#top .tg-side{display:flex;flex-direction:column;gap:12px;pointer-events:auto}
#top .tg-offer{display:grid;grid-template-columns:auto 1fr 1fr minmax(170px,.9fr);align-items:center;gap:10px;padding:12px 14px 12px 20px;border-radius:20px;background:rgba(6,17,31,.78);border:1px solid rgba(169,214,255,.16);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);animation:dmxRise 1.6s cubic-bezier(.22,1,.36,1) 1.05s both}
#top .tg-off{display:flex;align-items:center;gap:12px;margin:0}
#top .tg-off b{font:800 54px/.9 Manrope,Inter,sans-serif;letter-spacing:-.05em;background:linear-gradient(180deg,#fff,#7CC4FF);-webkit-background-clip:text;background-clip:text;color:transparent}
#top .tg-off span{font:800 22px/1 Manrope,Inter,sans-serif;color:#fff;letter-spacing:-.01em}
#top .tg-off small{display:block;margin-top:5px;font:500 12.5px Inter,sans-serif;color:#A9BDD3;letter-spacing:0}
#top .tg-tiers{display:contents}
#top .tg-tiers a{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(169,214,255,.12);color:#fff;text-decoration:none;transition:border-color .25s,background .25s}
#top .tg-tiers a:hover{border-color:rgba(108,203,255,.6);background:rgba(0,118,255,.12)}
#top .tg-tiers span{width:100%;font:600 12px Inter,sans-serif;color:#A9BDD3;letter-spacing:.04em;text-transform:uppercase}
#top .tg-tiers s{font-size:13px;color:#8592AA}
#top .tg-tiers b{font:800 20px Manrope,Inter,sans-serif;letter-spacing:-.02em}
#top .tg-off{margin-right:8px}
#top .tg-spots{margin:0 0 0 6px;animation:none}
#top .tg-spots p{font-size:14px;line-height:1.3;text-shadow:none}
#top .tg-spots small{display:block;font-size:12px;color:#A9BDD3}
#top .tg-spots i{max-width:none;gap:3px}
#top .tg-spots i em{height:4px}
#top .tg-hero .bf-form{flex:1;display:flex;flex-direction:column;justify-content:center;padding:26px 24px 20px;border-radius:22px}
#top .tg-hero .bf-form h2{font-size:25px}
#top .tg-hero .bf-form>p{margin:8px 0 18px;font-size:14px}
#top .tg-hero .bf-form .bf-sec{margin-top:10px;font-size:12px}
#top .tg-proof{display:flex;flex-wrap:wrap;gap:10px 30px;margin:22px 0 0;padding:0;list-style:none;color:#A9BDD3;font-size:14px;animation:dmxRise 1.6s cubic-bezier(.22,1,.36,1) 1.3s both}
#top .tg-proof li{display:flex;align-items:baseline;gap:7px}
#top .tg-proof li+li:before{content:"";align-self:center;width:4px;height:4px;margin-right:22px;border-radius:50%;background:rgba(169,214,255,.35)}
#top .tg-proof b{font:800 18px Manrope,Inter,sans-serif;color:#fff;letter-spacing:-.01em}
@media(max-width:1100px){#top .tg-grid{grid-template-columns:minmax(0,1fr) 340px}#top .tg-offer{grid-template-columns:auto 1fr 1fr}#top .tg-spots{grid-column:1/-1;margin:2px 0 0}}
@media(max-width:900px){
  #top .tg-grid{grid-template-columns:1fr;max-width:680px}
  #top .tg-proof li+li:before{display:none}
}
@media(max-width:640px){
  #top.dmx-show{align-items:flex-start;padding-bottom:0}
  #top .copy.bf-hero.tg-hero{padding-top:22px;padding-bottom:34px}
  #top .tg-hero .tg-pill{margin:0 0 14px;font-size:11px}
  #top .tg-hero h1{font-size:clamp(36px,10.6vw,46px);line-height:1.02}
  #top .tg-hero h1 .text-gradient-blue{display:block}
  #top .tg-grid{gap:12px;margin-top:20px}
  #top .tg-vid{border-radius:18px}
  #top .tg-vid .in{border-radius:16.5px}
  #top .tg-play{left:10px;bottom:10px;gap:10px;padding:5px 14px 5px 5px}
  #top .tg-play i{width:38px;height:38px}
  #top .tg-play b{font-size:13px}
  #top .tg-play small{font-size:11.5px}
  #top .tg-off b{font-size:46px}
  #top .tg-offer{grid-template-columns:1fr 1fr;padding:14px}
  #top .tg-off{grid-column:1/-1;margin:0 0 4px}
  #top .tg-proof{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;font-size:13px}
  #top .tg-proof li{flex-direction:column;gap:2px}
}

/* ===== package headers (Standard light, Premium dark) ===== */
.tg-pk-k{display:flex;align-items:center;gap:12px;margin:0 0 16px;font:700 12px/1 Inter,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.tg-pk-k span{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:1px solid var(--line2);font:800 12px Manrope,Inter,sans-serif;letter-spacing:0;color:var(--blue)}
.tg-pk-k b{padding:5px 10px;border-radius:999px;background:rgba(245,165,36,.16);color:#F5A524;font-weight:700;letter-spacing:.1em}
body #standard.dmx .tg-pk,body #premium .p3-hd.tg-pk{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:56px;align-items:end}
body #standard.dmx .tg-pk h2.tname,body #premium .tg-pk h2.tname{margin:0;font:800 clamp(32px,3.5vw,50px)/1.06 Manrope,Inter,sans-serif;letter-spacing:-.035em}
body #standard.dmx .tg-pk .lead,body #premium .tg-pk .lead{display:block;margin:14px 0 0;max-width:620px;font-size:16.5px;line-height:1.55}
.tg-chips{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 0;padding:0;list-style:none}
.tg-chips li{display:inline-flex;align-items:center;gap:7px;padding:8px 13px 8px 10px;border-radius:999px;border:1px solid var(--line2);background:#fff;font:600 13.5px/1.1 Inter,system-ui,sans-serif;color:var(--text)}
.tg-chips li:before{content:"";flex:none;width:15px;height:15px;border-radius:50%;background:var(--blue) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/10px no-repeat}
.tg-px{position:relative;overflow:hidden;padding:24px;border-radius:22px;background:#0A1222;color:#fff;box-shadow:0 30px 60px -32px rgba(10,18,34,.7)}
.tg-px:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(260px 160px at 100% 0%,rgba(0,118,255,.45),transparent 70%),radial-gradient(220px 140px at 0% 100%,rgba(245,165,36,.14),transparent 70%)}
.tg-px>*{position:relative}
.tg-px-top{display:flex;align-items:center;gap:10px;margin:0;font:600 17px Manrope,Inter,sans-serif;color:#8C9AB3}
.tg-px-top s{text-decoration-thickness:1.5px}
.tg-px-top em{font:700 11.5px Inter,sans-serif;font-style:normal;letter-spacing:.06em;padding:5px 9px;border-radius:999px;background:#0076FF;color:#fff}
.tg-px-now{margin:10px 0 0;font:800 64px/1 Manrope,Inter,sans-serif;letter-spacing:-.045em;background:linear-gradient(180deg,#fff 20%,#9EDBFF);-webkit-background-clip:text;background-clip:text;color:transparent}
.tg-px-sub{margin:8px 0 18px;font-size:14px;color:#A9BDD3}
.tg-px .btn{display:flex;width:100%;justify-content:center}
body #standard.dmx .bar{margin-top:44px}
/* Premium (dark): glass price card, dark chips */
body #premium .tg-pk-k{color:#C9D6EA}
body #premium .tg-pk-k span{border-color:rgba(201,214,234,.25);color:#6CCBFF}
body #premium .tg-pk h2.tname{color:#fff}
body #premium .tg-chips li{background:rgba(255,255,255,.04);border-color:rgba(201,214,234,.18);color:#DCE4F0}
body #premium .tg-chips li:before{background-color:#2E8BFF}
body #premium .p3-hd.tg-pk{grid-template-columns:minmax(0,1fr) 340px;gap:48px}
body #premium .tg-px-sub{margin-bottom:0}
body #premium .tg-px{background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(201,214,234,.16);box-shadow:none}
@media(max-width:1024px){
  body #standard.dmx .tg-pk,body #premium .p3-hd.tg-pk{grid-template-columns:1fr;gap:24px}
  .tg-px{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 18px}
  .tg-px-top{grid-column:1;grid-row:1}
  .tg-px-now{grid-column:1;grid-row:2;margin:0;font-size:52px}
  .tg-px-sub{grid-column:1;grid-row:3;margin:4px 0 0}
  .tg-px .btn{grid-column:2;grid-row:1/4;width:auto;justify-self:end}
}
@media(max-width:640px){
  body #standard.dmx .tg-pk h2.tname,body #premium .tg-pk h2.tname{font-size:30px}
  body #standard.dmx .tg-pk .lead{font-size:15.5px}
  body #premium .tg-pk .lead{display:none}
  .tg-chips{gap:6px;margin-top:18px}
  .tg-chips li{font-size:12.5px;padding:7px 11px 7px 8px}
  .tg-px{display:block;padding:20px}
  .tg-px-now{margin-top:8px;font-size:48px}
  .tg-px-sub{margin:6px 0 16px}
  .tg-px .btn{width:100%}
  body #standard.dmx .bar{margin-top:32px}
}

/* ===== FAQ | form ===== */
body #contact .grid{grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:64px}
body #contact .grid>[data-rv-step]{order:1}
body #contact .grid .cta{order:2;position:sticky;top:96px;background:radial-gradient(420px 260px at 100% 0%,rgba(0,118,255,.5),transparent 70%),radial-gradient(360px 240px at 0% 100%,rgba(245,165,36,.18),transparent 70%),linear-gradient(180deg,#0E1A30,#0A1222)}
body #contact .cta .tg-pill{margin-bottom:18px}
body #contact .tg-pk-k{margin-bottom:12px}
body #contact .tg-fqh{margin:0 0 26px;font:800 clamp(32px,3.4vw,46px)/1.06 Manrope,Inter,sans-serif;letter-spacing:-.035em;color:var(--text)}
body #contact details{margin:0 0 10px;padding:0 22px;border:1px solid var(--line);border-radius:18px;background:#fff;transition:border-color .3s,box-shadow .3s}
body #contact details[open]{border-color:rgba(0,118,255,.35);box-shadow:0 24px 50px -30px rgba(10,18,34,.35)}
body #contact summary{padding:20px 0;font-size:17px}
body #contact details p{margin:0 0 20px}
@media(max-width:1024px){body #contact .grid{grid-template-columns:1fr;gap:40px}body #contact .grid .cta{order:-1;position:relative;top:auto}}
@media(max-width:640px){body #contact details{padding:0 16px;border-radius:14px}body #contact summary{font-size:15.5px;padding:16px 0}}

/* ===== limited-time strip ===== */
body section.bf-strip.tg-strip{position:relative;overflow:hidden;padding:0 0 0;color:#fff;background:radial-gradient(700px 300px at 8% 110%,rgba(245,165,36,.22),transparent 70%),radial-gradient(800px 360px at 92% -10%,rgba(0,118,255,.45),transparent 70%),#06111F;border-top:1px solid rgba(169,214,255,.12);border-bottom:1px solid rgba(169,214,255,.12)}
.tg-mq{overflow:hidden;border-bottom:1px solid rgba(169,214,255,.12);background:linear-gradient(90deg,rgba(245,165,36,.16),rgba(0,118,255,.16))}
.tg-mq>div{display:flex;width:max-content;animation:tgMq 40s linear infinite}
.tg-mq span{padding:12px 0;font:700 12.5px/1 Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#FFD08A;white-space:nowrap}
.tg-mq i{padding:12px 22px;font-style:normal;font-size:12px;line-height:1;color:#2E8BFF}
body section.tg-strip .wrap{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:40px;min-height:0;padding-top:52px;padding-bottom:56px}
body section.tg-strip p{margin:0}
body section.tg-strip .tg-s-k{display:flex;align-items:center;gap:9px;font:700 12.5px Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#F5A524}
body section.tg-strip .tg-s-k svg{width:16px;height:16px}
body section.tg-strip .tg-s-t{margin-top:12px;font:800 clamp(28px,3vw,42px)/1.08 Manrope,Inter,sans-serif;letter-spacing:-.03em;color:#fff}
body section.tg-strip .tg-s-t span{opacity:1;margin:0;display:block;color:#8FC8FF}
body section.tg-strip .tg-s-big{display:flex;align-items:center;gap:14px;text-align:left}
body section.tg-strip .tg-s-big b{display:block;font:800 clamp(72px,8vw,120px)/.85 Manrope,Inter,sans-serif;letter-spacing:-.06em;background:linear-gradient(180deg,#fff 10%,#5AAEFF 95%);-webkit-background-clip:text;background-clip:text;color:transparent}
body section.tg-strip .tg-s-big span{opacity:1;margin:0;display:block;font:800 30px/1 Manrope,Inter,sans-serif;letter-spacing:-.02em;color:#fff}
body section.tg-strip .tg-s-big small{display:block;margin-top:8px;font:500 14px/1.35 Inter,sans-serif;letter-spacing:0;color:#A9BDD3}
.tg-s-go{white-space:nowrap}
@media(max-width:900px){body section.tg-strip .wrap{grid-template-columns:1fr auto;gap:28px}.tg-s-go{grid-column:1/-1;justify-self:start}}
@media(max-width:640px){body section.tg-strip .wrap{grid-template-columns:1fr;gap:22px;padding-top:36px;padding-bottom:40px}body section.tg-strip .tg-s-big b{font-size:84px}.tg-s-go{display:flex!important;width:100%;justify-content:center}}
@media(prefers-reduced-motion:reduce){.tg-mq>div,#top .tg-vid,#top .tg-hero h1 .tg-l1,#top .tg-play i{animation:none}}
</style>
</head>`;
sub('</head>', CSS2);

// video: the muted teaser loops; the button plays the full film with sound and controls
sub('</body>', `<script>
(function(){var w=document.querySelector('.tg-vid');if(!w)return;var v=w.querySelector('video'),b=w.querySelector('.tg-play');
 var still=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('no-autovideo');
 if(still){v.removeAttribute('autoplay');v.pause()}
 b.addEventListener('click',function(){w.classList.add('on');v.loop=false;v.muted=false;v.src=w.getAttribute('data-full');v.controls=true;
  var p=v.play();if(p&&p.catch)p.catch(function(){});
  try{(window.dataLayer=window.dataLayer||[]).push({event:'tg_video_play'})}catch(e){}});
 v.addEventListener('ended',function(){if(w.classList.contains('on'))v.controls=true});
})();
/* menu links scroll without leaving "#section" in the URL, and a reload starts at the top
   (links from the checkout like thanksgiving#standard still land on their section) */
(function(){var clean=function(){if(location.hash)try{history.replaceState(history.state,'',location.pathname+location.search)}catch(e){}};
 try{history.scrollRestoration='manual'}catch(e){}
 var nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
 if(nav&&nav.type==='reload'){clean();scrollTo(0,0);addEventListener('load',function(){setTimeout(function(){scrollTo(0,0)},0)})}
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(a&&a.getAttribute('href').length>1)setTimeout(clean,60)},true);
})();
</script>
</body>`);

fs.writeFileSync(path.join(root, 'site/thanksgiving.html'), h);
console.log('site/thanksgiving.html', (Buffer.byteLength(h) / 1024 | 0) + ' KB');

// ---------- 4. Thanksgiving checkout: site/thanksgiving-checkout/index.html from the Black Friday checkout ----------
// Same packages, deposit, hosting, GHL payment links and payload; copy, links and campaign label changed.
h = fs.readFileSync(path.join(root, 'site/checkout/index.html'), 'utf8');
sub('<title>Reserve your Black Friday website | Detailers Movement</title>', '<title>Reserve your Thanksgiving website | Detailers Movement</title>');
sub('<a class="logo" href="../" aria-label="Back to the Black Friday offer">', '<a class="logo" href="../thanksgiving" aria-label="Back to the Thanksgiving offer">');
sub('href="../#', 'href="../thanksgiving#', true);
sub('<h1>Choose your <span class="hl">Black Friday</span><br>website package.</h1>',
  '<p class="tg-pill tg-give">' + GIFT + 'Thanksgiving Giveaway</p>\n        <h1>Choose your <span class="tg-l1">Thanksgiving</span><br><span class="tg-blue">website package.</span></h1>');
sub('Reserve your Black Friday price', 'Reserve your Thanksgiving price');
sub('<b>50% OFF</b><span>Black Friday website sale</span>', '<p class="tg-off"><b>50%</b><span>OFF<small>Thanksgiving website sale</small></span></p>');
sub('<div class="badge">', '<div class="badge tg-badge">');
sub('Black Friday price', 'Thanksgiving price', true);
if (/Black Friday/.test(h)) throw new Error('checkout: Black Friday copy left: ' + h.match(/.{40}Black Friday.{40}/)[0]);
sub('<script src="../assets/bf.js"></script>', '<script>window.BF_CAMPAIGN = \'Thanksgiving 2026 Website Sale\';</script>\n<script src="../assets/bf.js"></script>');

// Redesign (Fender 12/11): same look as the new landing (white header, giveaway label, numbered sections, turning edge on the
// picked package, navy summary with glows, pill buttons, marquee above the footer). Form, ids and script unchanged.
sub(/<header class="hd">[\s\S]*?<\/header>/, `<header class="hd">
  <div class="wrap">
    <a class="logo" href="../thanksgiving" aria-label="Back to the Thanksgiving offer"><img src="../assets/logo-dmi-light-header.webp" alt="Detailers Movement" width="155" height="30"></a>
    <nav aria-label="Page sections"><a href="../thanksgiving#standard">Standard</a><a href="../thanksgiving#premium">Premium</a><a href="../thanksgiving#reviews">Reviews</a><a href="../thanksgiving#contact">FAQ</a></nav>
    <span class="tg-secure"><svg><use href="#i-lock"/></svg>Secure checkout</span>
  </div>
</header>`);
sub('<h2>Which website would you like?</h2>', '<p class="tg-pk-k"><span>01</span>Your package</p>\n    <h2>Which website would you like?</h2>');
sub('<h2>Reserve your website for $99.</h2>', '<p class="tg-pk-k"><span>02</span>Reserve<b>$99 deposit</b></p>\n    <h2>Reserve your website for $99.</h2>');
const MQC = ['Thanksgiving Giveaway', '50% off website design', 'Only 10 spots', '$99 deposit holds your spot'].map(x => '<span>' + x + '</span><i>✦</i>').join('');
sub('<footer class="ft">', `<div class="tg-mq" aria-hidden="true"><div>${MQC}${MQC}${MQC}${MQC}</div></div>\n<footer class="ft">`);
sub('</head>', `<style id="tg-checkout">
@property --tga{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes tgSpin{to{--tga:360deg}}
@keyframes tgShine{0%{background-position:120% 0}100%{background-position:-120% 0}}
@keyframes tgMq{to{transform:translate3d(-50%,0,0)}}
:root{--tg:#F5A524;--grad-btn:linear-gradient(135deg,#2E8FFF 0%,#0076FF 50%,#0055FF 100%);--grad-text:linear-gradient(90deg,#3D8DFF 0%,#2EA8FF 45%,#7AD3FF 100%)}
body{background:radial-gradient(1000px 520px at 88% -8%,rgba(0,118,255,.26),transparent 70%),radial-gradient(760px 460px at -5% 22%,rgba(245,165,36,.09),transparent 70%),#06111F;background-repeat:no-repeat}
/* header: white, as on the landing */
body .hd{background:rgba(255,255,255,.97);border-bottom:1px solid rgba(33,42,64,.08)}
body .hd .wrap{height:72px}
body .hd nav{gap:30px;font:500 15px Inter,system-ui,sans-serif}
body .hd nav a{color:#4A5670}
body .hd nav a:hover{color:#0A1222}
.tg-secure{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;border:1px solid #DCE3EE;color:#212A40;font:600 13.5px Inter,sans-serif;white-space:nowrap}
.tg-secure svg{width:15px;height:15px;color:#0076FF}
@media(max-width:1024px){.tg-secure{margin-left:auto}}
/* title block */
.tg-give{display:inline-flex;align-items:center;gap:8px;margin:0 0 18px;padding:8px 15px 8px 11px;border-radius:999px;background:linear-gradient(90deg,rgba(245,165,36,.22),rgba(245,165,36,.08));border:1px solid rgba(245,165,36,.55);color:#FFD08A;font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.tg-give svg{width:16px;height:16px;color:#F5A524}
body .co h1{font-size:clamp(40px,4.8vw,68px);letter-spacing:-.045em}
.tg-l1{background:linear-gradient(100deg,#fff 0%,#fff 35%,#FFD48F 45%,#F5A524 50%,#FFD48F 55%,#fff 65%,#fff 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:tgShine 7s cubic-bezier(.45,.05,.35,1) 1.5s infinite}
.tg-blue{background:var(--grad-text);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
body .co .badge.tg-badge{min-width:270px;padding:18px 22px;border-radius:22px;background:rgba(6,17,31,.78);border:1px solid rgba(169,214,255,.16);text-align:left;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
body .co .badge .tg-off{display:flex;align-items:center;gap:12px;margin:0}
body .co .badge .tg-off b{display:block;font:800 54px/.9 Manrope,Inter,sans-serif;letter-spacing:-.05em;background:linear-gradient(180deg,#fff,#7CC4FF);-webkit-background-clip:text;background-clip:text;color:transparent}
body .co .badge .tg-off span{font:800 22px/1 Manrope,Inter,sans-serif;color:#fff}
body .co .badge .tg-off small{display:block;margin-top:5px;font:500 12.5px Inter,sans-serif;color:#A9BDD3}
body .co .badge .bf-spots{margin-top:14px;padding-top:12px;border-top:1px solid rgba(169,214,255,.14)}
/* steps 01 02 03, the first one lit */
body .steps{margin-top:36px}
body .steps li{padding:14px 18px;border-radius:16px;background:rgba(255,255,255,.03);border-color:rgba(169,214,255,.12)}
body .steps li::before{content:"0" counter(s);width:32px;height:32px;background:none;border:1px solid rgba(169,214,255,.25);color:#6CCBFF;font:800 12px Manrope,Inter,sans-serif}
body .steps li:first-child{border-color:rgba(46,168,255,.45);color:#fff;background:rgba(0,118,255,.08)}
body .steps li:first-child::before{background:var(--grad-btn);border-color:transparent;color:#fff}
/* numbered section labels, as on the landing */
.tg-pk-k{display:flex;align-items:center;gap:12px;margin:76px 0 14px;font:700 12px/1 Inter,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#C9D6EA}
.tg-pk-k span{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:1px solid rgba(201,214,234,.25);font:800 12px Manrope,Inter,sans-serif;letter-spacing:0;color:#6CCBFF}
.tg-pk-k b{padding:5px 10px;border-radius:999px;background:rgba(245,165,36,.16);color:#F5A524;font-weight:700;letter-spacing:.1em}
body .co h2{margin-top:0;font-size:clamp(30px,3.3vw,46px);letter-spacing:-.035em}
/* package cards: the picked one gets the turning amber/blue edge of the landing video */
body .opt{border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015));border:1.5px solid rgba(169,214,255,.16);transition:border-color .25s,box-shadow .4s,transform .4s cubic-bezier(.22,1,.36,1)}
body .opt:hover{border-color:rgba(108,203,255,.45)}
body .opt:has(input:checked){border:1.5px solid transparent;background:linear-gradient(#0B1A2F,#0A1729) padding-box,conic-gradient(from var(--tga),rgba(245,165,36,.95),rgba(0,118,255,.25) 22%,rgba(108,203,255,.95) 50%,rgba(0,118,255,.25) 78%,rgba(245,165,36,.95)) border-box;animation:tgSpin 9s linear infinite;box-shadow:0 50px 100px -50px rgba(0,0,0,1),0 0 80px -40px rgba(245,165,36,.5)}
body .opt:has(input:checked) .lbl::before{border-color:#2EA8FF}
body .opt .lbl{letter-spacing:.04em}
body .opt .p b{background:linear-gradient(180deg,#fff 20%,#9EDBFF);-webkit-background-clip:text;background-clip:text;color:transparent}
body .opt .save{padding:5px 11px;border-radius:999px;background:#0076FF;color:#fff;font:700 12px Inter,sans-serif;letter-spacing:.04em}
body .opt .img{border-radius:14px;box-shadow:0 30px 60px -30px rgba(0,0,0,.9)}
body .opt .chips{gap:8px;margin-top:18px}
body .opt .chips span{display:inline-flex;align-items:center;gap:7px;padding:7px 12px 7px 8px;border-radius:999px;background:rgba(255,255,255,.04);border-color:rgba(201,214,234,.18);font:600 12.5px/1.2 Inter,sans-serif}
body .opt .chips span::before{content:"";flex:none;width:15px;height:15px;border-radius:50%;background:#2E8BFF url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 12.5 4 4 8-9'/%3E%3C/svg%3E") center/10px no-repeat}
/* details + summary */
body .panel{border-radius:24px;border-color:rgba(169,214,255,.16);background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015))}
body .sum{background:radial-gradient(340px 220px at 100% 0%,rgba(0,118,255,.42),transparent 70%),radial-gradient(280px 200px at 0% 100%,rgba(245,165,36,.14),transparent 70%),#0A1222}
body .sum .ln[hidden]{display:none} /* empty "Design" row showed when no design was picked */
body .sum .hero-p{border-radius:16px;background:var(--grad-btn);box-shadow:0 20px 40px -20px rgba(0,118,255,.8)}
body .host label{border-radius:14px}
body .btn{border-radius:999px;background:var(--grad-btn);font-weight:700;box-shadow:0 10px 30px -8px rgba(0,118,255,.65),inset 0 1px 0 rgba(255,255,255,.25);transition:transform .25s,box-shadow .25s}
body .btn:hover{background:var(--grad-btn);transform:translateY(-1px);box-shadow:0 16px 36px -10px rgba(0,118,255,.8),inset 0 1px 0 rgba(255,255,255,.25)}
/* marquee above the footer */
.tg-mq{overflow:hidden;border-top:1px solid rgba(169,214,255,.12);border-bottom:1px solid rgba(169,214,255,.12);background:linear-gradient(90deg,rgba(245,165,36,.16),rgba(0,118,255,.16))}
.tg-mq>div{display:flex;width:max-content;animation:tgMq 40s linear infinite}
.tg-mq span{padding:12px 0;font:700 12.5px/1 Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#FFD08A;white-space:nowrap}
.tg-mq i{padding:12px 22px;font-style:normal;font-size:12px;line-height:1;color:#2E8BFF}
@media(max-width:680px){
  body .hd .wrap{height:60px}
  .tg-secure{padding:7px 12px;font-size:12.5px}
  .tg-give{font-size:11px;margin-bottom:14px}
  body .co .badge.tg-badge{min-width:0;width:100%}
  body .co .badge .tg-off b{font-size:46px}
  .tg-pk-k{margin-top:52px}
  body .co h2{font-size:28px}
}
@media(prefers-reduced-motion:reduce){.tg-l1,.tg-mq>div,body .opt:has(input:checked){animation:none}}
</style>
</head>`);
fs.mkdirSync(path.join(root, 'site/thanksgiving-checkout'), { recursive: true });
fs.writeFileSync(path.join(root, 'site/thanksgiving-checkout/index.html'), h);
console.log('site/thanksgiving-checkout/index.html', (Buffer.byteLength(h) / 1024 | 0) + ' KB');
