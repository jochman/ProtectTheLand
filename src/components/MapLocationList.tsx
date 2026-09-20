import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { SETTLEMENT_CANDIDATE_IDS, tileName } from '../game/hexGridData';
import { RULES } from '../game/rules';
import { translate } from '../locales/translate';

export function MapLocationList({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  if (!state.isMapListOpen) return null;
  const close = () => dispatch({ type: 'CLOSE_MAP_LIST' });
  const choose = (action: GameAction) => { close(); dispatch(action); };
  const priority = (id: string) => {
    const tile = state.tiles[id];
    if (state.isBuildMode && !tile.hasSettlement && !tile.isBorderCheckpoint) return 0;
    if (state.threats.some(threat => threat.tileId === id)) return 1;
    if (tile.isBorderCheckpoint && !tile.garrisonCount) return 2;
    return tile.hasSettlement ? 3 : 4;
  };
  const sites = Object.values(state.tiles).filter(tile => tile.hasSettlement || tile.isBorderCheckpoint
    || (state.isBuildMode && SETTLEMENT_CANDIDATE_IDS.includes(tile.id) && !state.constructions[tile.id]))
    .sort((a, b) => priority(a.id) - priority(b.id));
  return <div className="absolute inset-0 z-50 grid place-items-center bg-black/75 p-3" onClick={close}>
    <section role="dialog" aria-modal="true" aria-labelledby="locations-title" className="modal-panel w-full max-w-sm rounded-3xl bg-amber-50 p-4 text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-amber-50"><h2 id="locations-title" className="font-black">{translate(state.locale, 'map.locations')}</h2><button className="min-h-11 min-w-11" onClick={close} aria-label={translate(state.locale, 'components.ThreatCommand.63')}>✕</button></div>
      <div className="mt-2 grid gap-2">{sites.map(tile => {
        const threat = state.threats.find(t => t.tileId === tile.id);
        const build = !tile.hasSettlement && !tile.isBorderCheckpoint;
        const gap = tile.isBorderCheckpoint && tile.garrisonCount === 0;
        return <div key={tile.id} className="rounded-xl border border-amber-300 bg-white p-2">
          <p className="text-sm font-bold">{tileName(tile, state.locale)}</p>
          {!build && <p className="text-xs text-slate-600">{translate(state.locale, tile.garrisonCount ? 'map.guarded' : 'map.unguarded')}{tile.hasSettlement ? ` · ${tile.hp ?? 100}%` : ''}</p>}
          <div className="flex flex-wrap gap-2">
            {build && <button className="min-h-11 rounded-lg bg-amber-800 px-3 text-sm font-bold text-white disabled:opacity-50" disabled={state.budget < RULES.buildCost} onClick={() => choose({ type: 'SELECT_TILE_TO_BUILD', tileId: tile.id })}>{translate(state.locale, 'components.BottomActionDeck.38')} · ₪{RULES.buildCost}</button>}
            {tile.hasSettlement && <button className="min-h-11 rounded-lg px-3 text-sm font-bold underline" onClick={() => choose({ type: 'SELECT_TILE', tileId: tile.id })}>{translate(state.locale, 'components.HexMapCanvas.539', [tileName(tile, state.locale)])}</button>}
            {gap && <button className="min-h-11 rounded-lg px-3 text-sm font-bold text-red-800 underline" onClick={() => choose({ type: 'SEAL_BREACH', checkpointId: tile.id })}>{translate(state.locale, 'components.HexMapCanvas.471', [tile.id])}</button>}
            {threat && <button className="min-h-11 rounded-lg bg-red-800 px-3 text-sm font-bold text-white" onClick={() => choose({ type: 'SELECT_THREAT', id: threat.id })}>{translate(state.locale, 'actions.reinforce')}</button>}
          </div>
        </div>;
      })}</div>
    </section>
  </div>;
}
