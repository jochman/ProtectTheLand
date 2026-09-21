import assert from 'node:assert/strict';
import { createServer } from 'vite';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 4178, strictPort: true, hmr: false } });
await server.listen();
const { totalSettlementSites } = await server.ssrLoadModule('/src/game/rules.ts');
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
const failures = [];
const viewports = [[320, 568], [360, 640], [390, 844], [430, 932], [568, 320], [844, 390], [1280, 720]];

async function dismissIntro(page) {
  await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'dialog');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
}

async function buildOutpost(page, locale = 'en', wait = 5000) {
  await page.getByRole('button', { name: locale === 'en' ? /Build outpost/ : /בניית מאחז/ }).click();
  await page.clock.runFor(wait);
}

try {
  for (const locale of ['he', 'en']) {
    for (const [width, height] of viewports) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      page.on('pageerror', error => failures.push(error.message));
      await page.goto('http://127.0.0.1:4178');
      await page.getByRole('button', { name: 'למפה — נלמד תוך כדי משחק' }).click();
      if (locale === 'en') await page.getByTitle('החלף שפה').click();
      const geometry = await page.evaluate(() => {
        const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; };
        return { height: innerHeight, scroll: document.documentElement.scrollHeight,
          map: rect('[data-testid="game-map"]'), deck: rect('.action-deck'), goal: rect('.game-goal'), ticker: rect('header + div + div'),
          headerButtons: document.querySelectorAll('header > div:last-of-type > button').length,
          statusButtons: document.querySelectorAll('.status-pill button').length,
          actionButtons: [...document.querySelectorAll('.action-deck > .grid button, .action-deck .messianic-btn')].map(b => b.getBoundingClientRect().bottom),
          dir: document.documentElement.dir };
      });
      assert.equal(geometry.dir, locale === 'he' ? 'rtl' : 'ltr');
      assert.equal(geometry.headerButtons, 3);
      assert.equal(geometry.statusButtons, 5, 'each status counter exposes a compact tooltip');
      assert.equal(geometry.scroll, height, JSON.stringify(geometry));
      assert.ok(geometry.map.height >= 220 && geometry.deck.bottom <= height + 1, JSON.stringify(geometry));
      assert.ok(geometry.ticker.bottom <= geometry.deck.top, JSON.stringify(geometry));
      if (width > height && height <= 500) assert.ok(geometry.map.bottom <= geometry.goal.top + 1, JSON.stringify(geometry));
      else assert.ok(geometry.goal.bottom <= geometry.map.top + 1, JSON.stringify(geometry));
      assert.equal(geometry.actionButtons.length, 4);
      assert.ok(geometry.actionButtons.every(bottom => bottom <= height), JSON.stringify(geometry));
      await page.screenshot({ path: `/tmp/octgame-${locale}-${width}x${height}.png` });
      await page.close();
      console.log(`Viewport passed: ${locale} ${width}×${height}`);
    }
  }

  const infoPage = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
  await infoPage.goto('http://127.0.0.1:4178');
  await dismissIntro(infoPage);
  await infoPage.getByTitle('החלף שפה').click();
  await infoPage.locator('.status-pill button').first().click();
  await infoPage.getByRole('dialog', { name: '🎖️ Military force' }).waitFor();
  await infoPage.screenshot({ path: '/tmp/octgame-status-tooltip.png' });
  await infoPage.keyboard.press('Escape');
  assert.equal(await infoPage.getByRole('dialog').count(), 0);
  await infoPage.getByRole('button', { name: 'Open news center' }).click();
  const newsCenter = infoPage.getByRole('dialog', { name: 'News' });
  await newsCenter.waitFor();
  assert.match(await newsCenter.innerText(), /News center/);
  await infoPage.screenshot({ path: '/tmp/octgame-news-center.png' });
  await infoPage.keyboard.press('Escape');
  assert.equal(await infoPage.getByRole('dialog').count(), 0);
  await infoPage.close();
  console.log('Status tooltips and the news center passed keyboard and small-screen checks.');

  const autoPause = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await autoPause.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
  await autoPause.clock.pauseAt(new Date('2026-09-21T12:00:01Z'));
  await autoPause.goto('http://127.0.0.1:4178');
  await autoPause.getByRole('button', { name: 'למפה — נלמד תוך כדי משחק' }).click();
  await autoPause.clock.runFor(2000);
  const budgetBeforeHide = await autoPause.getByTestId('budget').innerText();
  await autoPause.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await autoPause.clock.runFor(5000);
  assert.equal(await autoPause.getByTestId('budget').innerText(), budgetBeforeHide);
  await autoPause.getByRole('button', { name: /המשחק מושהה/ }).click();
  await autoPause.clock.runFor(1000);
  assert.notEqual(await autoPause.getByTestId('budget').innerText(), budgetBeforeHide);
  assert.equal(await autoPause.getByText('ירושלים', { exact: true }).count(), 1);
  await autoPause.close();

  // The ordinary loop uses direct actions and never opens a contextual dialog.
  for (const locale of ['en', 'he']) {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => failures.push(error.message));
    await page.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-09-21T12:00:01Z'));
    await page.goto('http://127.0.0.1:4178');
    await dismissIntro(page);
    if (locale === 'en') await page.getByTitle('החלף שפה').click();
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.getByRole('button', { name: locale === 'en' ? /Build outpost/ : /בניית מאחז/ }).click();
    assert.equal(await page.getByRole('button', { name: locale === 'en' ? /Build here/ : /בנה כאן/ }).count(), 0);
    await page.clock.runFor(1000);
    assert.match(await page.locator('.action-deck').innerText(), locale === 'en' ? /Construction \d+%/ : /בנייה \d+%/);
    await page.clock.runFor(4000);
    await page.getByRole('button', { name: locale === 'en' ? /Deploy troop/ : /פריסת חייל/ }).click();
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.getByRole('button', { name: locale === 'en' ? /Seal gap/ : /סגור פרצה/ }).click();
    await page.getByRole('button', { name: locale === 'en' ? /Call reserves/ : /גיוס מילואים/ }).click();
    assert.match(await page.getByTestId('conquest-progress').innerText(), new RegExp(`1/${totalSettlementSites}.*1/1.*8/8`));
    await page.clock.runFor(21000);
    const before = await page.getByTestId('available-troops').innerText();
    await page.getByTestId('threat-status').click();
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.notEqual(await page.getByTestId('available-troops').innerText(), before);
    await page.clock.runFor(4000);
    assert.match(await page.getByTestId('threat-status').innerText(), /2\/2/);
    await page.screenshot({ path: `/tmp/octgame-direct-${locale}.png` });
    if (locale === 'en') {
      await page.getByTitle('Game menu').click();
      assert.equal(await page.getByRole('dialog', { name: 'Game menu' }).count(), 1);
      await page.getByRole('button', { name: 'Objective & game guide' }).click();
      assert.equal(await page.getByRole('dialog', { name: 'Strategy desk' }).count(), 1);
      await page.getByRole('button', { name: 'Close', exact: true }).click();
    }
    await page.close();
    console.log(`Direct build, deploy, breach and reinforcement loop passed without contextual menus: ${locale}`);
  }

  // Ignoring one directly-created gap still exercises both danger tiers and defeat.
  const defeat = await browser.newPage({ viewport: { width: 390, height: 844 } });
  defeat.on('pageerror', error => failures.push(error.message));
  await defeat.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
  await defeat.clock.pauseAt(new Date('2026-09-21T12:00:01Z'));
  await defeat.goto('http://127.0.0.1:4178');
  await dismissIntro(defeat);
  await defeat.getByTitle('החלף שפה').click();
  await buildOutpost(defeat);
  await defeat.getByRole('button', { name: /Deploy troop/ }).click();
  let sawWarning = false;
  let sawCritical = false;
  for (let second = 0; second < 300; second++) {
    await defeat.clock.runFor(1000);
    const strip = defeat.getByTestId('danger-strip');
    if (await strip.count()) {
      const critical = await strip.locator('..').getAttribute('data-critical') === 'true';
      sawWarning ||= !critical;
      sawCritical ||= critical;
      if (critical) await defeat.screenshot({ path: '/tmp/octgame-danger-direct.png' });
    }
    if (await defeat.getByRole('dialog').filter({ hasText: 'citizen count reached zero' }).count()) break;
  }
  assert.ok(sawWarning && sawCritical);
  await defeat.getByRole('dialog').filter({ hasText: 'citizen count reached zero' }).waitFor();
  await defeat.close();

  // Full conquest never wins: it only unlocks the satirical five-tap ending.
  for (const locale of ['en', 'he']) {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => failures.push(error.message));
    await page.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-09-21T12:00:01Z'));
    await page.goto('http://127.0.0.1:4178');
    await dismissIntro(page);
    if (locale === 'en') await page.getByTitle('החלף שפה').click();
    const miracle = page.getByTestId('lord-of-hosts');
    const initialFill = await page.getByTestId('miracle-fill').evaluate(el => el.style.width);
    const milestoneMessages = locale === 'en'
      ? {
          three: 'We have promised that this will be enough, but God needs more support',
          eight: 'The land takeover is progressing, but not enough',
          all: 'We conquered all of the land, but the settlements are not guarded enough',
        }
      : {
          three: 'הבטחנו שזה יספיק, אבל אלוהים זקוק לתמיכה נוספת',
          eight: 'ההשתלטות על הארץ מתקדמת, אבל זה לא מספיק',
          all: 'כבשנו את כל הארץ, אבל המאחזים אינם מאובטחים מספיק',
        };
    for (let i = 1; i <= totalSettlementSites; i++) {
      await buildOutpost(page, locale, 20000);
      if (i === 3 || i === 8 || i === totalSettlementSites) {
        await miracle.click();
        const expected = i === 3 ? milestoneMessages.three : i === 8 ? milestoneMessages.eight : milestoneMessages.all;
        await page.getByText(expected, { exact: true }).waitFor();
        await page.clock.runFor(3100);
      }
    }
    assert.equal(await page.getByRole('button', { name: locale === 'en' ? /^Staff / : /^אייש / }).count(), totalSettlementSites);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: locale === 'en' ? /Call reserves/ : /גיוס מילואים/ }).click();
    }
    while (await page.getByRole('button', { name: locale === 'en' ? /^Staff / : /^אייש / }).count()) {
      await page.getByRole('button', { name: locale === 'en' ? /^Staff / : /^אייש / }).first().click();
    }
    assert.ok(parseFloat(await page.getByTestId('miracle-fill').evaluate(el => el.style.width)) > parseFloat(initialFill));
    assert.equal(await miracle.getAttribute('data-ready'), 'true');
    assert.equal(await page.getByRole('dialog').count(), 0, 'full conquest must not open a victory dialog');
    for (let tap = 1; tap <= 4; tap++) {
      if (tap === 2) { await miracle.focus(); await page.keyboard.press('Enter'); } else await miracle.click();
      assert.equal(await miracle.locator('.miracle-tap-steps .is-lit').count(), tap);
    }
    await page.screenshot({ path: `/tmp/octgame-miracle-direct-${locale}.png` });
    await miracle.click();
    await page.getByRole('dialog').waitFor();
    await page.close();
  }

  assert.deepEqual(failures, []);
  console.log('Simplified direct-action campaign, defeat and endless-conquest paths passed.');
} finally {
  await browser.close();
  await server.close();
}
