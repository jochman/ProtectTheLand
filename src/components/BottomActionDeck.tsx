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

  const guardedCount = Object.values(state.tiles).filter(
    t => t.hasSettlement && t.garrisonCount > 0
  ).length;

  const potentialDeployCount = Math.min(ungarrisonedCount, state.soldiersAtBorder);
  const grantReward = potentialDeployCount * 35;

  const canAffordSettlement = state.budget >= 100;

  const isHe = state.locale === 'he';

  return (
    <div className="relative w-full px-3 sm:px-4 pb-2 sm:pb-3 pt-1 bg-gradient-to-t from-black/30 to-transparent flex flex-col gap-1.5 sm:gap-2 z-20 flex-shrink-0">
      {/* Build Mode active banner - FLOATING ABSOLUTE to prevent any layout shift */}
      {state.isBuildMode && (
        <div className="absolute -top-8 inset-x-4 z-30 py-1 px-3 bg-amber-500 text-amber-950 font-black text-xs rounded-xl text-center shadow-lg animate-pulse font-rubik flex items-center justify-between border border-amber-300">
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
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
        {/* 1. מילואים (Reserves) */}
        <button
          onClick={() => dispatch({ type: 'CALL_RESERVES' })}
          disabled={state.reservesBatchesLeft <= 0 || state.gameStatus !== 'playing'}
          className={`clay-btn py-1.5 sm:py-2 px-1 text-center transition-all ${
            (state.greenSideAttacks || []).length > 0
              ? 'ring-4 ring-red-500 bg-red-100/95 animate-pulse text-red-950 font-black shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : ''
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight flex items-center justify-center gap-1">
            {(state.greenSideAttacks || []).length > 0 && <span>🚨</span>}
            {(state.greenSideAttacks || []).length > 0
              ? (isHe ? 'בלום חדירה!' : 'Intercept!')
              : strings.actions.callReserves}
          </span>
          <span className="text-[10px] font-semibold text-amber-900/80 mt-0.5">
            {(state.greenSideAttacks || []).length > 0
              ? (isHe ? `מילואים (${state.reservesBatchesLeft})` : `Reserves (${state.reservesBatchesLeft})`)
              : `(${state.reservesBatchesLeft} ${isHe ? 'נותרו' : 'left'})`}
          </span>
        </button>

        {/* 2. פריסת כוחות (Deploy Troops) */}
        <button
          onClick={() => dispatch({ type: 'DEPLOY_TROOPS' })}
          disabled={ungarrisonedCount === 0 || state.soldiersAtBorder === 0 || state.gameStatus !== 'playing'}
          className={`clay-btn py-1.5 sm:py-2 px-1 text-center transition-all ${
            ungarrisonedCount > 0 && state.soldiersAtBorder > 0
              ? 'ring-2 ring-emerald-500 bg-emerald-50/70 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-[pulse_2.5s_infinite]'
              : ungarrisonedCount > 0
              ? 'ring-2 ring-red-400/80 bg-red-50/40'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight text-slate-800">
            {strings.actions.deployTroops}
          </span>
          {ungarrisonedCount > 0 && state.soldiersAtBorder > 0 ? (
            <div className="flex flex-col items-center mt-0.5 leading-none">
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300 shadow-sm">
                +{grantReward}₪ {isHe ? 'מענק!' : 'Grant!'}
              </span>
              <span className="text-[9px] font-bold text-red-600 mt-0.5">
                ({ungarrisonedCount} {isHe ? 'חשופים' : 'exposed'})
              </span>
            </div>
          ) : ungarrisonedCount > 0 ? (
            <span className="text-[10px] font-bold text-red-700 mt-0.5">
              ({ungarrisonedCount} {isHe ? 'חשופים' : 'exposed'})
            </span>
          ) : (
            <div className="flex flex-col items-center mt-0.5 leading-none">
              <span className="text-[10px] font-semibold text-emerald-800/80">
                {isHe ? 'מאובטח' : 'Guarded'}
              </span>
              {guardedCount > 0 && (
                <span className="text-[9px] font-bold text-emerald-600 mt-0.5">
                  (+{Math.round(guardedCount * 1.5)}₪/{isHe ? 'שנ' : 's'})
                </span>
              )}
            </div>
          )}
        </button>

        {/* 3. בניית יישוב (Build Settlement) */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_BUILD_MODE' })}
          disabled={state.gameStatus !== 'playing'}
          className={`clay-btn py-2 sm:py-2.5 px-1 text-center transition-all ${
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
