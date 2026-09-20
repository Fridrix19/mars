// node shot.js <html> <outprefix> [hash] — скриншоты 1400 и 390 + консольные ошибки
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [,, file, out, hash] = process.argv;
  const body = fs.readFileSync(file, 'utf8');
  const wrapped = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>' + body + '</body></html>';
  const tmp = path.join(require('os').tmpdir(), '_shot.html'); fs.writeFileSync(tmp, wrapped);
  const browser = await chromium.launch();
  for (const [w, h, tag] of [[1400, 900, 'd'], [390, 844, 'm']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('file://' + tmp + (hash ? '#' + hash : '')); await page.waitForTimeout(900);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.screenshot({ path: `${out}-${tag}.png`, fullPage: true });
    console.log(tag, 'scrollWidth', sw, 'errors', errs.length ? errs : 'none');
    await ctx.close();
  }
  await browser.close();
})();
