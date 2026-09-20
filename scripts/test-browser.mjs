import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 4178, strictPort: true, hmr: false } });
await server.listen();
const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const locale of ['he', 'en']) {
    for (const [width, height] of [[320, 568], [360, 640], [390, 844], [430, 932], [568, 320], [844, 390], [1280, 720]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      page.on('pageerror', error => failures.push(error.message));
      await page.goto('http://127.0.0.1:4178');
      await page.getByRole('button', { name: 'למפה — נלמד תוך כדי משחק' }).click();
      if (locale === 'en') await page.getByTitle('החלף שפה').click();
      const geometry = await page.evaluate(() => {
        const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height }; };
        return { viewport: innerHeight, width: innerWidth, scroll: document.documentElement.scrollHeight,
          map: rect('[data-testid="game-map"]'), deck: rect('.action-deck'), header: rect('header'), goal: rect('.game-goal'), ticker: rect('header + div + div'),
          buttons: [...document.querySelectorAll('.action-deck > .grid button, .action-deck .messianic-btn')].map(b => b.getBoundingClientRect().bottom),
          dir: document.documentElement.dir };
      });
      assert.equal(geometry.dir, locale === 'he' ? 'rtl' : 'ltr');
      assert.equal(geometry.scroll, height, JSON.stringify(geometry));
      assert.ok(geometry.map.height >= 220, JSON.stringify(geometry));
      assert.ok(geometry.deck.bottom <= height + 1, JSON.stringify(geometry));
      assert.ok(geometry.ticker.bottom <= geometry.deck.top, JSON.stringify(geometry));
      if (width > height && height <= 500) assert.ok(geometry.map.bottom <= geometry.goal.top + 1, JSON.stringify(geometry));
      else assert.ok(geometry.goal.bottom <= geometry.map.top + 1, JSON.stringify(geometry));
      assert.equal(geometry.buttons.length, 4);
      assert.ok(geometry.buttons.every(bottom => bottom <= height), JSON.stringify(geometry));
      await page.screenshot({ path: `/tmp/octgame-${locale}-${width}x${height}.png` });
      console.log(`Viewport passed: ${locale} ${width}×${height}`);
      await page.close();
    }
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', error => failures.push(error.message));
  await page.clock.install();
  await page.goto('http://127.0.0.1:4178');
  await page.getByRole('button', { name: 'למפה — נלמד תוך כדי משחק' }).click();
  await page.getByTitle('החלף שפה').click();
  await page.getByRole('button', { name: /Build outpost/ }).click();
  await page.getByRole('button', { name: /Build here/ }).first().click();
  await page.clock.runFor(8000);
  await page.getByRole('button', { name: /Deploy troop/ }).click();
  await page.getByRole('button', { name: /Select outpost/ }).first().click();
  await page.getByRole('button', { name: /Sector 1/ }).click();
  await page.getByRole('button', { name: 'Confirm troop deployment' }).click();
  await page.getByRole('button', { name: 'Seal gap bdr-1' }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /Tutorial complete/ }).waitFor();
  await page.clock.runFor(65000);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByTitle('Strategy desk & accessibility').click();
  assert.equal(await page.getByRole('button', { name: /scenario|Defend first|Overextension|Emergency recovery/i }).count(), 0);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  // Continue the same board into the main expansion/recovery game.
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: /Build outpost/ }).click();
    await page.getByRole('button', { name: /Build here/ }).first().click();
    await page.clock.runFor(5000);
  }
  assert.equal(await page.getByRole('button', { name: /Select outpost/ }).count(), 3);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /Select outpost/ }).last().click();
  await page.getByRole('button', { name: 'Evacuate outpost and return troops' }).click();
  await page.getByRole('dialog').filter({ hasText: 'Security restored after expansion' }).waitFor();
  await page.screenshot({ path: '/tmp/octgame-victory.png' });
  await page.getByRole('button', { name: 'Play again', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /Select outpost/ }).count(), 0);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /Build outpost/ }).click();
  await page.getByRole('button', { name: /Build here/ }).first().click();
  await page.clock.runFor(8000);
  await page.getByRole('button', { name: /Select outpost/ }).first().click();
  await page.getByRole('button', { name: /Sector 1/ }).click();
  await page.getByRole('button', { name: 'Confirm troop deployment' }).click();
  await page.clock.runFor(300000);
  await page.getByRole('dialog').filter({ hasText: 'Resilience reached zero' }).waitFor();
  await page.getByRole('button', { name: 'Play again', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Call reserves/ }).click();
  assert.equal(await page.getByTestId('available-troops').innerText(), '12 free');
  await page.getByRole('button', { name: /Build outpost/ }).click();
  await page.getByRole('button', { name: /Build here/ }).first().click();
  await page.clock.runFor(30000);
  await page.getByRole('button', { name: /Deploy troop/ }).click();
  await page.getByRole('button', { name: /Select outpost/ }).first().click();
  assert.equal(await page.getByRole('button', { name: /Available soldiers: 12/ }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Confirm troop deployment' }).click();
  assert.equal(await page.getByTestId('available-troops').innerText(), '11 free');
  assert.equal(await page.getByRole('button', { name: /Seal gap/ }).count(), 0);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.screenshot({ path: '/tmp/octgame-available-troops.png' });
  const deployedLayout = await page.evaluate(() => ({ height: innerHeight, deckBottom: document.querySelector('.action-deck').getBoundingClientRect().bottom,
    parts: [...document.querySelector('main').children].filter(el => getComputedStyle(el).position !== 'absolute').map(el => ({ name: el.className, height: el.getBoundingClientRect().height })) }));
  assert.ok(deployedLayout.deckBottom <= deployedLayout.height, JSON.stringify(deployedLayout));
  console.log('20-soldier deployment uses available troops, preserves the border and fits the small-phone layout.');
  console.log('Tutorial continues into main play; expansion victory, defeat, restart and removal of scenario controls passed.');
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
  await server.close();
}
