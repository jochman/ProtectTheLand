import React from 'react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { LordOfHostsButton } from './LordOfHostsButton';

interface BottomActionDeckProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const BottomActionDeck: React.FC<BottomActionDeckProps> = ({ state, dispatch }) => {
  const strings = state.locale === 'he' ? he : en;

  // Check how many ungarrisoned settlements exist
  const ungarrisonedCount = Object.values(state.tiles).filter(
    t => t.hasSettlement && t.garrisonCount === 0
  ).length;

  const canAffordSettlement = state.budget >= 100;

  return (
    <div className="w-full px-4 pb-4 pt-1 bg-gradient-to-t from-black/30 to-transparent flex flex-col gap-2 z-20">
      {/* Build Mode active banner */}
      {state.isBuildMode && (
        <div className="w-full py-1 px-3 bg-amber-500 text-amber-950 font-black text-xs rounded-xl text-center shadow-lg animate-pulse font-rubik flex items-center justify-between">
          <span>👈 {strings.actions.selectTileToBuild}</span>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BUILD_MODE' })}
            className="underline text-[11px] font-bold"
          >
            {strings.actions.cancel}
          </button>
        </div>
      )}

      {/* Quick Tactical Pullback Action (Right to Left) */}
      {state.soldiersAtSettlements > 0 && state.gameStatus === 'playing' && (
        <button
          onClick={() => dispatch({ type: 'RECALL_ALL_TROOPS' })}
          className="w-full py-1.5 px-3 bg-slate-900/90 hover:bg-slate-900 active:scale-98 text-blue-300 font-bold text-xs rounded-xl shadow-lg border border-blue-500/50 flex items-center justify-between transition-all group"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-sm group-hover:-translate-x-1 transition-transform">⟵</span>
            <span className="font-heebo">
              {state.locale === 'he' ? 'החזרת כוחות מהמאחזים לגבול הריבוני' : 'Recall Troops from Outposts to Border'}
            </span>
          </span>
          <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded-full border border-blue-600/60 text-blue-200 font-mono font-black">
            {state.soldiersAtSettlements} {state.locale === 'he' ? 'לוחמים' : 'troops'}
          </span>
        </button>
      )}

      {/* Three Primary Clay Buttons */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* 1. מילואים (Reserves) */}
        <button
          onClick={() => dispatch({ type: 'CALL_RESERVES' })}
          disabled={state.reservesBatchesLeft <= 0 || state.gameStatus !== 'playing'}
          className="clay-btn py-3 px-1 text-center"
        >
          <span className="text-xs sm:text-sm font-black leading-tight">
            {strings.actions.callReserves}
          </span>
          <span className="text-[10px] font-semibold text-amber-900/80 mt-0.5">
            ({state.reservesBatchesLeft} {state.locale === 'he' ? 'נותרו' : 'left'})
          </span>
        </button>

        {/* 2. פריסת כוחות (Deploy Troops) */}
        <button
          onClick={() => dispatch({ type: 'DEPLOY_TROOPS' })}
          disabled={ungarrisonedCount === 0 || state.soldiersAtBorder === 0 || state.gameStatus !== 'playing'}
          className={`clay-btn py-3 px-1 text-center ${
            ungarrisonedCount > 0 ? 'ring-2 ring-red-400 animate-bounce' : ''
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight">
            {strings.actions.deployTroops}
          </span>
          {ungarrisonedCount > 0 ? (
            <span className="text-[10px] font-bold text-red-700 mt-0.5">
              ({ungarrisonedCount} {state.locale === 'he' ? 'חשופים' : 'exposed'})
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-800/80 mt-0.5">
              {state.locale === 'he' ? 'מוצב' : 'Ready'}
            </span>
          )}
        </button>

        {/* 3. בניית יישוב (Build Settlement) */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_BUILD_MODE' })}
          disabled={state.gameStatus !== 'playing'}
          className={`clay-btn py-3 px-1 text-center transition-all ${
            state.isBuildMode
              ? 'ring-4 ring-amber-400 bg-amber-200'
              : !canAffordSettlement
              ? 'opacity-70'
              : ''
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight">
            {state.isBuildMode ? strings.actions.cancelBuild : strings.actions.buildSettlement}
          </span>
          <span
            className={`text-[10px] font-black mt-0.5 ${
              canAffordSettlement ? 'text-amber-800' : 'text-red-700'
            }`}
          >
            {strings.actions.buildCost}
          </span>
        </button>
      </div>

      {/* 4. The Satirical Messianic Button: יהוה צבאות */}
      <LordOfHostsButton state={state} dispatch={dispatch} />
    </div>
  );
};
