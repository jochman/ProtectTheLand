import { translate } from '../locales/translate';
import type { GameState, TacticalThreat } from '../types';
import { availableTroops, holdsExpandedLine, randomStream, RULES } from './rules';
import { tileName } from './hexGridData';

export const threatDefense = (state: GameState, threat: TacticalThreat) =>
  (state.tiles[threat.tileId]?.garrisonCount ?? 0) + state.reinforcements.filter(
    troop => troop.threatId === threat.id && troop.arrivesAt <= state.elapsedSeconds).length;

export const incomingSupport = (state: GameState, id: string) => state.reinforcements.filter(
  troop => troop.threatId === id && troop.arrivesAt > state.elapsedSeconds).length;

export function reinforceThreat(state: GameState, threatId: string, sourceId: string): GameState {
  const threat = state.threats.find(t => t.id === threatId);
  const source = state.tiles[sourceId];
  const fromPool = sourceId === 'available';
  if (!threat || state.elapsedSeconds + RULES.reinforcementTravel > threat.deadline
    || threatDefense(state, threat) + incomingSupport(state, threatId) >= threat.required
    || (fromPool ? availableTroops(state) <= 0 : !source || source.garrisonCount <= 0
      || (!source.hasSettlement && !source.isBorderCheckpoint) || source.id === threat.tileId)) return state;
  return {
    ...state,
    tiles: fromPool ? state.tiles : { ...state.tiles, [sourceId]: { ...source,
      garrisonCount: source.garrisonCount - 1,
      isBreached: !!source.isBorderCheckpoint && source.garrisonCount === 1,
      hasAlert: !!source.isBorderCheckpoint && source.garrisonCount === 1,
    } },
    reinforcements: [...state.reinforcements, {
      id: `support-${threat.id}-${state.reinforcements.filter(t => t.threatId === threatId).length}`,
      threatId, fromX: fromPool ? 65 : source.x, fromY: fromPool ? 530 : source.y,
      departedAt: state.elapsedSeconds, arrivesAt: state.elapsedSeconds + RULES.reinforcementTravel,
    }],
  };
}

// Temporary troops are accounted for separately from permanent guards. Removing an
// incident releases its support to the pool, including troops still travelling.
export function pruneThreats(state: GameState): GameState {
  const threats = state.threats.filter(t => state.tiles[t.tileId]?.hasSettlement || state.tiles[t.tileId]?.isBorderCheckpoint);
  const ids = new Set(threats.map(t => t.id));
  return { ...state, threats, reinforcements: state.reinforcements.filter(t => ids.has(t.threatId)),
    selectedThreatId: state.selectedThreatId && ids.has(state.selectedThreatId) ? state.selectedThreatId : null };
}

export function tickThreats(input: GameState): GameState {
  if (input.tutorialStep !== 'done' || input.gameStatus !== 'playing') return input;
  let state = pruneThreats(input);
  if (!holdsExpandedLine(state)) state = { ...state, defenseStreak: 0 };
  for (const threat of state.threats.filter(t => t.deadline <= state.elapsedSeconds)) {
    const missing = Math.max(0, threat.required - threatDefense(state, threat));
    const damage = Math.min(state.landHp, missing * RULES.threatDamagePerMissing);
    const tile = state.tiles[threat.tileId];
    const hp = Math.max(0, (tile.hp ?? 100) - missing * RULES.outpostDamagePerMissing);
    const destroyed = tile.hasSettlement && hp === 0;
    const textHe = missing ? `${tileName(tile, 'he')}: חסרו ${missing} חיילים. נזק לחוסן: ${damage}. התגבור חזר לכוח הזמין.`
      : `${tileName(tile, 'he')}: האיום נבלם! התגבור חזר לכוח הזמין.`;
    const textEn = missing ? `${tileName(tile, 'en')}: ${missing} troops short. −${damage} HP. Support returned to the available pool.`
      : `${tileName(tile, 'en')}: attack repelled! Support returned to the available pool.`;
    state = { ...state,
      defenseStreak: missing === 0 && holdsExpandedLine(state)
        ? Math.min(RULES.victoryDefenses, state.defenseStreak + 1) : 0,
      landHp: Number((state.landHp - damage).toFixed(1)),
      budget: Math.max(0, state.budget - missing * 4),
      tiles: { ...state.tiles, [tile.id]: tile.hasSettlement ? { ...tile, hp,
        hasSettlement: !destroyed, garrisonCount: destroyed ? 0 : tile.garrisonCount,
      } : tile },
      threats: state.threats.filter(t => t.id !== threat.id),
      reinforcements: state.reinforcements.filter(t => t.threatId !== threat.id),
      metrics: { ...state.metrics, threatDamage: state.metrics.threatDamage + damage,
        intercepted: state.metrics.intercepted + (missing === 0 ? 1 : 0) },
      timeline: [...state.timeline, { second: state.elapsedSeconds, kind: 'threat',
        gaps: state.activeBreaches.length, hp: Number((state.landHp - damage).toFixed(1)), damage,
        intercepted: missing === 0 ? 1 : 0 }],
      threatFeedback: { textHe, textEn, until: state.elapsedSeconds + 8 },
    };
    if (destroyed) state.threatFeedback = {
      textHe: `${tileName(tile, 'he')}: המאחז אבד. הכוחות חזרו לכוח הזמין. נזק לחוסן: ${damage}.`,
      textEn: `${tileName(tile, 'en')}: outpost lost. Troops returned to the pool. −${damage} HP.`,
      until: state.elapsedSeconds + 8,
    };
    const feedback = state.threatFeedback!;
    const news = { id: `result-${threat.id}`, headline: state.locale === 'he' ? feedback.textHe : feedback.textEn,
      headlineHe: feedback.textHe, headlineEn: feedback.textEn,
      source: translate(state.locale, 'game.threats.83', []), sourceHe: 'דיווח מהשטח', sourceEn: 'Field report',
      category: 'military' as const };
    state = { ...state, currentNews: news, newsHistory: [news, ...state.newsHistory].slice(0, 30) };
  }
  if (state.landHp <= 0) return { ...state, gameStatus: 'catastrophe', selectedThreatId: null, isScreenShaking: false };
  // Once the objective is met, let overlapping battles finish before ending the run.
  if (state.defenseStreak >= RULES.victoryDefenses && holdsExpandedLine(state)) return state;
  const count = Object.values(state.tiles).filter(t => t.hasSettlement).length;
  const nextThreatAt = state.nextThreatAt ?? state.elapsedSeconds + RULES.threatGrace;
  state = { ...state, nextThreatAt };
  if (state.elapsedSeconds < nextThreatAt || state.threats.length >= (count >= 4 ? 2 : 1)) return state;
  const sequence = state.threatSequence + 1;
  const borderTarget = sequence % 3 === 0 || count === 0;
  const candidates = Object.values(state.tiles).filter(t => (borderTarget ? t.isBorderCheckpoint : t.hasSettlement)
    && !state.threats.some(threat => threat.tileId === t.id));
  if (!candidates.length) return state;
  const random = randomStream(state.seed, sequence, 8);
  const target = candidates[Math.floor(random() * candidates.length)];
  const required = count >= 8 ? 5 : count >= 4 ? 4 : count >= 2 ? 3 : 2;
  return { ...state, threatSequence: sequence,
    nextThreatAt: state.elapsedSeconds + (count >= 4 ? RULES.expandedThreatInterval : RULES.threatInterval),
    threats: [...state.threats, { id: `threat-${sequence}`, tileId: target.id, required,
      deadline: state.elapsedSeconds + RULES.threatWarning }],
  };
}
