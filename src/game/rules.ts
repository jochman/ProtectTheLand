import type { GameState } from '../types';

export const AVAILABLE_TROOP_SOURCE = 'available';

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
  if (state.tutorialStep !== 'done') return he
    ? 'למד את הפקדים — המשחק ממשיך אחרי ההדרכה'
    : 'Learn the controls — the game continues after the tutorial';
  return he ? 'התרחב ל־3 מאחזים, ואז צמצם ל־2 ואבטח את הגבול'
    : 'Expand to 3 outposts, then reduce to 2 and secure the border';
}

export function hasWon(state: GameState): boolean {
  return state.tutorialStep === 'done' && state.peakSettlementsCount >= 3
    && state.settlementsCount <= 2 && state.landHp > 0
    && state.activeBreaches.length === 0 && state.greenSideAttacks.length === 0
    && state.defenseScore === 100 && Object.keys(state.constructions).length === 0;
}

export function medals(state: GameState) {
  const he = state.locale === 'he';
  const won = state.gameStatus === 'rational_victory';
  return [
    { label: he ? 'חוסן 90 ומעלה' : 'Finish with 90+ HP', earned: won && state.landHp >= 90 },
    { label: he ? 'לכל היותר גיוס אחד' : 'Use at most one reserve call', earned: won && state.metrics.reserveCalls <= 1 },
  ];
}
