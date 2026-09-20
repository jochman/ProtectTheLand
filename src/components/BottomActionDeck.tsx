import { translate } from '../locales/translate';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { LordOfHostsButton } from './LordOfHostsButton';
import { RULES, objective, availableTroops } from '../game/rules';

export function BottomActionDeck({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const exposed = Object.values(state.tiles).some(t => t.hasSettlement && t.garrisonCount === 0);
  const hasTroops = availableTroops(state) > 0 || Object.values(state.tiles).some(t => t.isBorderCheckpoint && t.garrisonCount > 0);
  const playing = state.gameStatus === 'playing';
  const construction = Object.values(state.constructions)[0];
  const threat = state.threats[0];
  const reinforce = !!threat && !state.isDeployMode;
  const instruction = state.isDeployMode ? (translate(state.locale, 'components.BottomActionDeck.14', []))
    : state.isBuildMode ? (translate(state.locale, 'components.BottomActionDeck.15', []))
    : state.tutorialStep === 'observe' && state.activeBreaches.length ? (translate(state.locale, 'components.BottomActionDeck.16', []))
    : state.activeBreaches.length ? (translate(state.locale, 'components.BottomActionDeck.17', []))
    : threat ? (translate(state.locale, 'components.BottomActionDeck.18', [state.defenseStreak, RULES.victoryDefenses]))
    : state.tutorialStep === 'build' ? (construction ? translate(state.locale, 'actions.constructing', [construction.progress]) : translate(state.locale, 'components.BottomActionDeck.19'))
    : state.tutorialStep === 'deploy' ? (translate(state.locale, 'components.BottomActionDeck.20', []))
    : objective(state);
  const details = state.tutorialStep === 'observe'
    ? (translate(state.locale, 'components.BottomActionDeck.23', []))
    : objective(state);
  const staffed = Object.values(state.tiles).filter(t => t.hasSettlement && t.garrisonCount > 0).length;
  const progress = translate(state.locale, 'progress.counts', [staffed, RULES.victoryOutposts, RULES.checkpoints - state.activeBreaches.length, RULES.checkpoints, state.defenseStreak, RULES.victoryDefenses]);
  const reset = state.defenseResetReason ? translate(state.locale, `progress.reset.${state.defenseResetReason}`) : null;
  return <div className="action-deck relative z-20 flex shrink-0 flex-col gap-1 px-3 pb-2 pt-1">
    <div className="flex min-h-10 items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2 text-slate-900">
      <button className="min-h-10 min-w-0 flex-1 text-start text-xs font-bold leading-snug" aria-label={state.tutorialStep === 'done' ? `${objective(state)}. ${progress}. ${reset || instruction}` : undefined}
        onClick={() => dispatch({ type: 'SHOW_INFO_POPOVER', title: translate(state.locale, 'components.BottomActionDeck.27', []), text: [details, reset].filter(Boolean).join(' ') })}>
        {state.tutorialStep === 'done' ? <><span data-testid="victory-progress" className="block text-[10px] tabular-nums">{progress}</span><span className="block truncate text-[10px]">{reset && !state.isBuildMode && !state.isDeployMode ? reset : instruction} ⓘ</span></> : <>{instruction} <span className="text-amber-700">ⓘ</span></>}
      </button>
      {(state.isBuildMode || state.isDeployMode) && <button className="min-h-10 px-2 text-xs underline" onClick={() => dispatch({ type: state.isBuildMode ? 'TOGGLE_BUILD_MODE' : 'DEPLOY_TROOPS' })}>{translate(state.locale, 'components.BottomActionDeck.28', [])}</button>}
    </div>
    <div className="grid grid-cols-3 gap-1.5">
      <button className="clay-btn min-h-14 px-1 py-1 text-xs" disabled={!playing || state.reservesBatchesLeft === 0} onClick={() => dispatch({ type: 'CALL_RESERVES' })}>
        <span>{translate(state.locale, 'actions.reserves')}</span><span className="text-[11px]">+4 · {state.reservesBatchesLeft} {translate(state.locale, 'components.BottomActionDeck.32', [])}</span>
      </button>
      <button className={`clay-btn min-h-14 px-1 py-1 text-xs ${state.isDeployMode || reinforce ? 'ring-2 ring-amber-700' : ''}`} disabled={!playing || (!reinforce && !state.isDeployMode && (!exposed || !hasTroops || state.budget < RULES.deployCost))} onClick={() => dispatch(reinforce ? { type: 'SELECT_THREAT', id: threat.id } : { type: 'DEPLOY_TROOPS' })}>
        <span>{translate(state.locale, reinforce ? 'actions.reinforce' : 'actions.deploy')}</span><span className="text-[11px]">{reinforce ? translate(state.locale, 'actions.travel', [RULES.reinforcementTravel]) : `₪${RULES.deployCost} / ${translate(state.locale, 'components.BottomActionDeck.35', [])}`}</span>
      </button>
      <button className={`clay-btn min-h-14 px-1 py-1 text-xs ${state.isBuildMode ? 'ring-2 ring-amber-700' : ''}`} disabled={!playing || (!state.isBuildMode && state.budget < RULES.buildCost)} onClick={() => dispatch({ type: 'TOGGLE_BUILD_MODE' })}>
        <span>{translate(state.locale, 'components.BottomActionDeck.38', [])}</span><span className="text-[11px]">₪{RULES.buildCost}</span>
      </button>
    </div>
    <LordOfHostsButton state={state} dispatch={dispatch} />
  </div>;
}
