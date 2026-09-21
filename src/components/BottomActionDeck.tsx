import { translate } from '../locales/translate';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { LordOfHostsButton } from './LordOfHostsButton';
import { RULES, objective, availableTroops } from '../game/rules';
import { incomingSupport, threatDefense } from '../game/threats';

export function BottomActionDeck({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const exposed = Object.values(state.tiles).some(t => t.hasSettlement && t.garrisonCount === 0);
  const exposedOutpost = Object.values(state.tiles).find(t => t.hasSettlement && t.garrisonCount === 0);
  const hasTroops = availableTroops(state) > 0 || Object.values(state.tiles).some(t => t.isBorderCheckpoint && t.garrisonCount > 0);
  const playing = state.gameStatus === 'playing';
  const construction = Object.values(state.constructions)[0];
  const threat = state.threats.find(item => threatDefense(state, item) + incomingSupport(state, item.id) < item.required);
  const canReinforce = !!threat && state.elapsedSeconds + RULES.reinforcementTravel <= threat.deadline;
  const instruction = state.tutorialStep === 'observe' && state.activeBreaches.length ? (translate(state.locale, 'components.BottomActionDeck.16', []))
    : state.activeBreaches.length ? (translate(state.locale, 'components.BottomActionDeck.17', []))
    : threat ? (translate(state.locale, 'components.BottomActionDeck.directThreat', [state.defenseStreak, RULES.victoryDefenses]))
    : state.tutorialStep === 'build' ? (construction ? translate(state.locale, 'actions.constructing', [Math.min(state.settlementsCount + 1, RULES.victoryOutposts), RULES.victoryOutposts, construction.progress]) : translate(state.locale, 'components.BottomActionDeck.19'))
    : state.tutorialStep === 'deploy' ? (translate(state.locale, 'components.BottomActionDeck.directDeploy', []))
    : objective(state);
  const staffed = Object.values(state.tiles).filter(t => t.hasSettlement && t.garrisonCount > 0).length;
  const progress = translate(state.locale, 'progress.counts', [staffed, RULES.victoryOutposts, RULES.checkpoints - state.activeBreaches.length, RULES.checkpoints, state.defenseStreak, RULES.victoryDefenses]);
  const reset = state.defenseResetReason ? translate(state.locale, `progress.reset.${state.defenseResetReason}`) : null;
  return <div className="action-deck relative z-20 flex shrink-0 flex-col gap-1 px-3 pb-2 pt-1">
    <div role="status" className="flex min-h-10 items-center rounded-xl border border-amber-300 bg-amber-50 px-2 text-start text-xs font-bold leading-snug text-slate-900">
      <div className="min-w-0 flex-1">
        {state.tutorialStep === 'done' ? <><span data-testid="victory-progress" className="block text-[10px] tabular-nums">{progress}</span><span className="block truncate text-[10px]">{reset || instruction}</span></> : instruction}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1.5">
      <button className="clay-btn min-h-14 px-1 py-1 text-xs" disabled={!playing || state.reservesBatchesLeft === 0} onClick={() => dispatch({ type: 'CALL_RESERVES' })}>
        <span>{translate(state.locale, 'actions.reserves')}</span><span className="text-[11px]">+4 · {state.reservesBatchesLeft} {translate(state.locale, 'components.BottomActionDeck.32', [])}</span>
      </button>
      <button className={`clay-btn min-h-14 px-1 py-1 text-xs ${canReinforce ? 'ring-2 ring-amber-700' : ''}`} disabled={!playing || (threat ? !canReinforce : (!exposed || !exposedOutpost || !hasTroops || state.budget < RULES.deployCost))} onClick={() => dispatch(threat && canReinforce ? { type: 'REINFORCE_THREAT', threatId: threat.id } : { type: 'DEPLOY_TROOP', settlementId: exposedOutpost?.id || '' })}>
        <span>{translate(state.locale, threat ? 'actions.reinforce' : 'actions.deploy')}</span><span className="text-[11px]">{threat ? translate(state.locale, 'actions.oneTap', [RULES.reinforcementTravel]) : `₪${RULES.deployCost} / ${translate(state.locale, 'components.BottomActionDeck.35', [])}`}</span>
      </button>
      <button aria-label={translate(state.locale, 'actions.buildAria', [Math.min(state.settlementsCount, RULES.victoryOutposts), RULES.victoryOutposts, RULES.buildCost, RULES.settlementGrant])} className="clay-btn min-h-14 px-1 py-1 text-xs" disabled={!playing || state.budget < RULES.buildCost || !!construction} onClick={() => dispatch({ type: 'BUILD_SETTLEMENT' })}>
        <span className="whitespace-nowrap">{translate(state.locale, 'actions.buildShort', [Math.min(state.settlementsCount, RULES.victoryOutposts), RULES.victoryOutposts])}</span><span className="whitespace-nowrap text-[10px]">{translate(state.locale, 'actions.buildReward', [RULES.buildCost, RULES.settlementGrant])}</span>
      </button>
    </div>
    <LordOfHostsButton state={state} dispatch={dispatch} />
  </div>;
}
