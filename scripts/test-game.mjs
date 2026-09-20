import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
after(() => server.close());
const { gameReducer: reduce, INITIAL_STATE } = await server.ssrLoadModule('/src/game/gameReducer.ts');
const { SETTLEMENT_CANDIDATE_IDS: outposts } = await server.ssrLoadModule('/src/game/hexGridData.ts');
const { incomeFor, availableTroops } = await server.ssrLoadModule('/src/game/rules.ts');
const start = () => reduce(structuredClone(INITIAL_STATE), { type: 'RESTART_GAME' });
const tick = (state, count = 1) => { for (let i = 0; i < count; i++) state = reduce(state, { type: 'TICK_TIMER' }); return state; };
const built = () => tick(reduce(start(), { type: 'BUILD_SETTLEMENT' }), 7);
const deployed = () => reduce(built(), { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });

test('guided construction, preview, deployment and recall complete the tutorial without ending the game', () => {
  let s = built();
  assert.equal(s.tutorialStep, 'deploy');
  s = reduce(s, { type: 'DEPLOY_TROOPS' });
  assert.equal(s.isDeployMode, true);
  s = reduce(s, { type: 'SELECT_TILE', tileId: outposts[0] });
  const budget = s.budget;
  s = reduce(s, { type: 'PREVIEW_DEPLOYMENT', borderId: 'bdr-1' });
  assert.equal(s.budget, budget);
  s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });
  assert.equal(s.budget, budget - 25);
  assert.equal(s.tutorialStep, 'observe');
  assert.deepEqual(s.activeBreaches, ['bdr-1']);
  assert.equal(s.incomeRate, 6);
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
  test(`main-game victory still works via ${action.type} after expansion and reduction`, () => {
    const s = reduce(expanded(), action);
    assert.equal(s.gameStatus, 'rational_victory');
    assert.equal(s.defenseScore, 100);
    assert.equal(s.incomeRate, incomeFor(s));
  });
}

test('a secured border alone and repeated first-outpost recalls cannot win', () => {
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
  assert.equal(s.metrics.exposureDamage, 0.4);
  assert.equal(s.metrics.raidDamage, 12);
  assert.equal(s.landHp, 87.6);
  assert.equal(s.metrics.miracleClicks, 0);
  assert.equal(s.timeline.at(-1).kind, 'raid');
  assert.equal(s.defenseScore, 88);
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
  const s = { ...start(), gameStatus: 'catastrophe', landHp: 0 };
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
    assert.equal(s.pendingBorderId, 'available');
    const budget = s.budget;
    s = reduce(s, { type: 'DEPLOY_TROOP', settlementId: outposts[i], borderId: 'available' });
    assert.equal(s.budget, budget - 25);
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
