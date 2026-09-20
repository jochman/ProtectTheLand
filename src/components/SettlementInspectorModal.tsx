import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { RULES, AVAILABLE_TROOP_SOURCE, availableTroops } from '../game/rules';
import { BORDER_TO_GREEN_CITY } from '../game/gameReducer';
import { tileName } from '../game/hexGridData';

export function SettlementInspectorModal({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const tile = state.selectedSettlementId ? state.tiles[state.selectedSettlementId] : null;
  if (!tile?.hasSettlement) return null;
  const he = state.locale === 'he';
  const guarded = tile.garrisonCount > 0;
  const borders = Object.values(state.tiles).filter(t => t.isBorderCheckpoint && t.garrisonCount > 0);
  const spareCount = availableTroops(state);
  const fromAvailable = state.pendingBorderId === AVAILABLE_TROOP_SOURCE;
  const border = state.pendingBorderId ? state.tiles[state.pendingBorderId] : null;
  const opensGap = border?.garrisonCount === 1;
  const close = () => dispatch({ type: 'SELECT_TILE', tileId: null });
  return <div className="absolute inset-0 z-50 grid place-items-center bg-black/70 p-3" onClick={close}>
    <section role="dialog" aria-modal="true" aria-labelledby="outpost-title" className="modal-panel w-full max-w-sm rounded-3xl bg-amber-50 p-4 text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-2"><h2 id="outpost-title" className="text-lg font-black">{tileName(tile, state.locale)}</h2><button className="min-h-11 min-w-11" aria-label={he ? 'סגור' : 'Close'} onClick={close}>✕</button></div>
      <p className="rounded-xl bg-white p-3 text-sm">{guarded ? (he ? `מאויש · מימון +${RULES.guardedIncome}₪ לשנייה` : `Guarded · funding +₪${RULES.guardedIncome}/s`) : (he ? `לא מאויש · עמידות ${tile.hp ?? 100}%` : `Unguarded · durability ${tile.hp ?? 100}%`)}</p>
      {!guarded && <div className="mt-3">
        <h3 className="text-sm font-bold">{he ? 'בחר מאין לפרוס חייל' : 'Choose a troop source'}</h3>
        {spareCount > 0 && <button aria-pressed={fromAvailable} className={`mt-2 min-h-11 w-full rounded-xl border p-2 text-start text-sm font-bold ${fromAvailable ? 'border-emerald-700 bg-emerald-100' : 'border-emerald-300 bg-white'}`} onClick={() => dispatch({ type: 'PREVIEW_DEPLOYMENT', borderId: AVAILABLE_TROOP_SOURCE })}>{he ? `כוח זמין: ${spareCount} חיילים — ללא דילול עמדות` : `Available soldiers: ${spareCount} — keep guards in place`}</button>}
        <div className="mt-2 grid grid-cols-2 gap-2">{borders.map(b => <button key={b.id} aria-pressed={border?.id === b.id} className={`min-h-11 rounded-xl border p-2 text-start text-xs ${border?.id === b.id ? 'border-amber-700 bg-amber-200' : 'border-amber-300 bg-white'}`} onClick={() => dispatch({ type: 'PREVIEW_DEPLOYMENT', borderId: b.id })}>
          {he ? 'גזרה' : 'Sector'} {b.id.replace('bdr-', '')} · {he ? BORDER_TO_GREEN_CITY[b.id]?.nameHe : BORDER_TO_GREEN_CITY[b.id]?.nameEn}
        </button>)}</div>
        {(border || fromAvailable) && <div className={`mt-3 rounded-xl border p-3 text-sm leading-relaxed ${opensGap ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}>
          <p>{he ? `עלות: ${RULES.deployCost}₪. מימון: +${RULES.guardedIncome}₪ לשנייה.` : `Cost: ₪${RULES.deployCost}. Funding: +₪${RULES.guardedIncome}/s.`}</p>
          <p>{fromAvailable ? (he ? 'ייפרס חייל מהכוח הזמין. כל השומרים יישארו בעמדותיהם, ללא פרצה חדשה.' : 'Deploys an unassigned soldier. All existing guards stay in place; no new gap.') : opensGap ? (he ? 'גזרה אחת תיחשף: הגנה ‎-12.5 נקודות, שחיקה ‎-0.4 חוסן לשנייה.' : 'One sector exposed: defense −12.5 points, resilience −0.4 HP/s.') : (he ? 'יישאר חייל בגזרה; לא תיפתח פרצה.' : 'A troop remains in this sector; no new gap.')}</p>
          <button disabled={state.budget < RULES.deployCost || (fromAvailable && spareCount === 0)} className="mt-2 min-h-11 w-full rounded-xl bg-amber-800 p-2 font-bold text-white disabled:opacity-50" onClick={() => dispatch({ type: 'DEPLOY_TROOP', settlementId: tile.id, borderId: fromAvailable ? AVAILABLE_TROOP_SOURCE : border!.id })}>{he ? 'אשר פריסת חייל' : 'Confirm troop deployment'}</button>
        </div>}
        {(state.budget < RULES.deployCost || (!borders.length && spareCount === 0)) && <p className="mt-2 text-sm text-red-800">{he ? 'דרושים 25₪ וחייל זמין או חייל בגבול.' : 'Requires ₪25 and an available or border troop.'}</p>}
      </div>}
      {guarded && <button disabled={!state.activeBreaches.length} className="mt-3 min-h-11 w-full rounded-xl bg-blue-700 p-3 text-sm font-bold text-white disabled:opacity-50" onClick={() => dispatch(spareCount > 0
        ? { type: 'SEAL_BREACH', checkpointId: state.greenSideAttacks[0]?.breachId || state.activeBreaches[0] }
        : { type: 'RECALL_TROOP', tileId: tile.id })}>{spareCount > 0 ? (he ? 'סגור פרצה עם חייל זמין' : 'Seal a gap with an available soldier') : (he ? 'החזר חייל וסגור פרצה' : 'Recall troop and seal a gap')}</button>}
      <button className="mt-3 min-h-11 w-full rounded-xl bg-emerald-700 p-3 text-sm font-bold text-white" onClick={() => dispatch({ type: 'EVACUATE_SETTLEMENT', tileId: tile.id })}>{he ? 'פנה מאחז והחזר כוחות' : 'Evacuate outpost and return troops'}</button>
      <p className="mt-2 text-xs text-slate-600">{he ? 'הפינוי מפסיק את מימון המאחז. חיילים חוזרים לגבול או לכוח הזמין.' : 'Evacuation ends outpost funding. Troops return to the border or the available pool.'}</p>
    </section>
  </div>;
}
