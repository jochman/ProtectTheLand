import React from 'react';
import { Shield, Coins, Heart } from 'lucide-react';
import { GameState } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';

interface TopStatusPillProps {
  state: GameState;
}

export const TopStatusPill: React.FC<TopStatusPillProps> = ({ state }) => {
  const strings = state.locale === 'he' ? he : en;

  // Determine Land HP bar color
  let landBarColor = 'bg-emerald-500';
  if (state.landHp < 65) {
    landBarColor = 'bg-amber-500';
  }
  if (state.landHp < 35) {
    landBarColor = 'bg-red-500 animate-pulse';
  }

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-1.5 px-3 sm:px-4 z-20 flex-shrink-0">
      {/* Upper Pill: Soldiers, Settlements, and Budget ₪ */}
      <div className="status-pill relative flex items-center justify-around w-full max-w-[340px] px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-amber-100/60">
        {/* Floating Settlement Penalty Popup */}
        {state.latestPenalty && (Date.now() - state.latestPenalty.timestamp < 3600) && (
          <div className="absolute -top-7 right-2 sm:right-4 z-30 pointer-events-none whitespace-nowrap bg-red-600/95 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xl border border-red-400 flex items-center gap-1 font-heebo">
            <span>💸</span>
            <span>-{state.latestPenalty.amount}₪</span>
            <span className="text-red-200 font-bold hidden xs:inline">({state.latestPenalty.reason})</span>
          </div>
        )}

        {/* Floating Coalition Deployment Grant Popup */}
        {state.latestGrant && (Date.now() - state.latestGrant.timestamp < 3600) && (
          <div className="absolute -top-7 left-2 sm:left-4 z-30 pointer-events-none whitespace-nowrap bg-emerald-600/95 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xl border border-emerald-300 flex items-center gap-1 font-heebo animate-bounce">
            <span>💰</span>
            <span>+{state.latestGrant.amount}₪</span>
            <span className="text-emerald-100 font-bold hidden xs:inline">({state.latestGrant.reason})</span>
          </div>
        )}
        
        {/* Soldiers Counter */}
        <div className="flex items-center gap-1.5" title={strings.stats.soldiers}>
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-800 fill-current drop-shadow-sm">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21v-3.5c0-1.5 1-2.5 2.5-3h8c1.5.5 2.5 1.5 2.5 3V21H5.5z" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight font-rubik">
            {state.soldiersAtBorder + state.soldiersAtSettlements}
          </span>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Settlements Counter */}
        <div className="flex items-center gap-1.5" title={strings.stats.settlements}>
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-700 fill-current drop-shadow-sm">
              <polygon points="12,3 2,11 5,11 5,21 19,21 19,11 22,11" />
              <rect x="10" y="14" width="4" height="7" fill="#4a2810" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight font-rubik">
            {state.settlementsCount}
          </span>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Coalition Budget ₪ Counter & Income Rate */}
        <div className="flex items-center gap-1.5" title={strings.stats.budget}>
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-100 border border-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-baseline">
              <span
                className={`text-xl font-black tracking-tight font-rubik transition-colors ${
                  state.latestPenalty && (Date.now() - state.latestPenalty.timestamp < 3600)
                    ? 'text-red-600 animate-pulse'
                    : state.latestGrant && (Date.now() - state.latestGrant.timestamp < 3600)
                    ? 'text-emerald-600 animate-bounce'
                    : 'text-amber-700'
                }`}
              >
                {state.budget}
              </span>
              <span className="text-xs font-bold text-amber-800 ml-0.5">₪</span>
            </div>
            <span
              title={
                state.locale === 'he'
                  ? `הכנסה לשנייה (בסיס אזרחי + תוספת יישובים מאובטחים)`
                  : `Income per second (Civilian base + guarded outposts bonus)`
              }
              className={`text-[9px] font-black tracking-tighter cursor-help ${
                (state.incomeRate ?? 4) >= 3
                  ? 'text-emerald-700'
                  : (state.incomeRate ?? 4) === 2
                  ? 'text-amber-700'
                  : 'text-red-600 animate-pulse'
              }`}
            >
              {(state.incomeRate ?? 4) <= 0
                ? (state.locale === 'he' ? '0₪ (גירעון!)' : '₪0/s (Deficit!)')
                : `+${state.incomeRate ?? 4}₪/${state.locale === 'he' ? 'שנ' : 's'}`}
            </span>
          </div>
        </div>

      </div>

      {/* Lower Pill: Land HP Bar & Border Readiness */}
      <div className="status-pill flex items-center justify-between w-full max-w-[340px] px-3 py-1 sm:py-1.5 rounded-full shadow-md gap-2 border border-amber-100/60 font-heebo">
        {/* Land HP Section */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0" title={strings.stats.landHp}>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Heart className={`w-3.5 h-3.5 ${state.landHp < 35 ? 'text-red-600 fill-red-500 animate-ping' : 'text-red-500 fill-red-400'}`} />
            <span className="text-xs font-black text-slate-800 font-rubik tracking-tight">
              {Math.round(state.landHp)}%
            </span>
          </div>

          {/* Land HP Fill Bar */}
          <div className="flex-1 bg-amber-100/80 rounded-full h-3.5 p-0.5 border border-amber-300/60 overflow-hidden shadow-inner relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${landBarColor}`}
              style={{ width: `${Math.max(4, state.landHp)}%` }}
            />
          </div>

          {state.activeBreaches.length > 0 && (
            <span className="text-[9px] font-black text-red-600 flex-shrink-0 animate-pulse" title="שחיקת חוסן עקב פרצות פתוחות">
              -{(state.activeBreaches.length * 0.4).toFixed(1)}/ש׳
            </span>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Border Readiness Section */}
        <div className="flex items-center gap-1 text-slate-700 flex-shrink-0" title={strings.stats.borderReadiness}>
          <Shield
            className={`w-3.5 h-3.5 ${
              state.defenseScore >= 60
                ? 'text-emerald-600 fill-emerald-100'
                : state.defenseScore >= 30
                ? 'text-amber-600 fill-amber-100'
                : 'text-red-600 fill-red-100 animate-pulse'
            }`}
          />
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-xs font-black text-slate-800 font-rubik">
              {8 - state.activeBreaches.length}/8
            </span>
            <span className="text-[9px] font-bold text-slate-500 font-heebo">
              ({state.defenseScore}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
