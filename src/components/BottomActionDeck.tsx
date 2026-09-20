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
  const deployCost = potentialDeployCount * 25;
  const canAffordDeploy = state.budget >= 25;

  const canAffordSettlement = state.budget >= 100;

  const isHe = state.locale === 'he';

  const hasAttack = (state.greenSideAttacks || []).length > 0;
  const targetAttack = hasAttack ? state.greenSideAttacks[0] : null;
  const hasBorderBreach = state.soldiersAtBorder < 8 || (state.activeBreaches || []).length > 0;
  const hasUngarrisonedSettlement = ungarrisonedCount > 0;
  const hasDoubleCrisis = hasBorderBreach && hasUngarrisonedSettlement;

  return (
    <div className="relative w-full px-3 sm:px-4 pb-2 sm:pb-3 pt-1 bg-gradient-to-t from-black/30 to-transparent flex flex-col gap-1 sm:gap-1.5 z-20 flex-shrink-0">
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

      {/* Tactical Situation Advisor (Direct context guidance telling player what to do!) */}
      <div className="w-full text-center py-0.5 px-2 rounded-lg text-[10.5px] font-bold font-heebo shadow-sm transition-all flex items-center justify-center gap-1 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
        {hasAttack ? (
          <span className="text-red-200 bg-red-950/90 px-2 py-0.5 rounded-md border border-red-500/80 animate-pulse font-black flex items-center gap-1">
            <span>🚨</span>
            <span>{isHe ? `חדירה לעבר ${targetAttack?.targetCityName}! לחץ 'מילואים' או על הפרצה לבלימה!` : `Raid on ${targetAttack?.targetCityName}! Call reserves or seal breach!`}</span>
          </span>
        ) : hasDoubleCrisis ? (
          state.reservesBatchesLeft > 0 ? (
            <span className="text-amber-200 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/80 flex items-center gap-1">
              <span>💡</span>
              <span>{isHe ? 'מחסור לוחמים בשני הצירים! לחץ \'גייס מילואים\' (+4) לסגירת הפרצות' : 'Troop crisis on both fronts! Tap \'Call Reserves\' (+4) to fill gaps'}</span>
            </span>
          ) : (
            <span className="text-red-200 bg-red-950/90 px-2 py-0.5 rounded-md border border-red-500/80 flex items-center gap-1">
              <span>⚠️</span>
              <span>{isHe ? 'המילואים אזלו! לחץ על מאחז לבחירת \'פינוי מאחז\' וביצור הגבול' : 'Reserves depleted! Tap outpost to evacuate & fortify border'}</span>
            </span>
          )
        ) : hasUngarrisonedSettlement && state.soldiersAtBorder > 0 ? (
          canAffordDeploy ? (
            <span className="text-amber-200 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/80 flex items-center gap-1">
              <span>🏰</span>
              <span>{isHe ? 'מאחז חשוף! לחץ \'פריסת כוחות\' (25₪-) לאבטחת המאחז' : 'Outpost exposed! Tap \'Deploy Troops\' (-₪25) to garrison'}</span>
            </span>
          ) : (
            <span className="text-red-200 bg-red-950/90 px-2 py-0.5 rounded-md border border-red-500/80 flex items-center gap-1">
              <span>💸</span>
              <span>{isHe ? 'מאחז חשוף וחסר תקציב לפריסה (25₪)! גבה מס מערי ישראל או אסוף מטבעות' : 'Outpost exposed, need ₪25 for deployment! Tap cities for taxes'}</span>
            </span>
          )
        ) : hasBorderBreach && guardedCount > 0 ? (
          <span className="text-blue-200 bg-blue-950/90 px-2 py-0.5 rounded-md border border-blue-500/80 flex items-center gap-1">
            <span>⚠️</span>
            <span>{isHe ? 'פרצה בגבול! לחץ על נקודת הפרצה (⚠️) להחזרת לוחם או גייס מילואים' : 'Border breach! Tap the gap (⚠️) to recall troop or call reserves'}</span>
          </span>
        ) : canAffordSettlement ? (
          <span className="text-amber-200 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/80 flex items-center gap-1">
            <span>🏗️</span>
            <span>{isHe ? 'יש תקציב! לחץ \'בניית יישוב\' ובחר גבעה פנויה בשומרון' : 'Budget ready! Tap \'Build Outpost\' & select an empty hilltop'}</span>
          </span>
        ) : (
          <span className="text-slate-300 bg-slate-900/70 px-2 py-0.5 rounded-md border border-slate-700/60 flex items-center gap-1">
            <span>💰</span>
            <span>{isHe ? 'טיפ: לחץ על ערי ישראל לגביית מס (2₪+) או אסוף מטבעות' : 'Tip: Tap Israeli cities for taxes (+₪2) or collect coins'}</span>
          </span>
        )}
      </div>

      {/* Three Primary Clay Buttons with strictly invariant layout height */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
        {/* 1. מילואים (Reserves) */}
        <button
          onClick={() => dispatch({ type: 'CALL_RESERVES' })}
          disabled={state.reservesBatchesLeft <= 0 || state.gameStatus !== 'playing'}
          className={`clay-btn py-1.5 sm:py-2 px-1 text-center transition-all ${
            hasAttack
              ? 'ring-4 ring-red-500 bg-red-100/95 animate-pulse text-red-950 font-black shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : hasDoubleCrisis && state.reservesBatchesLeft > 0
              ? 'ring-2 ring-amber-400 bg-amber-100/90 animate-pulse text-amber-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : ''
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight flex items-center justify-center gap-1">
            {hasAttack ? (
              <>
                <span>🚨</span>
                <span>{isHe ? 'בלום חדירה!' : 'Intercept!'}</span>
              </>
            ) : hasDoubleCrisis && state.reservesBatchesLeft > 0 ? (
              <>
                <span>💡</span>
                <span>{isHe ? 'גייס מילואים!' : 'Call Reserves!'}</span>
              </>
            ) : (
              <span>{strings.actions.callReserves}</span>
            )}
          </span>
          <span className="text-[10px] font-semibold text-amber-900/80 mt-0.5">
            {hasAttack
              ? (isHe ? `מילואים (${state.reservesBatchesLeft})` : `Reserves (${state.reservesBatchesLeft})`)
              : hasDoubleCrisis && state.reservesBatchesLeft > 0
              ? (isHe ? '(+4 לוחמים לגבול)' : '(+4 Troops)')
              : `(${state.reservesBatchesLeft} ${isHe ? 'נותרו' : 'left'})`}
          </span>
        </button>

        {/* 2. פריסת כוחות (Deploy Troops) */}
        <button
          onClick={() => dispatch({ type: 'DEPLOY_TROOPS' })}
          disabled={ungarrisonedCount === 0 || state.soldiersAtBorder === 0 || !canAffordDeploy || state.gameStatus !== 'playing'}
          className={`clay-btn py-1.5 sm:py-2 px-1 text-center transition-all ${
            ungarrisonedCount > 0 && state.soldiersAtBorder > 0 && canAffordDeploy
              ? 'ring-2 ring-amber-500 bg-amber-50/70 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-[pulse_2.5s_infinite]'
              : ungarrisonedCount > 0
              ? 'ring-2 ring-red-400/80 bg-red-50/40 opacity-70'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="text-xs sm:text-sm font-black leading-tight text-slate-800">
            {strings.actions.deployTroops}
          </span>
          {ungarrisonedCount > 0 && state.soldiersAtBorder > 0 ? (
            <div className="flex flex-col items-center mt-0.5 leading-none">
              {canAffordDeploy ? (
                <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300 shadow-sm">
                  -{deployCost}₪ {isHe ? 'עלות' : 'Cost'}
                </span>
              ) : (
                <span className="text-[9px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full border border-red-300 shadow-sm">
                  {isHe ? 'נדרש 25₪' : 'Need ₪25'}
                </span>
              )}
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
                  (+{guardedCount * 1}₪/{isHe ? 'שנ' : 's'})
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
