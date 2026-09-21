import { translate } from '../locales/translate';
import type { GameState } from '../types';
import { SETTLEMENT_CANDIDATE_IDS } from './hexGridData';

export const AVAILABLE_TROOP_SOURCE = 'available';

export const RULES = {
  buildCost: 100, deployCost: 15, civilianIncome: 4, guardedIncome: 0,
  budgetBase: 300, budgetPerOutpost: 25, settlementGrant: 40,
  nationalCitizens: 100_000, outpostCitizens: 1_000,
  gapDeaths: 400, raidDeaths: 12_000, raidCost: 10, outpostClashDeaths: 250,
  checkpoints: 8,
  threatGrace: 20, threatInterval: 26, expandedThreatInterval: 18,
  threatWarning: 24, reinforcementTravel: 4, threatDeathsPerMissing: 6_000,
  outpostDeathsPerMissing: 150,
  settlementMilestoneOne: 3, settlementMilestoneTwo: 8,
  miracleTaps: 5, miracleGraceSeconds: 8,
} as const;

export const totalSettlementSites = SETTLEMENT_CANDIDATE_IDS.length;
export const builtSettlementSites = (state: GameState) => SETTLEMENT_CANDIDATE_IDS.filter(id => state.tiles[id]?.hasSettlement);
export const staffedSettlementSites = (state: GameState) => builtSettlementSites(state).filter(id => state.tiles[id].garrisonCount > 0);
export const isLordOfHostsOperational = (state: GameState) => {
  const built = builtSettlementSites(state);
  return built.length === totalSettlementSites && built.every(id => state.tiles[id].garrisonCount > 0);
};

export function lordOfHostsPromise(state: GameState, format: 'button' | 'toast' = 'button'): string {
  const built = builtSettlementSites(state).length;
  const staffed = staffedSettlementSites(state).length;
  if (built === totalSettlementSites) {
    const remaining = totalSettlementSites - staffed;
    if (remaining <= 0) return translate(state.locale, 'lord.promise.ready');
    return translate(state.locale, `lord.promise.guards.${format}.${remaining === 1 ? 'one' : 'many'}`, [remaining]);
  }
  const target = built < RULES.settlementMilestoneOne ? RULES.settlementMilestoneOne
    : built < RULES.settlementMilestoneTwo ? RULES.settlementMilestoneTwo : totalSettlementSites;
  const remaining = target - built;
  return translate(state.locale, `lord.promise.outposts.${format}.${remaining === 1 ? 'one' : 'many'}`, [remaining]);
}

export const simulationNow = (state: GameState) => state.elapsedSeconds * 1000;
export const incomeFor = (state: GameState) => Math.max(1, RULES.civilianIncome - (3 - state.reservesBatchesLeft))
  + Object.values(state.tiles).filter(t => t.hasSettlement && t.garrisonCount > 0).length * RULES.guardedIncome;
export const availableTroops = (state: GameState) => Math.max(0, state.soldiersTotal
  - Object.values(state.tiles).reduce((sum, t) => sum + t.garrisonCount, 0) - state.reinforcements.length);
// Stable priorities keep automatic transfers predictable and preserve coverage where possible.
export function troopSource(state: GameState, targetId: string, reinforcement = false): string | null {
  if (availableTroops(state) > 0) return AVAILABLE_TROOP_SOURCE;
  const threatened = new Set(state.threats.map(t => t.tileId));
  const candidates = Object.values(state.tiles).filter(t => t.id !== targetId && t.garrisonCount > 0
    && (t.isBorderCheckpoint || (reinforcement && t.hasSettlement)));
  const rank = (t: typeof candidates[number]) => (t.garrisonCount > 1 ? 0 : 4)
    + (threatened.has(t.id) ? 2 : 0) + (t.isBorderCheckpoint ? 1 : 0);
  candidates.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
  return candidates[0]?.id ?? null;
}
export const isGamePaused = (state: GameState) => state.isPaused || state.isSystemMenuOpen || state.isIntroModalOpen || state.isToolkitOpen
  || state.isNewsModalOpen || !!state.selectedSettlementId || !!state.selectedInfiltrationId || !!state.selectedThreatId || !!state.infoPopover;

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
  if (state.tutorialStep !== 'done') return translate(state.locale, 'game.rules.38', []);
  return translate(state.locale, 'game.rules.41', [builtSettlementSites(state).length, totalSettlementSites,
    staffedSettlementSites(state).length]);
}
