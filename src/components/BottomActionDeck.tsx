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

  return (
    <div className="w-full px-4 pb-4 pt-2 bg-gradient-to-t from-black/20 to-transparent flex flex-col gap-2.5 z-20">
      {/* Three Primary Clay Buttons */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {/* 1. מילואים (Reserves) */}
        <button
          onClick={() => dispatch({ type: 'CALL_RESERVES' })}
          disabled={state.reservesBatchesLeft <= 0 || state.gameStatus !== 'playing'}
          className="clay-btn py-3 px-1 text-center"
        >
          <span className="text-sm font-black leading-tight">
            {strings.actions.callReserves}
          </span>
          <span className="text-[10px] font-semibold text-amber-900/80 mt-0.5">
            ({state.reservesBatchesLeft} נותרו)
          </span>
        </button>

        {/* 2. פריסת כוחות (Deploy Troops) */}
        <button
          onClick={() => dispatch({ type: 'DEPLOY_TROOPS' })}
          disabled={ungarrisonedCount === 0 || state.soldiersAtBorder === 0 || state.gameStatus !== 'playing'}
          className={`clay-btn py-3 px-1 text-center ${
            ungarrisonedCount > 0 ? 'ring-2 ring-amber-400 animate-bounce' : ''
          }`}
        >
          <span className="text-sm font-black leading-tight">
            {strings.actions.deployTroops}
          </span>
          {ungarrisonedCount > 0 && (
            <span className="text-[10px] font-bold text-red-700 mt-0.5">
              ({ungarrisonedCount} דורשים שמירה)
            </span>
          )}
        </button>

        {/* 3. בניית יישוב (Build Settlement) */}
        <button
          onClick={() => dispatch({ type: 'BUILD_SETTLEMENT' })}
          disabled={state.gameStatus !== 'playing'}
          className="clay-btn py-3 px-1 text-center"
        >
          <span className="text-sm font-black leading-tight">
            {strings.actions.buildSettlement}
          </span>
          <span className="text-[10px] font-semibold text-amber-900/80 mt-0.5">
            (+1 מאחז)
          </span>
        </button>
      </div>

      {/* 4. The Satirical Messianic Button: יהוה צבאות */}
      <LordOfHostsButton state={state} dispatch={dispatch} />
    </div>
  );
};
