import React from 'react';
import { Home, ShieldCheck, AlertCircle, Trash2, X } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';

interface SettlementInspectorModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const SettlementInspectorModal: React.FC<SettlementInspectorModalProps> = ({ state, dispatch }) => {
  if (!state.selectedSettlementId) return null;

  const tile = state.tiles[state.selectedSettlementId];
  if (!tile || !tile.hasSettlement) return null;

  const strings = state.locale === 'he' ? he : en;
  const isGuarded = tile.garrisonCount > 0;

  return (
    <div
      onClick={() => dispatch({ type: 'SELECT_TILE', tileId: null })}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-amber-50 border-2 border-amber-300 w-full max-w-xs rounded-3xl p-5 shadow-2xl text-slate-800 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-700" />
            <h3 className="text-lg font-black text-slate-900 font-rubik">
              {tile.settlementName || strings.modals.inspectorTitle}
            </h3>
          </div>
          <button
            onClick={() => dispatch({ type: 'SELECT_TILE', tileId: null })}
            className="p-1 rounded-full hover:bg-amber-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Status */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-amber-200 shadow-sm">
          {isGuarded ? (
            <>
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-black text-slate-800">{strings.modals.inspectorGuarded}</p>
                <p className="text-slate-500 text-[11px]">חייל צה״ל מוקצה לשמירה היקפית במקום בגבול</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-black text-red-700">{strings.modals.inspectorUnguarded}</p>
                <p className="text-slate-500 text-[11px]">נדרשת פריסת כוחות דחופה מהגבול!</p>
              </div>
            </>
          )}
        </div>

        {/* Creative / Rational Strategic Action: Recall or Evacuate */}
        <div className="flex flex-col gap-2">
          {isGuarded && (
            <button
              onClick={() => dispatch({ type: 'RECALL_TROOP', tileId: tile.id })}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs font-heebo"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{state.locale === 'he' ? 'החזרת חייל להגנת הגבול המערבי ⟵' : 'Recall Soldier to Western Border ⟵'}</span>
            </button>
          )}

          <button
            onClick={() => dispatch({ type: 'EVACUATE_SETTLEMENT', tileId: tile.id })}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs font-heebo"
          >
            <Trash2 className="w-4 h-4" />
            <span>{strings.modals.evacuateBtn}</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'SELECT_TILE', tileId: null })}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            {strings.modals.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
