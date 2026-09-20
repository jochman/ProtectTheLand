import type { GameState } from '../types';

export const RULES = {
  buildCost: 100, deployCost: 25, civilianIncome: 4, guardedIncome: 2,
  budgetBase: 300, budgetPerOutpost: 25, gapDamage: 0.4,
  raidDamage: 12, raidCost: 10, clashDamage: 10,
  recoveryRate: 0.5, checkpoints: 8,
} as const;

export const simulationNow = (state: GameState) => state.elapsedSeconds * 1000;
export const incomeFor = (state: GameState) => Math.max(1, RULES.civilianIncome - (3 - state.reservesBatchesLeft))
  + Object.values(state.tiles).filter(t => t.hasSettlement && t.garrisonCount > 0).length * RULES.guardedIncome;
export const availableTroops = (state: GameState) => Math.max(0, state.soldiersTotal
  - Object.values(state.tiles).reduce((sum, t) => sum + t.garrisonCount, 0));
export const isGamePaused = (state: GameState) => state.isPaused || state.isIntroModalOpen || state.isToolkitOpen
  || state.isNewsModalOpen || !!state.selectedSettlementId || !!state.selectedInfiltrationId || !!state.infoPopover;

// A separate stream for each event family keeps cosmetic actions out of threat generation.
export function randomStream(seed: number, second: number, channel = 0) {
  let value = (seed ^ Math.imul(second + 1, 2654435761) ^ Math.imul(channel + 1, 1597334677)) >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function objective(state: GameState): string {
  const he = state.locale === 'he';
  if (state.scenarioId === 'defend_first') return he
    ? `שרוד 120 שנ׳ · חוסן 80+ · גבול בטוח 30 שנ׳ (${state.secureSeconds}/30)`
    : `Survive 120s · HP 80+ · secure for 30s (${state.secureSeconds}/30)`;
  if (state.scenarioId === 'recovery') return he
    ? `חוסן 80+ · עד 2 מאחזים · גבול בטוח 15 שנ׳ (${state.secureSeconds}/15)`
    : `HP 80+ · at most 2 outposts · secure for 15s (${state.secureSeconds}/15)`;
  if (state.scenarioId === 'overextension') return he
    ? `עד 2 מאחזים · גבול בטוח 15 שנ׳ (${state.secureSeconds}/15)`
    : `At most 2 outposts · secure for 15s (${state.secureSeconds}/15)`;
  return he ? 'למד את מחיר הפריסה, ואז אבטח את הגבול עם עד 2 מאחזים'
    : 'Experience deployment, then secure the border with at most 2 outposts';
}

export function hasWon(state: GameState): boolean {
  if (state.landHp <= 0 || state.activeBreaches.length || state.greenSideAttacks.length
    || state.defenseScore < 100 || Object.keys(state.constructions).length) return false;
  switch (state.scenarioId) {
    case 'defend_first': return state.elapsedSeconds >= 120 && state.secureSeconds >= 30 && state.landHp >= 80;
    case 'recovery': return state.settlementsCount <= 2 && state.secureSeconds >= 15 && state.landHp >= 80;
    case 'overextension': return state.settlementsCount <= 2 && state.secureSeconds >= 15;
    default: return state.hasExperiencedOverextension && state.settlementsCount <= 2;
  }
}

export function medals(state: GameState) {
  const he = state.locale === 'he';
  const won = state.gameStatus === 'rational_victory';
  return [
    { label: he ? 'חוסן 90 ומעלה' : 'Finish with 90+ HP', earned: won && state.landHp >= 90 },
    { label: he ? 'לכל היותר גיוס אחד' : 'Use at most one reserve call', earned: won && state.metrics.reserveCalls <= 1 },
    { label: state.scenarioId === 'defend_first'
      ? (he ? 'סיים עד 125 שניות' : 'Finish within 125 seconds')
      : (he ? 'התאושש תוך 90 שניות' : 'Recover within 90 seconds'),
      earned: won && state.elapsedSeconds <= (state.scenarioId === 'defend_first' ? 125 : 90) },
  ];
}
