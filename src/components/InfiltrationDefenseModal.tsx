import React from 'react';
import { ShieldAlert, Users, Undo2, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { GameState, GameAction } from '../types';

interface InfiltrationDefenseModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const InfiltrationDefenseModal: React.FC<InfiltrationDefenseModalProps> = ({ state, dispatch }) => {
  if (!state.selectedInfiltrationId) return null;

  const attack = (state.greenSideAttacks || []).find(a => a.id === state.selectedInfiltrationId)
    || (state.greenSideAttacks && state.greenSideAttacks.length > 0 ? state.greenSideAttacks[0] : null);

  if (!attack) return null;

  const isHe = state.locale === 'he';

  // Find guarded settlements that have soldiers available to recall
  const guardedSettlements = Object.values(state.tiles).filter(
    t => t.hasSettlement && t.garrisonCount > 0
  );

  const canCallReserves = state.reservesBatchesLeft > 0;
  const canRecallTroop = guardedSettlements.length > 0;

  const handleCallReserves = () => {
    dispatch({ type: 'SEAL_BREACH', checkpointId: attack.breachId });
    dispatch({ type: 'SELECT_INFILTRATION', id: null });
  };

  const handleRecallTroop = (settlementId: string) => {
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
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border-2 border-red-500 w-full max-w-sm rounded-3xl p-5 shadow-2xl text-white flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse flex-shrink-0" />
            <div>
              <h3 className="text-base font-black text-white font-rubik leading-tight">
                {isHe ? 'סכנת חדירה פעילה לעורף!' : 'Active Infiltration Threat!'}
              </h3>
              <p className="text-[11px] text-red-300 font-heebo">
                {isHe ? `יעד הפושטים: ${attack.targetCityName}` : `Target: ${attack.targetCityName}`}
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
              {isHe ? 'התקדמות החוליה לעיר:' : 'Squad Approach Progress:'}
            </span>
            <span className="text-red-400 font-mono font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-red-900">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-red-300/90 leading-relaxed font-heebo">
            {isHe
              ? 'אם החוליה תגיע לעיר: נזק ישיר של 25₪- לקופה, צניחה ברמת ההגנה ובהלת תושבים!'
              : 'If squad reaches city: ₪25 damage, defense drop, and civilian panic!'}
          </p>
        </div>

        {/* Context explanation: Why did this happen? */}
        <div className="text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-slate-300 leading-normal font-heebo">
          <p className="font-bold text-amber-300 mb-0.5">
            {isHe ? 'למה זה קרה?' : 'Why did this happen?'}
          </p>
          <p>
            {isHe
              ? 'כוחות צה״ל הוזזו מעמדות הגבול כדי לשמור על המאחזים, מה שהותיר פרצה בלתי-מאובטחת בגדר.'
              : 'IDF troops were redeployed to guard outposts, leaving an unmanned gap in the border.'}
          </p>
        </div>

        {/* Action Solutions */}
        <div className="flex flex-col gap-2.5 pt-1">
          <p className="text-xs font-black text-amber-400 font-rubik">
            {isHe ? 'מה אפשר לעשות עכשיו?' : 'What can you do?'}
          </p>

          {/* Solution 1: Call Reserves */}
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
                  {isHe ? '1. גיוס מילואים ליירוט וסתימת הפרצה' : '1. Call Reserves to Intercept'}
                </p>
                <p className="text-[10.5px] text-emerald-200/90 font-heebo">
                  {canCallReserves
                    ? isHe
                      ? `חוסם את הגבול ומיירט מיד (${state.reservesBatchesLeft} נותרו)`
                      : `Seals border and intercepts squad (${state.reservesBatchesLeft} left)`
                    : isHe
                    ? 'אזלו סבבי המילואים!'
                    : 'No reserve calls left!'}
                </p>
              </div>
            </div>
            {canCallReserves && <ArrowRight className="w-4 h-4 text-emerald-300 rtl:rotate-180 flex-shrink-0" />}
          </button>

          {/* Solution 2: Recall Troops from Outpost */}
          {canRecallTroop ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold text-slate-300">
                {isHe ? '2. או החזר חייל ממאחז כדי לאבטח את הגבול:' : '2. Or recall soldier from outpost:'}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {guardedSettlements.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleRecallTroop(s.id)}
                    className="py-1.5 px-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 border border-blue-500 text-blue-100 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer font-heebo"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{isHe ? `החזר מ${s.settlementName || 'מאחז'}` : `Recall from ${s.settlementName}`}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[10.5px] text-slate-400 font-heebo">
              {isHe
                ? 'אין חיילים במאחזים כרגע להחזרה (כולם כבר בגבול או שטרם הוצבו).'
                : 'No troops currently deployed in outposts to recall.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
