import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const OUT = path.resolve('tilda-dist');
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/I1eanch/nutrition-tilda-assets@main/images';

fs.mkdirSync(OUT, { recursive: true });

let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const astroDir = path.join(DIST, '_astro');
const astroFiles = fs.readdirSync(astroDir);
const findFile = (pattern) => {
  const m = astroFiles.find(f => pattern.test(f));
  if (!m) throw new Error(`No file matching ${pattern} in ${astroDir}`);
  return fs.readFileSync(path.join(astroDir, m), 'utf8');
};
const cssFileName = astroFiles.find(f => f.endsWith('.css'));
const cssLink = new RegExp(`<link rel="stylesheet" href="/_astro/${cssFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`);
const layoutJsName = astroFiles.find(f => f.startsWith('Layout.astro_astro_type_script'));
const insightJsName = astroFiles.find(f => f.startsWith('Insight.astro_astro_type_script'));
const layoutJsScript = new RegExp(`<script type="module" src="/_astro/${layoutJsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"></script>`);
const insightJsScript = new RegExp(`<script type="module" src="/_astro/${insightJsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"></script>`);
const css = fs.readFileSync(path.join(astroDir, cssFileName), 'utf8');
const jsLayout = fs.readFileSync(path.join(astroDir, layoutJsName), 'utf8');
const jsInsight = fs.readFileSync(path.join(astroDir, insightJsName), 'utf8');

const stripImport = (js) =>
  js.replace(/^import\s*\{\s*g\s+as\s+(\w+)\s*,\s*S\s+as\s+(\w+)\s*\}\s*from\s*"[^"]+";?/,
    (_, g, s) => `const ${g}=window.gsap,${s}=window.ScrollTrigger;`);

const jsLayoutFixed = stripImport(jsLayout);
const jsInsightFixed = stripImport(jsInsight);

html = html.replace(/\/_astro\/([^"'\s)]+\.webp)/g, `${CDN_BASE}/$1`);

html = html.replace(cssLink, `<style>${css}</style>`);
html = html.replace(layoutJsScript, `<script>${jsLayoutFixed}</script>`);
html = html.replace(insightJsScript, `<script>${jsInsightFixed}</script>`);

html = html.replace(
  /<link rel="icon"[^>]*href="\/favicon\.svg"[^>]*>/,
  `<link rel="icon" type="image/svg+xml" href="${CDN_BASE.replace('/images','')}/favicon.svg">`
);

const gsapCDN = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>`;
html = html.replace('</head>', `${gsapCDN}\n</head>`);

const iframeBridge = `<style>
  /* GSAP reveal disabled — inside iframe parent handles scroll, so ScrollTrigger would leave content hidden */
  .rv, .stagger-grid > * { opacity: 1 !important; transform: none !important; }
</style>
<script>
(function(){
  if (window.parent === window) return;
  let lastH = 0;
  function report(){
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (h !== lastH) { lastH = h; window.parent.postMessage({ type: 'ssn-iframe-height', height: h }, '*'); }
  }
  window.addEventListener('load', () => { report(); setTimeout(report, 300); });
  new ResizeObserver(report).observe(document.body);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash === '#' || hash.length < 2) return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    window.parent.postMessage({ type: 'ssn-iframe-scroll', y: target.getBoundingClientRect().top + window.scrollY }, '*');
  });
})();
</script>`;
html = html.replace('</body>', `${iframeBridge}\n</body>`);

const headMatch = html.match(/<head>([\s\S]*?)<\/head>/);
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
const headInner = headMatch ? headMatch[1].trim() : '';
const bodyInner = bodyMatch ? bodyMatch[1].trim() : '';

fs.writeFileSync(path.join(OUT, 'full-page.html'), html);

fs.writeFileSync(path.join(OUT, 'tilda-head-code.html'), headInner);

fs.writeFileSync(path.join(OUT, 'tilda-t123-block.html'), bodyInner);

const stats = {
  fullPageKB: Math.round(fs.statSync(path.join(OUT, 'full-page.html')).size / 1024),
  headKB: Math.round(fs.statSync(path.join(OUT, 'tilda-head-code.html')).size / 1024),
  bodyKB: Math.round(fs.statSync(path.join(OUT, 'tilda-t123-block.html')).size / 1024),
};
console.log('Tilda build done:', stats);
