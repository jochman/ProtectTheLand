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

        {/* Unprotected Settlement Durability / HP Bar */}
        {!isGuarded && (
          <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">עמידות המאחז (HP):</span>
              <span className={(tile.hp ?? 100) <= 30 ? 'text-red-600 font-black animate-pulse' : 'text-emerald-700'}>
                {tile.hp ?? 100}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (tile.hp ?? 100) > 60 ? 'bg-emerald-500' : (tile.hp ?? 100) > 30 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${tile.hp ?? 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              בהיעדר חיילי צה״ל, המאחז סופג נזק בכל עימות ועלול להיחרב!
            </p>
          </div>
        )}

        {/* Creative / Rational Strategic Action: Recall or Evacuate */}
        <div className="flex flex-col gap-2">
          {isGuarded && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => dispatch({ type: 'RECALL_TROOP', tileId: tile.id })}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs font-heebo"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{state.locale === 'he' ? 'החזרת חייל להגנת הגבול המערבי ⟵' : 'Recall Soldier to Western Border ⟵'}</span>
              </button>
              <div className="text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-1 rounded-xl border border-emerald-300 text-center font-rubik">
                {state.locale === 'he' ? '⚡ +12.5% הגנה לקו הגבול הריבוני בהחזרת חייל!' : '⚡ +12.5% Defense to Sovereign Border on Recall!'}
              </div>
            </div>
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
