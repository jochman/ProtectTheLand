import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 4178, strictPort: true, hmr: false } });
await server.listen();
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
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
  // New controls must remain usable with keyboard, touch and either locale.
  for (const locale of ['en', 'he']) {
    const check = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
    check.on('pageerror', error => failures.push(error.message));
    await check.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
    await check.clock.pauseAt(new Date('2026-09-21T12:00:01Z'));
    await check.goto('http://127.0.0.1:4178');
    await check.waitForFunction(() => document.activeElement?.getAttribute('role') === 'dialog');
    await check.keyboard.press('Escape');
    await check.getByRole('dialog').waitFor({ state: 'detached' });
    if (locale === 'en') await check.getByTitle('החלף שפה').click();
    const stats = check.locator('.status-pill button').first();
    await stats.click();
    const help = check.getByRole('dialog');
    const helpText = await help.innerText();
    await check.clock.runFor(10000);
    assert.equal(await help.innerText(), helpText, 'help stays open until dismissed');
    await check.keyboard.press('Tab');
    assert.equal(await help.evaluate(el => el.contains(document.activeElement)), true);
    await check.screenshot({ path: `/tmp/octgame-help-${locale}.png` });
    await check.keyboard.press('Escape');
    assert.equal(await stats.evaluate(el => el === document.activeElement), true);
    await check.getByRole('button', { name: locale === 'en' ? /Build outpost/ : /בניית מאחז/ }).click();
    assert.equal(await check.locator('.map-locations').count(), 0);
    await check.getByRole('button', { name: locale === 'en' ? /Build here/ : /בנה כאן/ }).first().click();
    await check.clock.runFor(1000);
    assert.match(await check.locator('.action-deck').innerText(), locale === 'en' ? /Construction \d+%/ : /בנייה בתהליך \d+%/);
    await check.clock.runFor(7000);
    await check.getByRole('button', { name: locale === 'en' ? /Call reserves/ : /גיוס מילואים/ }).click();
    assert.match(await check.getByTestId('victory-progress').innerText(), /1\/3.*8\/8.*0\/3/);
    await check.clock.runFor(21000);
    await check.getByTestId('threat-status').click();
    assert.equal(await check.getByRole('dialog').locator('details').count(), 0);
    const send = check.getByRole('dialog').getByRole('button', { name: locale === 'en' ? /Send reinforcement/ : /שלח תגבור/ });
    await send.focus();
    await check.keyboard.press('Enter');
    assert.match(await check.getByTestId('threat-strength').innerText(), /1\/2.*1/);
    await check.keyboard.press('Escape');
    assert.equal(await check.getByTestId('threat-status').evaluate(el => el === document.activeElement), true);
    await check.close();
    console.log(`Recovery, construction feedback, direct map targets, persistent help and reinforcement keyboard input passed: ${locale}`);
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', error => failures.push(error.message));
  await page.clock.install({ time: new Date('2026-09-20T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-09-20T12:00:01Z'));
  await page.goto('http://127.0.0.1:4178');
  await page.getByRole('button', { name: 'למפה — נלמד תוך כדי משחק' }).click();
  await page.getByTitle('החלף שפה').click();
  await page.getByRole('button', { name: /Build outpost/ }).click();
  await page.getByRole('button', { name: /Build here/ }).first().click();
  await page.clock.runFor(8000);
  await page.getByRole('button', { name: /Deploy troop/ }).click();
  await page.getByRole('button', { name: /Select outpost/ }).first().click();
  await page.getByRole('button', { name: /Send troop/ }).click();
  await page.getByRole('button', { name: 'Seal gap bdr-1' }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /Staff 3\+ outposts/ }).waitFor();
  await page.clock.runFor(65000);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByTitle('Strategy desk & accessibility').click();
  assert.equal(await page.getByRole('button', { name: /scenario|Defend first|Overextension|Emergency recovery/i }).count(), 0);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  // Expansion and evacuation alone must not end the campaign.
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: /Build outpost/ }).click();
    await page.getByRole('button', { name: /Build here/ }).first().click();
    await page.clock.runFor(5000);
  }
  assert.equal(await page.getByRole('button', { name: /Select outpost/ }).count(), 3);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /Select outpost/ }).last().click();
  await page.getByRole('button', { name: 'Evacuate outpost and return troops' }).click();
  if (await page.getByTestId('threat-status').count()) await page.clock.runFor(24000);
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.getByRole('button', { name: /Select outpost/ }).count(), 2);
  await page.getByRole('button', { name: /Build outpost/ }).click();
  await page.getByRole('button', { name: /Build here/ }).first().click();
  await page.clock.runFor(5000);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Call reserves/ }).click();
  const victory = page.getByRole('dialog').filter({ hasText: 'You held at least three outposts' });
  for (let second = 0; second < 120 && !(await victory.count()); second++) {
    if (await page.getByTestId('threat-status').count()) {
      await page.getByTestId('threat-status').click();
      const send = page.getByRole('button', { name: /Send reinforcement/ });
      while (await send.count()) {
        assert.equal(await send.isDisabled(), false);
        await send.click();
      }
      await page.getByRole('button', { name: 'Return to map' }).click();
    }
    await page.clock.runFor(1000);
  }
  await victory.waitFor();
  assert.match(await victory.innerText(), /Attacks repelled 3\/3/);
  assert.equal(await page.getByRole('button', { name: /Select outpost/ }).count(), 3);
  await page.screenshot({ path: '/tmp/octgame-victory.png' });
  await page.getByRole('button', { name: 'Play again', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /Select outpost/ }).count(), 0);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /Build outpost/ }).click();
  await page.getByRole('button', { name: /Build here/ }).first().click();
  await page.clock.runFor(8000);
  await page.getByRole('button', { name: /Select outpost/ }).first().click();
  await page.getByRole('button', { name: /Send troop/ }).click();
  // Let a real exposed border deteriorate and inspect both warning tiers.
  let sawWarning = false;
  let sawCritical = false;
  for (let second = 0; second < 300; second++) {
    await page.clock.runFor(1000);
    const strip = page.getByTestId('danger-strip');
    if (await strip.count()) {
      const critical = await strip.locator('..').getAttribute('data-critical') === 'true';
      if ((!critical && !sawWarning) || (critical && !sawCritical)) {
        for (const locale of ['en', 'he']) {
          if (locale === 'he') await page.getByTitle('Toggle Language').click();
          for (const [width, height] of [[320, 568], [360, 640], [390, 844], [430, 932], [568, 320], [844, 390], [1280, 720]]) {
            await page.setViewportSize({ width, height });
            const geometry = await strip.evaluate(el => {
              const rect = el.getBoundingClientRect();
              const map = document.querySelector('[data-testid="game-map"]').getBoundingClientRect();
              return { height: innerHeight, scroll: document.documentElement.scrollHeight, map: map.height,
                bottom: document.querySelector('.action-deck').getBoundingClientRect().bottom,
                fits: el.scrollWidth <= el.clientWidth, top: rect.top, stripBottom: rect.bottom };
            });
            assert.equal(geometry.scroll, height, JSON.stringify(geometry));
            assert.ok(geometry.map >= 220 && geometry.bottom <= height + 1 && geometry.fits, JSON.stringify(geometry));
            assert.equal(await page.getByRole('dialog').count(), 0);
            if (width === 320 || width === 568) await page.screenshot({ path: `/tmp/octgame-danger-${critical}-${locale}-${width}.png` });
          }
        }
        await page.getByTitle('החלף שפה').click();
        await page.setViewportSize({ width: 390, height: 844 });
      }
      sawWarning ||= !critical;
      sawCritical ||= critical;
    }
    if (await page.getByRole('dialog').filter({ hasText: 'Resilience reached zero' }).count()) break;
  }
  assert.ok(sawWarning && sawCritical, 'both danger tiers appear before defeat');
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
  assert.equal(await page.getByRole('button', { name: /Available soldiers:|Sector / }).count(), 0);
  assert.match(await page.getByRole('dialog').innerText(), /posts stay guarded/);
  await page.getByRole('button', { name: /Send troop/ }).click();
  assert.equal(await page.getByTestId('available-troops').innerText(), '11 free');
  assert.equal(await page.getByRole('button', { name: /Seal gap/ }).count(), 0);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.screenshot({ path: '/tmp/octgame-available-troops.png' });
  const deployedLayout = await page.evaluate(() => ({ height: innerHeight, deckBottom: document.querySelector('.action-deck').getBoundingClientRect().bottom,
    parts: [...document.querySelector('main').children].filter(el => getComputedStyle(el).position !== 'absolute').map(el => ({ name: el.className, height: el.getBoundingClientRect().height })) }));
  assert.ok(deployedLayout.deckBottom <= deployedLayout.height, JSON.stringify(deployedLayout));
  console.log('20-soldier deployment uses available troops, preserves the border and fits the small-phone layout.');
  await page.clock.runFor(21000);
  await page.getByTestId('threat-status').waitFor();
  for (const locale of ['en', 'he']) {
    if (locale === 'he') await page.getByTitle('Toggle Language').click();
    for (const [width, height] of [[320, 568], [360, 640], [390, 844], [430, 932], [568, 320], [844, 390], [1280, 720]]) {
      await page.setViewportSize({ width, height });
      const geometry = await page.evaluate(() => ({ height: innerHeight, scroll: document.documentElement.scrollHeight,
        mapHeight: document.querySelector('[data-testid="game-map"]').getBoundingClientRect().height,
        deckBottom: document.querySelector('.action-deck').getBoundingClientRect().bottom,
        goalBottom: document.querySelector('.game-goal').getBoundingClientRect().bottom }));
      assert.equal(geometry.scroll, height, JSON.stringify(geometry));
      assert.ok(geometry.mapHeight >= 220, JSON.stringify(geometry));
      assert.ok(geometry.deckBottom <= height + 1, JSON.stringify(geometry));
      assert.ok(geometry.goalBottom <= height + 1, JSON.stringify(geometry));
      await page.screenshot({ path: `/tmp/octgame-threat-${locale}-${width}x${height}.png` });
    }
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByTestId('threat-status').click();
  await page.getByRole('dialog', { name: 'שליחת תגבור' }).waitFor();
  await page.screenshot({ path: '/tmp/octgame-threat-command-he.png' });
  const beforePause = await page.getByTestId('threat-strength').innerText();
  await page.clock.runFor(10000);
  assert.equal(await page.getByTestId('threat-strength').innerText(), beforePause);
  await page.getByRole('dialog').getByRole('button', { name: /שלח תגבור/ }).click();
  assert.match(await page.getByTestId('threat-strength').innerText(), /1\/2.*1 בדרך/);
  await page.getByRole('button', { name: 'חזור למפה' }).click();
  assert.equal(await page.getByTestId('available-troops').innerText(), '10 זמינים');
  await page.getByTitle('החלף שפה').click();
  await page.clock.runFor(4000);
  assert.match(await page.getByTestId('threat-status').innerText(), /2\/2/);
  await page.locator('svg').getByRole('button', { name: /^Reinforce / }).click();
  await page.screenshot({ path: '/tmp/octgame-threat-command-en.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.clock.runFor(20000);
  assert.equal(await page.getByTestId('available-troops').innerText(), '11 free');
  assert.match(await page.locator('.game-goal').innerText(), /attack repelled/);
  await page.clock.runFor(2000);
  await page.getByTestId('threat-status').click();
  await page.getByRole('button', { name: /Send reinforcement/ }).click();
  await page.getByRole('button', { name: 'Return to map' }).click();
  assert.equal(await page.getByTestId('available-troops').innerText(), '10 free');
  assert.equal(await page.getByRole('button', { name: /Seal gap/ }).count(), 0);
  await page.clock.runFor(24000);
  assert.equal(await page.getByTestId('available-troops').innerText(), '11 free');
  console.log('Threats: both locales and all viewports; planning pause, automatic dispatch, travel, interception and return to pool passed.');
  console.log('Tutorial continues; dismantling does not win; three defended attacks with three outposts win; defeat and restart passed.');
  // Reach the miracle through real controls: build first, then divert six guards.
  for (const locale of ['en', 'he']) {
    const miracle = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
    miracle.on('pageerror', error => failures.push(error.message));
    await miracle.clock.install({ time: new Date('2026-09-21T12:00:00Z') });
    await miracle.clock.pauseAt(new Date('2026-09-21T12:00:01Z'));
    await miracle.goto('http://127.0.0.1:4178');
    await miracle.getByRole('button', { name: 'למפה — נלמד תוך כדי משחק' }).click();
    await miracle.getByTitle('החלף שפה').click();
    const button = miracle.getByTestId('lord-of-hosts');
    assert.doesNotMatch(await button.innerText(), /%|25|defense/i);
    const initialFill = await miracle.getByTestId('miracle-fill').evaluate(el => el.style.width);
    for (let i = 0; i < 6; i++) {
      await miracle.getByRole('button', { name: /Build outpost/ }).click();
      await miracle.getByRole('button', { name: /Build here/ }).first().click();
      await miracle.clock.runFor(35000);
    }
    await miracle.clock.runFor(40000);
    assert.equal(await miracle.getByRole('button', { name: /Select outpost/ }).count(), 6);
    assert.ok(parseFloat(await miracle.getByTestId('miracle-fill').evaluate(el => el.style.width)) > parseFloat(initialFill));
    for (let i = 0; i < 6; i++) {
      await miracle.getByRole('button', { name: /Select outpost/ }).nth(i).click();
      await miracle.getByRole('button', { name: /Send troop/ }).click();
      assert.equal(await button.getAttribute('data-ready'), i === 5 ? 'true' : 'false');
    }
    if (locale === 'he') await miracle.getByTitle('Toggle Language').click();
    assert.equal(await miracle.getByTestId('miracle-fill').evaluate(el => el.style.width), '100%');
    assert.match(await button.innerText(), locale === 'he' ? /מוכן/ : /Ready/);
    assert.doesNotMatch(await button.innerText(), /%/);
    await miracle.screenshot({ path: `/tmp/octgame-miracle-ready-${locale}.png` });
    let previous = await button.innerText();
    for (let tap = 1; tap <= 4; tap++) {
      if (tap === 2) { await button.focus(); await miracle.keyboard.press('Enter'); }
      else await button.click();
      assert.notEqual(await button.innerText(), previous);
      previous = await button.innerText();
      assert.equal(await button.locator('.miracle-tap-steps .is-lit').count(), tap);
      await miracle.clock.runFor(1000);
      assert.equal(await miracle.getByRole('dialog').count(), 0);
    }
    const geometry = await miracle.evaluate(() => ({ scroll: document.documentElement.scrollHeight, height: innerHeight,
      bottom: document.querySelector('.action-deck').getBoundingClientRect().bottom,
      parts: [...document.querySelector('main').children].map(el => ({ name: el.className, height: el.getBoundingClientRect().height })) }));
    await miracle.screenshot({ path: `/tmp/octgame-miracle-tapping-${locale}.png` });
    assert.equal(geometry.scroll, geometry.height);
    assert.ok(geometry.bottom <= geometry.height + 1, JSON.stringify(geometry));
    await button.click();
    await miracle.getByRole('dialog').waitFor();
    assert.equal(await button.isDisabled(), true);
    assert.match(await button.innerText(), locale === 'he' ? /אין סומכין/ : /Miracles don't defend borders/);
    await miracle.close();
    console.log(`Miracle ${locale}: real expansion, horizontal fill, ready state, five taps, keyboard input and small-phone layout passed.`);
  }
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
  await server.close();
}
