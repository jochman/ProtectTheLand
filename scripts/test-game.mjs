import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
after(() => server.close());
const { gameReducer: reduce, INITIAL_STATE } = await server.ssrLoadModule('/src/game/gameReducer.ts');
const { SETTLEMENT_CANDIDATE_IDS: outposts, tileName } = await server.ssrLoadModule('/src/game/hexGridData.ts');
const { incomeFor, availableTroops, RULES, troopSource, totalSettlementSites, isLordOfHostsOperational, lordOfHostsPromise } = await server.ssrLoadModule('/src/game/rules.ts');
const { threatDefense, incomingSupport, dangerStatus } = await server.ssrLoadModule('/src/game/threats.ts');
const start = () => reduce(structuredClone(INITIAL_STATE), { type: 'RESTART_GAME' });
const tick = (state, count = 1) => { for (let i = 0; i < count; i++) state = reduce(state, { type: 'TICK_TIMER' }); return state; };
const built = () => tick(reduce(start(), { type: 'BUILD_SETTLEMENT' }), 7);
const deployed = () => reduce(built(), { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });

test('completed outposts reward expansion and Jerusalem is present in both locales', () => {
  const before = reduce(start(), { type: 'BUILD_SETTLEMENT' });
  const after = tick(before, 4);
  assert.equal(after.settlementsCount, 1);
  assert.equal(after.latestGrant.amount, RULES.settlementGrant);
  assert.equal(after.budget, 4 * RULES.civilianIncome + RULES.settlementGrant);
  assert.equal(tileName(after.tiles['isr-8'], 'he'), 'ירושלים');
  assert.equal(tileName(after.tiles['isr-8'], 'en'), 'Jerusalem');
});

test('automatic pause is idempotent and blocks simulation ticks until resumed', () => {
  let s = tick(start(), 2);
  const elapsed = s.elapsedSeconds;
  s = reduce(s, { type: 'PAUSE_GAME' });
  s = reduce(s, { type: 'PAUSE_GAME' });
  s = tick(s, 5);
  assert.equal(s.elapsedSeconds, elapsed);
  assert.equal(s.isPaused, true);
  s = reduce(s, { type: 'TOGGLE_PAUSE' });
  assert.equal(tick(s).elapsedSeconds, elapsed + 1);
});

test('automatic deployment uses free troops, then spare guards, and records the chosen source', () => {
  let s = built();
  s.soldiersTotal++;
  let next = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0] });
  assert.equal(next.activeBreaches.length, 0);
  assert.equal(next.timeline.at(-1).borderId, 'available');
  assert.equal(next.budget, s.budget - 15);
  s.tiles['bdr-3'].garrisonCount++;
  assert.equal(troopSource(s, outposts[0]), 'bdr-3');
  next = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0] });
  assert.equal(next.tiles['bdr-3'].garrisonCount, 1);
  assert.equal(next.activeBreaches.length, 0);
  assert.equal(next.timeline.at(-1).borderId, 'bdr-3');
  s = built();
  s.threats = [{ id: 'protect', tileId: 'bdr-1', required: 2, deadline: s.elapsedSeconds + 24 }];
  assert.equal(troopSource(s, outposts[0]), 'bdr-2');
  next = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0] });
  assert.deepEqual(next.activeBreaches, ['bdr-2']);
  assert.equal(next.soldiersTotal, 8);
  const before = next.budget;
  next = reduce(next, { type: 'DEPLOY_TROOP', settlementId: outposts[0] });
  assert.equal(next.budget, before, 'double send does not charge or duplicate soldiers');
});

test('automatic reinforcement preserves coverage, excludes its target and rejects unavailable troops', () => {
  let s = built();
  s.threats = [{ id: 'auto', tileId: 'bdr-1', required: 3, deadline: s.elapsedSeconds + 24 }];
  s.soldiersTotal++;
  s.tiles[outposts[0]].garrisonCount = 1;
  assert.equal(troopSource(s, 'bdr-1', true), outposts[0]);
  let next = reduce(s, { type: 'REINFORCE_THREAT', threatId: 'auto' });
  assert.equal(next.activeBreaches.length, 0);
  assert.equal(next.tiles[outposts[0]].garrisonCount, 0);
  assert.equal(next.reinforcements.length, 1);
  assert.equal(next.timeline.at(-1).borderId, outposts[0]);
  assert.equal(availableTroops(next), 0);
  s.soldiersTotal++;
  next = reduce(s, { type: 'REINFORCE_THREAT', threatId: 'auto' });
  assert.equal(next.tiles[outposts[0]].garrisonCount, 1);
  assert.equal(next.timeline.at(-1).borderId, 'available');
  for (const tile of Object.values(s.tiles)) tile.garrisonCount = tile.id === 'bdr-1' ? 1 : 0;
  s.soldiersTotal = 1;
  assert.equal(troopSource(s, 'bdr-1', true), null);
  next = reduce(s, { type: 'REINFORCE_THREAT', threatId: 'auto' });
  assert.equal(next.reinforcements.length, 0);
});

test('danger reflects citizen thresholds, lethal attacks, timely support and terminal states', () => {
  const s = start();
  assert.equal(dangerStatus(s), null);
  s.citizens = 35_000;
  assert.equal(dangerStatus(s), null);
  s.citizens = 34_999;
  assert.deepEqual(dangerStatus(s), { critical: false, advice: 'hold' });
  s.citizens = 20_000;
  assert.equal(dangerStatus(s).critical, false);
  s.citizens = 19_999;
  s.activeBreaches = ['bdr-2'];
  assert.deepEqual(dangerStatus(s), { critical: true, advice: 'seal' });
  s.citizens = 36_000;
  s.threats = [{ id: 'lethal', tileId: 'bdr-1', required: 7, deadline: 24 }];
  assert.deepEqual(dangerStatus(s), { critical: true, advice: 'reinforce' });
  s.reinforcements = [{ id: 'support', threatId: 'lethal', fromX: 0, fromY: 0, departedAt: 0, arrivesAt: 24 }];
  assert.equal(dangerStatus(s), null, 'support arriving at the deadline prevents the lethal warning');
  s.reinforcements[0].arrivesAt = 25;
  assert.equal(dangerStatus(s).critical, true);
  s.threats = [];
  s.citizens = 12_000;
  s.greenSideAttacks = [{ id: 'raid' }];
  assert.deepEqual(dangerStatus(s), { critical: true, advice: 'seal' });
  s.gameStatus = 'catastrophe';
  assert.equal(dangerStatus(s), null);
});

const conquestState = (builtCount, staffedCount = 0) => {
  const s = start();
  s.tutorialStep = 'done';
  s.soldiersTotal = 100;
  outposts.slice(0, builtCount).forEach((id, index) => {
    s.tiles[id].hasSettlement = true;
    s.tiles[id].citizens = RULES.outpostCitizens;
    s.tiles[id].maxCitizens = RULES.outpostCitizens;
    s.tiles[id].garrisonCount = index < staffedCount ? 1 : 0;
  });
  return reduce(s, { type: 'COLLECT_COIN', id: 'missing' });
};

test('Lord of Hosts keeps promising salvation one or a few settlements beyond each moving target', () => {
  assert.equal(start().lordOfHosts.chargePercent, 0);
  assert.equal(lordOfHostsPromise(start()), 'עוד 3 מאחזים ← יהוה יביא ישועה');
  assert.match(lordOfHostsPromise(conquestState(2), 'toast'), /רק עוד מאחז אחד.*יהוה יבוא.*ישועה/);
  let s = conquestState(3);
  assert.equal(s.lordOfHosts.chargePercent, 35);
  assert.equal(lordOfHostsPromise(s), 'עוד 5 מאחזים ← יהוה יביא ישועה');
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  assert.equal(s.lordOfHosts.piousToast, 'רק עוד 5 מאחזים. אז יהוה יבוא ויביא לנו ישועה — הפעם זה יספיק.');
  assert.match(lordOfHostsPromise(conquestState(7), 'toast'), /רק עוד מאחז אחד.*הפעם זה יספיק/);
  s = reduce(conquestState(8), { type: 'SET_LOCALE', locale: 'en' });
  assert.equal(lordOfHostsPromise(s), '9 more outposts → Jehovah brings salvation');
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  assert.equal(s.lordOfHosts.chargePercent, 65);
  assert.equal(s.lordOfHosts.piousToast, 'Just 9 more outposts. Then Jehovah will come and bring us salvation—this time it will be enough.');
  assert.match(lordOfHostsPromise(reduce(conquestState(totalSettlementSites - 1), { type: 'SET_LOCALE', locale: 'en' }), 'toast'), /Just one more outpost.*Jehovah.*salvation/);
  s = reduce(conquestState(totalSettlementSites), { type: 'SET_LOCALE', locale: 'en' });
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  assert.equal(s.lordOfHosts.chargePercent, 96);
  assert.equal(s.lordOfHosts.piousToast, `Just ${totalSettlementSites} more settlements to guard. Then Jehovah will come and bring us salvation—this time it will be enough.`);
  assert.match(lordOfHostsPromise(reduce(conquestState(totalSettlementSites, totalSettlementSites - 1), { type: 'SET_LOCALE', locale: 'en' }), 'toast'), /Just one more settlement to guard.*salvation/);
  s = conquestState(totalSettlementSites, totalSettlementSites);
  assert.equal(isLordOfHostsOperational(s), true);
  assert.equal(lordOfHostsPromise(s), 'הישועה כאן · לחצו לקבלתה!');
  assert.equal(s.lordOfHosts.isPanicMashMode, true);
  assert.equal(s.lordOfHosts.chargePercent, 100);
  assert.equal(s.gameStatus, 'playing');
});

test('five fully operational taps turn completed conquest into catastrophe', () => {
  let s = { ...conquestState(totalSettlementSites, totalSettlementSites), citizens: 100 };
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  assert.equal(s.lordOfHosts.mashCount, 1);
  const elapsed = s.elapsedSeconds;
  s = tick(s, 2);
  assert.equal(s.citizens, 100);
  assert.equal(s.elapsedSeconds, elapsed);
  for (let i = 2; i <= 4; i++) {
    s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
    assert.equal(s.gameStatus, 'playing');
    assert.equal(s.lordOfHosts.mashCount, i);
    assert.equal(s.lordOfHosts.graceSecondsRemaining, 6);
  }
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  assert.equal(s.gameStatus, 'catastrophe');
  assert.equal(s.lordOfHosts.isCracked, true);
  assert.equal(s.lordOfHosts.mashCount, 5);
  assert.equal(s.lordOfHosts.graceSecondsRemaining, 0);
  assert.equal(s.metrics.miracleClicks, 5);
  assert.equal(s.isScreenShaking, false);
  const restarted = reduce(s, { type: 'RESTART_GAME' });
  assert.equal(restarted.lordOfHosts.mashCount, 0);
  assert.equal(restarted.lordOfHosts.isPanicMashMode, false);
});

test('miracle grace expires once, freezes threats too, and later taps cannot renew it', () => {
  let s = conquestState(totalSettlementSites, totalSettlementSites);
  s.nextThreatAt = s.elapsedSeconds + 1;
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  s = tick(s, 8);
  assert.equal(s.threats.length, 0);
  assert.equal(s.lordOfHosts.graceSecondsRemaining, 0);
  s = reduce(s, { type: 'CLICK_LORD_OF_HOSTS' });
  assert.equal(s.lordOfHosts.graceSecondsRemaining, 0);
  s = tick(s);
  assert.equal(s.elapsedSeconds, 1);
  assert.ok(s.threats.length > 0);
});

test('milestone clicks only show promises, while operational readiness latches after activation', () => {
  const idle = reduce(conquestState(8), { type: 'MASH_LORD_OF_HOSTS' });
  assert.equal(idle.lordOfHosts.mashCount, 0);
  assert.equal(idle.lordOfHosts.graceSecondsRemaining, 0);
  let s = reduce(conquestState(totalSettlementSites, totalSettlementSites), { type: 'CLICK_LORD_OF_HOSTS' });
  s.tiles[outposts[0]].garrisonCount = 0;
  s = reduce(s, { type: 'COLLECT_COIN', id: 'missing' });
  assert.equal(s.lordOfHosts.isPanicMashMode, true);
});

test('guided construction, deployment and recall complete the tutorial without ending the game', () => {
  let s = built();
  assert.equal(s.tutorialStep, 'deploy');
  s = reduce(s, { type: 'DEPLOY_TROOPS' });
  assert.equal(s.isDeployMode, true);
  s = reduce(s, { type: 'SELECT_TILE', tileId: outposts[0] });
  const budget = s.budget;
  assert.equal(s.budget, budget);
  s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });
  assert.equal(s.budget, budget - RULES.deployCost);
  assert.equal(s.tutorialStep, 'observe');
  assert.deepEqual(s.activeBreaches, ['bdr-1']);
  assert.equal(s.incomeRate, 4, 'guarding an outpost provides no financial gain');
  assert.equal(s.isDeployMode, false);
  s = reduce(s, { type: 'RECALL_TROOP', tileId: outposts[0] });
  assert.equal(s.gameStatus, 'playing');
  assert.equal(s.tutorialStep, 'done');
  assert.equal(tick(s, 20).gameStatus, 'playing');
  assert.equal(s.timeline.at(-1).kind, 'recall');
});

const completionActions = [
  { type: 'CALL_RESERVES' }, { type: 'SEAL_BREACH', checkpointId: 'bdr-1' },
  { type: 'RECALL_ALL_TROOPS' }, { type: 'RECALL_TROOP', tileId: outposts[0] },
  { type: 'EVACUATE_SETTLEMENT', tileId: outposts[0] },
];

test('tutorial recovers from evacuation and accepts reserve or available-pool staffing', () => {
  let s = reduce(built(), { type: 'EVACUATE_SETTLEMENT', tileId: outposts[0] });
  assert.equal(s.tutorialStep, 'build');
  assert.equal(s.isDeployMode, false);
  s = reduce(built(), { type: 'CALL_RESERVES' });
  assert.equal(s.tutorialStep, 'done');
  assert.equal(s.nextThreatAt, s.elapsedSeconds + 20);
  assert.equal(s.gameStatus, 'playing');
  s = tick(reduce(reduce(start(), { type: 'CALL_RESERVES' }), { type: 'BUILD_SETTLEMENT' }), 9);
  assert.equal(s.tutorialStep, 'deploy');
  s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'available' });
  assert.equal(s.tutorialStep, 'done');
  assert.equal(s.activeBreaches.length, 0);
  assert.equal(s.nextThreatAt, s.elapsedSeconds + 20);
});


for (const action of completionActions) {
  test(`tutorial completion via ${action.type} keeps the game running`, () => {
    const before = deployed();
    const s = reduce(before, action);
    assert.equal(s.gameStatus, 'playing');
    assert.equal(s.tutorialStep, 'done');
    assert.equal(s.peakSettlementsCount, 0);
    assert.equal(s.elapsedSeconds, before.elapsedSeconds);
    assert.equal(s.defenseScore, 100);
    assert.equal(s.incomeRate, incomeFor(s));
    assert.equal(tick(s, 20).gameStatus, 'playing');
  });
}

const expanded = () => {
  let s = reduce(deployed(), { type: 'SEAL_BREACH', checkpointId: 'bdr-1' });
  s = tick(s, 65);
  s = reduce(s, { type: 'BUILD_SETTLEMENT', tileId: outposts[1] });
  s = reduce(s, { type: 'BUILD_SETTLEMENT', tileId: outposts[2] });
  s = tick(s, 5);
  assert.equal(s.peakSettlementsCount, 3);
  assert.equal(s.gameStatus, 'playing');
  s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });
  return reduce(s, { type: 'EVACUATE_SETTLEMENT', tileId: outposts[2] });
};

for (const action of completionActions) {
  test(`${action.type} leaves the expansion campaign running`, () => {
    const s = reduce(expanded(), action);
    assert.equal(s.gameStatus, 'playing');
    assert.equal(s.defenseScore, 100);
    assert.equal(s.incomeRate, incomeFor(s));
  });
}

test('a secured border and repeated first-outpost recalls never end the campaign', () => {
  assert.equal(tick(start(), 130).gameStatus, 'playing');
  let s = reduce(deployed(), { type: 'SEAL_BREACH', checkpointId: 'bdr-1' });
  s = tick(s, 10);
  s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });
  s = reduce(s, { type: 'SEAL_BREACH', checkpointId: 'bdr-1' });
  assert.equal(s.gameStatus, 'playing');
  assert.equal(s.tutorialStep, 'done');
  assert.equal(s.peakSettlementsCount, 1);
  assert.equal(s.elapsedSeconds, 17);
});

test('all reading dialogs freeze gameplay, preserving a manual pause on close', () => {
  for (const patch of [{ isToolkitOpen: true }, { isIntroModalOpen: true }, { isNewsModalOpen: true },
    { selectedSettlementId: outposts[0] }, { selectedInfiltrationId: 'raid' }, { infoPopover: { title: 't', text: 't' } }, { isPaused: true }]) {
    const s = { ...start(), ...patch };
    assert.strictEqual(tick(s, 60), s);
  }
  let s = { ...start(), isPaused: true };
  s = reduce(reduce(s, { type: 'OPEN_TOOLKIT' }), { type: 'CLOSE_TOOLKIT' });
  assert.equal(s.isPaused, true);
});

test('restarts clear progression, preserve preferences and repeat threat outcomes', () => {
  const run = () => tick(deployed(), 100);
  const a = run(), b = run();
  assert.deepEqual(a.tiles, b.tiles);
  assert.deepEqual(a.greenSideAttacks, b.greenSideAttacks);
  assert.deepEqual(a.metrics, b.metrics);
  assert.deepEqual(a.timeline, b.timeline);
  const replay = reduce({ ...a, locale: 'en', reduceMotion: true, soundEnabled: false }, { type: 'RESTART_GAME' });
  assert.equal(replay.tutorialStep, 'build');
  assert.equal(replay.peakSettlementsCount, 0);
  assert.equal(replay.settlementsCount, 0);
  assert.equal(replay.seed, a.seed);
  assert.equal(replay.locale, 'en');
  assert.equal(replay.reduceMotion, true);
  assert.equal(replay.soundEnabled, false);
  assert.equal(replay.elapsedSeconds, 0);
  assert.equal(replay.timeline.length, 0);
});

test('damage report accounts for exposure and real impacts without invented miracle reliance', () => {
  let s = deployed();
  s.greenSideAttacks = [{ id: 'test-raid', breachId: 'bdr-1', targetCityId: 'isr-11', targetCityName: 'City',
    startX: 0, startY: 0, targetX: 1, targetY: 1, progress: 0.99, durationMs: 18000, createdAt: 0 }];
  s = tick(s);
  assert.equal(s.metrics.exposureDamage, 400);
  assert.equal(s.metrics.raidDamage, 12_000);
  assert.equal(s.citizens, 87_600);
  assert.equal(s.metrics.miracleClicks, 0);
  assert.equal(s.timeline.at(-1).kind, 'raid');
  assert.equal(s.defenseScore, 88);
});

test('every unguarded outpost strike kills local and national citizens permanently', () => {
  let s = built();
  const nationalBefore = s.citizens;
  const outpostBefore = s.tiles[outposts[0]].citizens;
  for (let i = 0; i < 300 && s.metrics.clashDamage === 0; i++) s = tick(s);
  assert.equal(s.metrics.clashDamage, RULES.outpostClashDeaths);
  assert.equal(s.citizens, nationalBefore - RULES.outpostClashDeaths);
  assert.equal(s.tiles[outposts[0]].citizens, outpostBefore - RULES.outpostClashDeaths);
  const afterStrike = s.citizens;
  s.tiles[outposts[0]].garrisonCount = 1;
  s = tick(s, 20);
  assert.equal(s.citizens, afterStrike, 'citizens do not regenerate after a strike');
});

test('intervention intercepts through the actual remanned checkpoint and records it', () => {
  let s = deployed();
  s.greenSideAttacks = [{ id: 'test-raid', breachId: 'bdr-1', targetCityId: 'isr-12', targetCityName: 'City',
    startX: 0, startY: 0, targetX: 1, targetY: 1, progress: 0.5, durationMs: 18000, createdAt: 0 }];
  s = reduce(s, { type: 'CALL_RESERVES' });
  assert.equal(s.greenSideAttacks.length, 0);
  assert.equal(s.metrics.intercepted, 1);
  assert.equal(s.timeline.at(-1).intercepted, 1);
});

test('terminal states cannot be changed by gameplay actions', () => {
  const s = { ...start(), gameStatus: 'catastrophe', citizens: 0 };
  assert.strictEqual(tick(s), s);
  assert.strictEqual(reduce(s, { type: 'CALL_RESERVES' }), s);
});

const mobilized = () => {
  let s = { ...start(), budget: 300 };
  for (let i = 0; i < 3; i++) s = reduce(s, { type: 'CALL_RESERVES' });
  return s;
};

test('twenty soldiers can staff two new outposts from the available pool without moving guards', () => {
  let s = mobilized();
  assert.equal(s.soldiersTotal, 20);
  assert.equal(availableTroops(s), 12);
  for (let i = 0; i < 2; i++) {
    s = tick(reduce(s, { type: 'BUILD_SETTLEMENT', tileId: outposts[i] }), 5);
    s = reduce(s, { type: 'SELECT_TILE', tileId: outposts[i] });
    const budget = s.budget;
    s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[i], borderId: 'available' });
    assert.equal(s.budget, budget - RULES.deployCost);
    assert.equal(s.soldiersTotal, 20);
    assert.equal(availableTroops(s), 11 - i);
    assert.equal(s.tiles[outposts[0]].garrisonCount, 1);
    assert.equal(s.tiles[outposts[i]].garrisonCount, 1);
    assert.equal(s.activeBreaches.length, 0);
    assert.equal(s.defenseScore, 100);
    for (const tile of Object.values(s.tiles).filter(t => t.isBorderCheckpoint)) assert.equal(tile.garrisonCount, 1);
    assert.match(s.currentNews.headlineEn, /Available soldier/);
  }
});

test('sealing a gap uses the available pool before recalling an outpost guard or mobilizing', () => {
  let s = tick(reduce(mobilized(), { type: 'BUILD_SETTLEMENT', tileId: outposts[0] }), 5);
  s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });
  assert.equal(availableTroops(s), 12);
  s = reduce(s, { type: 'SEAL_BREACH', checkpointId: 'bdr-1' });
  assert.equal(s.tiles[outposts[0]].garrisonCount, 1);
  assert.equal(s.tiles['bdr-1'].garrisonCount, 1);
  assert.equal(availableTroops(s), 11);
  assert.equal(s.reservesBatchesLeft, 0);
  assert.equal(s.soldiersTotal, 20);
});

test('an empty available pool cannot create soldiers or charge for a failed deployment', () => {
  const before = built();
  const s = reduce(before, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'available' });
  assert.equal(s.budget, before.budget);
  assert.equal(s.soldiersTotal, before.soldiersTotal);
  assert.equal(s.tiles[outposts[0]].garrisonCount, 0);
  assert.equal(s.timeline.length, before.timeline.length);
});

const tactical = (count = 1) => {
  const s = { ...start(), tutorialStep: 'done', soldiersTotal: 20, budget: 300, nextThreatAt: 1 };
  for (const id of outposts.slice(0, count)) s.tiles[id] = { ...s.tiles[id], hasSettlement: true, garrisonCount: 1, citizens: RULES.outpostCitizens };
  return tick(s);
};
const sendSupport = (s, threat = s.threats[0], sourceId = 'available') => reduce(s, { type: 'REINFORCE_THREAT', threatId: threat.id, sourceId });
const accountTroops = s => availableTroops(s) + s.reinforcements.length + Object.values(s.tiles).reduce((sum, t) => sum + t.garrisonCount, 0);

test('tutorial has no tactical threats; completing it schedules a full grace period', () => {
  assert.equal(tick(start(), 120).threats.length, 0);
  const s = reduce(deployed(), { type: 'SEAL_BREACH', checkpointId: 'bdr-1' });
  assert.equal(tick(s, 19).threats.length, 0);
  const active = tick(s, 20);
  assert.equal(active.threats.length, 1);
  assert.equal(active.threats[0].deadline - active.elapsedSeconds, 24);
});

test('guarded outposts still face threats; support is unavailable in transit and returns after interception', () => {
  let s = tactical();
  const threat = s.threats[0];
  const pool = availableTroops(s);
  const budget = s.budget;
  s = sendSupport(s);
  assert.equal(s.budget, budget);
  assert.equal(availableTroops(s), pool - 1);
  assert.equal(threatDefense(s, threat), 1);
  assert.equal(incomingSupport(s, threat.id), 1);
  assert.equal(accountTroops(s), 20);
  assert.equal(threatDefense(tick(s, 3), threat), 1);
  s = tick(s, 4);
  assert.equal(threatDefense(s, threat), 2);
  s = tick(s, threat.deadline - s.elapsedSeconds);
  assert.equal(s.metrics.intercepted, 1);
  assert.equal(s.metrics.threatDamage, 0);
  assert.equal(s.reinforcements.length, 0);
  assert.equal(availableTroops(s), pool);
  assert.equal(accountTroops(s), 20);
});

test('a guard can transfer directly from an outpost or checkpoint with actual consequences at its source', () => {
  for (const border of [false, true]) {
    let s = tactical(2);
    const target = s.threats[0].tileId;
    const source = border ? 'bdr-1' : outposts.slice(0, 2).find(id => id !== target);
    const income = s.incomeRate;
    s = sendSupport(s, s.threats[0], source);
    assert.equal(s.tiles[source].garrisonCount, 0);
    assert.equal(s.reinforcements.length, 1);
    assert.equal(accountTroops(s), 20);
    if (border) {
      assert.deepEqual(s.activeBreaches, ['bdr-1']);
      assert.equal(s.defenseScore, 88);
      assert.equal(tick(s).metrics.exposureDamage, 400);
    } else assert.equal(s.incomeRate, income, 'removing an outpost guard does not affect income');
    s = tick(s, 24);
    assert.equal(s.tiles[source].garrisonCount, 0, 'support returns to pool, not its former post');
    assert.equal(accountTroops(s), 20);
  }
});

test('understaffed battles cause proportional permanent deaths and can end the run', () => {
  let s = tactical();
  const id = s.threats[0].tileId;
  s.tiles[id] = { ...s.tiles[id], citizens: 700 };
  s = tick(s, 24);
  assert.equal(s.tiles[id].citizens, 550);
  assert.equal(s.citizens, 94_000);
  assert.equal(s.metrics.threatDamage, 6_000);
  assert.equal(s.timeline.at(-1).deaths, 6_000);
  assert.equal(tick(s).tiles[id].citizens, 550);
  let doomed = tactical();
  doomed.citizens = 3_000;
  doomed = tick(doomed, 24);
  assert.equal(doomed.gameStatus, 'catastrophe');
  assert.equal(doomed.metrics.threatDamage, 3_000);
  assert.equal(doomed.citizens, 0);
  assert.strictEqual(reduce(doomed, { type: 'REINFORCE_THREAT', threatId: 'expired', sourceId: 'available' }), doomed);
});

test('expansion creates overlapping, distinct, stronger targets including staffed border posts', () => {
  let s = tactical(4);
  assert.equal(s.threats[0].required, 4);
  s = tick(s, 18);
  assert.equal(s.threats.length, 2);
  assert.notEqual(s.threats[0].tileId, s.threats[1].tileId);
  s = tick(s, 18);
  assert.equal(s.threats.length, 2);
  assert.ok(s.threats.some(t => s.tiles[t.tileId].isBorderCheckpoint));
  assert.equal(tactical(8).threats[0].required, 5);
});

test('planning pauses threats and travel; language changes preserve deterministic gameplay', () => {
  let s = sendSupport(tactical(4));
  s = reduce(s, { type: 'SELECT_THREAT', id: s.threats[0].id });
  assert.strictEqual(tick(s, 100), s);
  s = reduce(s, { type: 'SELECT_THREAT', id: null });
  const en = tick(reduce(s, { type: 'SET_LOCALE', locale: 'en' }), 50);
  const he = tick(s, 50);
  assert.deepEqual(en.threats, he.threats);
  assert.deepEqual(en.metrics, he.metrics);
  assert.equal(en.citizens, he.citizens);
});

test('cancelled or destroyed outposts release temporary support without duplicating troops', () => {
  let s = sendSupport(tactical());
  const id = s.threats[0].tileId;
  s = reduce(s, { type: 'EVACUATE_SETTLEMENT', tileId: id });
  assert.equal(s.threats.length, 0);
  assert.equal(s.reinforcements.length, 0);
  assert.equal(availableTroops(s), 12);
  assert.equal(accountTroops(s), 20);
  s = tactical(2);
  const target = s.threats[0].tileId;
  s.tiles[target] = { ...s.tiles[target], citizens: 100 };
  s = sendSupport(s);
  s = tick(s, 24);
  assert.equal(s.tiles[target].hasSettlement, false);
  assert.equal(s.reinforcements.length, 0);
  assert.equal(accountTroops(s), 20);
  s = tick(tactical(4), 18);
  const [first, second] = s.threats;
  s = sendSupport(sendSupport(s, first), second);
  s = reduce(s, { type: 'EVACUATE_SETTLEMENT', tileId: first.tileId });
  s = sendSupport(s, second);
  assert.equal(new Set(s.reinforcements.map(t => t.id)).size, s.reinforcements.length);
  assert.equal(accountTroops(s), 20);
});

test('reject invalid, excessive and late dispatches; arrival exactly at deadline counts', () => {
  let s = tactical();
  for (const source of [s.threats[0].tileId, 'missing', 'isr-1']) {
    assert.equal(sendSupport(s, s.threats[0], source).reinforcements.length, 0);
  }
  s = tick(s, 20);
  s = sendSupport(s);
  assert.equal(sendSupport(s).reinforcements.length, 1);
  assert.equal(tick(s, 4).metrics.intercepted, 1);
  const late = tick(tactical(), 21);
  assert.equal(sendSupport(late).reinforcements.length, 0);
  const empty = tactical();
  empty.soldiersTotal = 9;
  assert.equal(sendSupport(empty).reinforcements.length, 0);
});

test('resolved battles never create a victory ending and restart clears tactical state', () => {
  let s = sendSupport(sendSupport(tactical(3)));
  s = tick(s, 4);
  assert.equal(s.gameStatus, 'playing');
  s = tick(s, 20);
  assert.equal(s.gameStatus, 'playing');
  assert.ok(s.metrics.intercepted >= 1);
  const restarted = reduce(s, { type: 'RESTART_GAME' });
  assert.deepEqual(restarted.threats, []);
  assert.deepEqual(restarted.reinforcements, []);
  assert.equal(restarted.nextThreatAt, null);
  assert.equal(restarted.metrics.threatDamage, 0);
});

test('an idle board collapses while active reinforcement sustains an endless campaign', () => {
  const idle = tick(tactical(4), 180);
  assert.equal(idle.gameStatus, 'catastrophe');
  let active = tactical(4);
  for (let second = 0; second < 180 && active.gameStatus === 'playing'; second++) {
    for (const threat of active.threats) {
      while (threatDefense(active, threat) + incomingSupport(active, threat.id) < threat.required) {
        const next = sendSupport(active, threat);
        assert.ok(next.reinforcements.length > active.reinforcements.length, 'the mobile reserve can meet this scenario');
        active = next;
      }
    }
    active = tick(active);
    assert.equal(accountTroops(active), 20);
  }
  assert.equal(active.gameStatus, 'playing');
  assert.equal(active.citizens, RULES.nationalCitizens);
  assert.equal(active.metrics.threatDamage, 0);
  assert.ok(active.metrics.intercepted >= 3);
  assert.ok(active.threatSequence >= 3);
});

test('full staffed conquest makes the button operational but never ends the war', () => {
  let s = conquestState(totalSettlementSites, totalSettlementSites);
  assert.equal(s.settlementsCount, totalSettlementSites);
  assert.equal(isLordOfHostsOperational(s), true);
  assert.equal(s.lordOfHosts.isPanicMashMode, true);
  assert.equal(s.gameStatus, 'playing');
  s = tick(s, 21);
  assert.equal(s.gameStatus, 'playing');
  assert.ok(s.threats.length > 0, 'tactical threats continue after complete staffed expansion');
});
