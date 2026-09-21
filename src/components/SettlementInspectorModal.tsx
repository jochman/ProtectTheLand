import { translate } from '../locales/translate';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { RULES, AVAILABLE_TROOP_SOURCE, availableTroops, troopSource } from '../game/rules';
import { tileName } from '../game/hexGridData';

export function SettlementInspectorModal({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const tile = state.selectedSettlementId ? state.tiles[state.selectedSettlementId] : null;
  if (!tile?.hasSettlement) return null;
  const guarded = tile.garrisonCount > 0;
  const spareCount = availableTroops(state);
  const source = troopSource(state, tile.id);
  const opensGap = source && source !== AVAILABLE_TROOP_SOURCE && state.tiles[source]?.garrisonCount === 1;
  const close = () => dispatch({ type: 'SELECT_TILE', tileId: null });
  return <div className="absolute inset-0 z-50 grid place-items-center bg-black/70 p-3" onClick={close}>
    <section role="dialog" aria-modal="true" aria-labelledby="outpost-title" className="modal-panel w-full max-w-sm rounded-3xl bg-amber-50 p-4 text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-2"><h2 id="outpost-title" className="text-lg font-black">{tileName(tile, state.locale)}</h2><button className="min-h-11 min-w-11" aria-label={translate(state.locale, 'components.SettlementInspectorModal.20', [])} onClick={close}>✕</button></div>
      <p className="rounded-xl bg-white p-3 text-sm">{translate(state.locale, guarded ? 'deploy.guarded' : 'components.SettlementInspectorModal.21', [guarded ? RULES.guardedIncome : (tile.citizens ?? RULES.outpostCitizens).toLocaleString(state.locale === 'he' ? 'he-IL' : 'en-US')])}</p>
      {state.threats.filter(t => t.tileId === tile.id).map(threat => <button key={threat.id}
        className="mt-3 min-h-11 w-full rounded-xl bg-red-800 p-3 text-sm font-bold text-white"
        onClick={() => dispatch({ type: 'SELECT_THREAT', id: threat.id })}>{translate(state.locale, 'components.SettlementInspectorModal.24', [])}</button>)}
      {!guarded && <div className="mt-3 rounded-xl border border-amber-300 bg-white p-3 text-sm">
        <p>{translate(state.locale, 'components.SettlementInspectorModal.32', [RULES.deployCost, RULES.guardedIncome])}</p>
        <p className={opensGap ? 'mt-2 font-bold text-red-800' : 'mt-2 text-emerald-800'}>{translate(state.locale,
          !source ? 'deploy.noTroops' : opensGap ? 'deploy.gap' : 'deploy.autoSafe', [RULES.gapDeaths.toLocaleString(state.locale === 'he' ? 'he-IL' : 'en-US')])}</p>
        <button disabled={!source || state.budget < RULES.deployCost} className="mt-3 min-h-11 w-full rounded-xl bg-amber-800 p-3 font-bold text-white disabled:opacity-50"
          onClick={() => dispatch({ type: 'DEPLOY_TROOP', settlementId: tile.id })}>{translate(state.locale, 'deploy.send', [RULES.deployCost])}</button>
        {state.budget < RULES.deployCost && <p className="mt-2 text-red-800">{translate(state.locale, 'deploy.needBudget', [RULES.deployCost])}</p>}
        {!source && state.reservesBatchesLeft > 0 && <button className="mt-2 min-h-11 w-full rounded-xl bg-blue-700 p-2 font-bold text-white" onClick={() => dispatch({ type: 'CALL_RESERVES' })}>{translate(state.locale, 'actions.reserves')}</button>}
      </div>}
      {guarded && <button disabled={!state.activeBreaches.length} className="mt-3 min-h-11 w-full rounded-xl bg-blue-700 p-3 text-sm font-bold text-white disabled:opacity-50" onClick={() => dispatch(spareCount > 0
        ? { type: 'SEAL_BREACH', checkpointId: state.greenSideAttacks[0]?.breachId || state.activeBreaches[0] }
        : { type: 'RECALL_TROOP', tileId: tile.id })}>{translate(state.locale, spareCount > 0 ? 'deploy.sealAvailable' : 'components.SettlementInspectorModal.40')}</button>}
      <button className="mt-3 min-h-11 w-full rounded-xl bg-emerald-700 p-3 text-sm font-bold text-white" onClick={() => dispatch({ type: 'EVACUATE_SETTLEMENT', tileId: tile.id })}>{translate(state.locale, 'components.SettlementInspectorModal.41', [])}</button>
      <p className="mt-2 text-xs text-slate-600">{translate(state.locale, 'components.SettlementInspectorModal.42', [])}</p>
    </section>
  </div>;
}
