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

  const isHe = state.locale === 'he';

  return (
    <div className="relative w-full px-4 pb-3 pt-1 bg-gradient-to-t from-black/30 to-transparent flex flex-col gap-2 z-20 flex-shrink-0">
      {/* Build Mode active banner - FLOATING ABSOLUTE to prevent any layout shift */}
      {state.isBuildMode && (
        <div className="absolute -top-8 inset-x-4 z-30 py-1.5 px-3 bg-amber-500 text-amber-950 font-black text-xs rounded-xl text-center shadow-lg animate-pulse font-rubik flex items-center justify-between border border-amber-300">
          <span>👈 {strings.actions.selectTileToBuild}</span>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BUILD_MODE' })}
            className="underline text-[11px] font-bold hover:text-white transition-colors"
          >
            {strings.actions.cancel}
          </button>
        </div>
      )}

      {/* Three Primary Clay Buttons with strictly invariant layout height */}
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
            ({state.reservesBatchesLeft} {isHe ? 'נותרו' : 'left'})
          </span>
        </button>

        {/* 2. פריסת כוחות (Deploy Troops) */}
        <button
          onClick={() => dispatch({ type: 'DEPLOY_TROOPS' })}
          disabled={ungarrisonedCount === 0 || state.soldiersAtBorder === 0 || state.gameStatus !== 'playing'}
          className={`clay-btn py-3 px-1 text-center transition-all ${
            ungarrisonedCount > 0 ? 'ring-2 ring-red-400/80 bg-red-50/40' : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight">
            {strings.actions.deployTroops}
          </span>
          {ungarrisonedCount > 0 ? (
            <span className="text-[10px] font-bold text-red-700 mt-0.5">
              ({ungarrisonedCount} {isHe ? 'חשופים' : 'exposed'})
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-800/80 mt-0.5">
              {isHe ? 'מוצב' : 'Ready'}
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
