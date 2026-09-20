import { translate } from '../locales/translate';
import React from 'react';
import { ShieldAlert, Users, Undo2, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { haptics } from '../utils/haptics';
import { availableTroops } from '../game/rules';

interface InfiltrationDefenseModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const InfiltrationDefenseModal: React.FC<InfiltrationDefenseModalProps> = ({ state, dispatch }) => {
  if (!state.selectedInfiltrationId) return null;

  const attack = (state.greenSideAttacks || []).find(a => a.id === state.selectedInfiltrationId)
    || (state.greenSideAttacks && state.greenSideAttacks.length > 0 ? state.greenSideAttacks[0] : null);

  if (!attack) return null;


  // Find guarded settlements that have soldiers available to recall
  const guardedSettlements = Object.values(state.tiles).filter(
    t => t.hasSettlement && t.garrisonCount > 0
  );

  const canCallReserves = state.reservesBatchesLeft > 0;
  const spareCount = availableTroops(state);
  const canRecallTroop = guardedSettlements.length > 0;

  const handleCallReserves = () => {
    haptics.light();
    dispatch({ type: 'CALL_RESERVES' });
    dispatch({ type: 'SELECT_INFILTRATION', id: null });
  };

  const handleRecallTroop = (settlementId: string) => {
    haptics.light();
    dispatch({ type: 'RECALL_TROOP', tileId: settlementId, targetBorderId: attack.breachId });
    dispatch({ type: 'SELECT_INFILTRATION', id: null });
  };

  const progressPercent = Math.round(attack.progress * 100);

  return (
    <div
      onClick={() => dispatch({ type: 'SELECT_INFILTRATION', id: null })}
      className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        role="dialog" aria-modal="true" aria-label={translate(state.locale, 'components.InfiltrationDefenseModal.60')}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel bg-slate-900 border-2 border-red-500 w-full max-w-sm rounded-3xl p-5 shadow-2xl text-white flex flex-col gap-4 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse flex-shrink-0" />
            <div>
              <h3 className="text-base font-black text-white font-rubik leading-tight">
                {translate(state.locale, 'components.InfiltrationDefenseModal.60', [])}
              </h3>
              <p className="text-[11px] text-red-300 font-heebo">
                {translate(state.locale, 'components.InfiltrationDefenseModal.63', [attack.targetCityName])}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'SELECT_INFILTRATION', id: null })}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attack Proximity / Progress Bar */}
        <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-red-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {translate(state.locale, 'components.InfiltrationDefenseModal.80', [])}
            </span>
            <span className="text-amber-300 font-mono font-black">
              {progressPercent}% ({translate(state.locale, 'components.InfiltrationDefenseModal.83', [Math.max(1, Math.round(16 * (1 - attack.progress)))])})
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-red-900">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-red-300/90 leading-relaxed font-heebo">
            {translate(state.locale, 'components.InfiltrationDefenseModal.93', [])}
          </p>
        </div>

        {/* Context explanation: Why did this happen? */}
        <div className="text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-slate-300 leading-normal font-heebo">
          <p className="font-bold text-amber-300 mb-0.5">
            {translate(state.locale, 'components.InfiltrationDefenseModal.102', [])}
          </p>
          <p>
            {translate(state.locale, 'components.InfiltrationDefenseModal.105', [])}
          </p>
        </div>

        {/* Action Solutions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <p className="text-xs font-black text-amber-400 font-rubik">
            {translate(state.locale, 'components.InfiltrationDefenseModal.114', [])}
          </p>

          {/* Solution 1: Call Reserves */}
          {spareCount > 0 && <button className="min-h-11 rounded-2xl border border-emerald-400 bg-emerald-800 p-3 text-start text-sm font-bold" onClick={() => dispatch({ type: 'SEAL_BREACH', checkpointId: attack.breachId })}>{translate(state.locale, 'components.InfiltrationDefenseModal.118', [spareCount])}</button>}
          <button
            onClick={handleCallReserves}
            disabled={!canCallReserves}
            className={`w-full p-3 rounded-2xl text-start transition-all border flex items-center justify-between gap-3 ${
              canCallReserves
                ? 'bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 hover:from-emerald-800 hover:to-emerald-700 border-emerald-500/80 shadow-lg active:scale-98 cursor-pointer'
                : 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-white font-rubik">
                  {translate(state.locale, 'components.InfiltrationDefenseModal.132', [])}
                </p>
                <p className="text-[10.5px] text-emerald-200/90 font-heebo">
                  {canCallReserves
                    ? translate(state.locale, 'components.InfiltrationDefenseModal.136', [state.reservesBatchesLeft]): translate(state.locale, 'components.InfiltrationDefenseModal.139', [])}
                </p>
              </div>
            </div>
            {canCallReserves && <ArrowRight className="w-4 h-4 text-emerald-300 rtl:rotate-180 flex-shrink-0" />}
          </button>

          {/* Solution 2: Recall Troops from Outpost */}
          {canRecallTroop ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold text-slate-300">
                {translate(state.locale, 'components.InfiltrationDefenseModal.152', [])}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {guardedSettlements.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleRecallTroop(s.id)}
                    className="py-1.5 px-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 border border-blue-500 text-blue-100 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer font-heebo"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{translate(state.locale, 'components.InfiltrationDefenseModal.162', [s.settlementName || 'מאחז'])}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[10.5px] text-slate-400 font-heebo">
              {translate(state.locale, 'components.InfiltrationDefenseModal.169', [])}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
