import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
after(() => server.close());
const { gameReducer: reduce, INITIAL_STATE } = await server.ssrLoadModule('/src/game/gameReducer.ts');
const { SETTLEMENT_CANDIDATE_IDS: outposts } = await server.ssrLoadModule('/src/game/hexGridData.ts');
const { incomeFor, medals, availableTroops } = await server.ssrLoadModule('/src/game/rules.ts');
const start = (scenarioId = 'open') => reduce(structuredClone(INITIAL_STATE), { type: 'START_SCENARIO', scenarioId });
const tick = (state, count = 1) => { for (let i = 0; i < count; i++) state = reduce(state, { type: 'TICK_TIMER' }); return state; };
const built = () => tick(reduce(start(), { type: 'BUILD_SETTLEMENT' }), 7);
const deployed = () => reduce(built(), { type: 'DEPLOY_TROOP', settlementId: outposts[0], borderId: 'bdr-1' });

test('guided construction, preview, deployment and recall form a complete winning run', () => {
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
  assert.equal(s.gameStatus, 'rational_victory');
  assert.equal(s.timeline.at(-1).kind, 'recall');
});

for (const action of [{ type: 'CALL_RESERVES' }, { type: 'SEAL_BREACH', checkpointId: 'bdr-1' },
  { type: 'RECALL_ALL_TROOPS' }, { type: 'EVACUATE_SETTLEMENT', tileId: outposts[0] }]) {
  test(`security victory is evaluated after ${action.type}`, () => {
    const s = reduce(deployed(), action);
    assert.equal(s.gameStatus, 'rational_victory');
    assert.equal(s.defenseScore, 100);
    assert.equal(s.incomeRate, incomeFor(s));
  });
}

test('defend first requires responding to all three disruptions, then sustained security', () => {
  let s = start('defend_first');
  for (let second = 1; second <= 120; second++) {
    s = tick(s);
    if ([30, 60, 90].includes(second)) {
      assert.equal(s.activeBreaches.length, 1);
      assert.equal(availableTroops(s), 1);
      s = reduce(s, { type: 'SEAL_BREACH', checkpointId: s.activeBreaches[0] });
    }
    if (second < 120) assert.equal(s.gameStatus, 'playing');
  }
  assert.equal(s.gameStatus, 'rational_victory');
  assert.equal(s.elapsedSeconds, 120);
  assert.equal(s.metrics.reserveCalls, 0);
  assert.equal(s.timeline.filter(e => e.kind === 'disruption').length, 3);
  assert.equal(medals(s).filter(m => m.earned).length, 3);
});

test('recovery requires restored HP, fewer outposts and fifteen secure seconds', () => {
  let s = start('recovery');
  s = reduce(s, { type: 'CALL_RESERVES' });
  s = reduce(s, { type: 'EVACUATE_SETTLEMENT', tileId: outposts[0] });
  assert.equal(s.gameStatus, 'playing');
  s = tick(s, 19);
  assert.equal(s.gameStatus, 'playing');
  s = tick(s);
  assert.equal(s.landHp, 80);
  assert.equal(s.gameStatus, 'rational_victory');
  assert.equal(s.metrics.reserveCalls, 1);
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

test('replays preserve scenario, preferences and threat outcomes', () => {
  const run = () => tick(start('overextension'), 100);
  const a = run(), b = run();
  assert.deepEqual(a.tiles, b.tiles);
  assert.deepEqual(a.greenSideAttacks, b.greenSideAttacks);
  assert.deepEqual(a.metrics, b.metrics);
  assert.deepEqual(a.timeline, b.timeline);
  const replay = reduce({ ...a, locale: 'en', reduceMotion: true, soundEnabled: false }, { type: 'RESTART_GAME' });
  assert.equal(replay.scenarioId, 'overextension');
  assert.equal(replay.seed, a.seed);
  assert.equal(replay.locale, 'en');
  assert.equal(replay.reduceMotion, true);
  assert.equal(replay.soundEnabled, false);
  assert.equal(replay.elapsedSeconds, 0);
  assert.equal(replay.timeline.length, 0);
});

test('damage report accounts for exposure and real impacts without invented miracle reliance', () => {
  let s = start('overextension');
  s.greenSideAttacks = [{ id: 'test-raid', breachId: 'bdr-7', targetCityId: 'isr-11', targetCityName: 'City',
    startX: 0, startY: 0, targetX: 1, targetY: 1, progress: 0.99, durationMs: 18000, createdAt: 0 }];
  s = tick(s);
  assert.equal(s.metrics.exposureDamage, 0.8);
  assert.equal(s.metrics.raidDamage, 12);
  assert.equal(s.landHp, 87.2);
  assert.equal(s.metrics.miracleClicks, 0);
  assert.equal(s.timeline.at(-1).kind, 'raid');
  assert.equal(s.defenseScore, 75);
});

test('intervention intercepts through the actual remanned checkpoint and records it', () => {
  let s = start('overextension');
  s.greenSideAttacks = [{ id: 'test-raid', breachId: 'bdr-8', targetCityId: 'isr-12', targetCityName: 'City',
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
