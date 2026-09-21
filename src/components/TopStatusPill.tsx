import { translate } from '../locales/translate';
import React from 'react';
import { Shield, Coins, Users, Info } from 'lucide-react';
import { GameAction, GameState } from '../types';
import { simulationNow, availableTroops, RULES } from '../game/rules';
import { haptics } from '../utils/haptics';

interface TopStatusPillProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const STAT_INFO = {
  soldiers: {
    he: { title: '🎖️ סד״כ צבאי', text: 'סך כל החיילים בשירות והכוח הזמין. חיילים מאיישים מוצבי גבול, מאחזים ותגבור זמני.' },
    en: { title: '🎖️ Military force', text: 'Total troops in service and the available pool. Troops staff border posts, outposts, and temporary reinforcements.' },
  },
  settlements: {
    he: { title: '🏡 מאחזים', text: 'כל מאחז שהושלם מעניק 40₪ ומגדיל את תקרת התקציב ב־25₪. לניצחון נדרשים שלושה מאחזים מאוישים.' },
    en: { title: '🏡 Outposts', text: 'Each completed outpost grants ₪40 and raises the budget cap by ₪25. Victory requires three staffed outposts.' },
  },
  budget: {
    he: { title: '💰 תקציב', text: 'בניית מאחז עולה 100₪ ופריסת חייל עולה 15₪. ההכנסה מגיעה מהמשק האזרחי; מאחזים אינם מייצרים כסף.' },
    en: { title: '💰 Budget', text: 'An outpost costs ₪100 and a troop deployment costs ₪15. Income comes from the civilian economy; outposts generate no money.' },
  },
  citizens: {
    he: { title: '👥 אזרחים בחיים', text: 'פרצות, חדירות והתקפות לא מאובטחות הורגות אזרחים. האבדות קבועות, ובאפס אזרחים המשחק מסתיים.' },
    en: { title: '👥 Citizens alive', text: 'Breaches, infiltrations, and undefended attacks kill citizens. Losses are permanent, and the game ends at zero.' },
  },
  border: {
    he: { title: '🛡️ הגנת הגבול', text: 'זהו הכיסוי של שמונת מוצבי הגבול. פרצה פתוחה הורגת אזרחים ועלולה לאפשר חדירה.' },
    en: { title: '🛡️ Border defense', text: 'This is coverage across all eight border posts. An open gap kills citizens and can allow an infiltration.' },
  },
} as const;

export const TopStatusPill: React.FC<TopStatusPillProps> = ({ state, dispatch }) => {
  const triggerInfo = (key: keyof typeof STAT_INFO) => {
    haptics.light();
    const info = STAT_INFO[key][state.locale];
    dispatch({ type: 'SHOW_INFO_POPOVER', title: info.title, text: info.text });
  };
  const citizenPercent = state.citizens / RULES.nationalCitizens * 100;
  let landBarColor = 'bg-emerald-500';
  if (citizenPercent < 65) {
    landBarColor = 'bg-amber-500';
  }
  if (citizenPercent < 35) {
    landBarColor = 'bg-red-500 animate-pulse';
  }

  return (
    // Keep the status pills above the ticker without adding another HUD row.
    <div className="relative flex flex-col items-center gap-1 sm:gap-1.5 px-3 sm:px-4 z-30 flex-shrink-0">
      {/* Upper Pill: Soldiers, Settlements, and Budget ₪ */}
      <div className="status-pill relative flex items-center justify-around w-full max-w-[340px] px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-amber-100/60">
        {/* Soldiers Counter */}
        <button type="button" onClick={() => triggerInfo('soldiers')}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={translate(state.locale, 'status.tapForInfo')}>
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-800 fill-current drop-shadow-sm">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21v-3.5c0-1.5 1-2.5 2.5-3h8c1.5.5 2.5 1.5 2.5 3V21H5.5z" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight font-rubik">
            {state.soldiersAtBorder + state.soldiersAtSettlements}
          </span>
          <span className="text-[10px] font-bold text-emerald-800" data-testid="available-troops">{availableTroops(state)} {translate(state.locale, 'components.TopStatusPill.122', [])}</span>
        </button>

        <div className="w-px h-5 bg-slate-200" />

        {/* Settlements Counter */}
        <button type="button" onClick={() => triggerInfo('settlements')}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={translate(state.locale, 'status.tapForInfo')}>
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-700 fill-current drop-shadow-sm">
              <polygon points="12,3 2,11 5,11 5,21 19,21 19,11 22,11" />
              <rect x="10" y="14" width="4" height="7" fill="#4a2810" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight font-rubik">
            {state.settlementsCount}
          </span>
        </button>

        <div className="w-px h-5 bg-slate-200" />

        {/* Coalition Budget ₪ Counter & Income Rate */}
        <button type="button" onClick={() => triggerInfo('budget')}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={translate(state.locale, 'status.tapForInfo')}>
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-100 border border-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-baseline">
              <span
                data-testid="budget"
                className={`text-xl font-black tracking-tight font-rubik transition-colors ${
                  state.latestPenalty && (simulationNow(state) - state.latestPenalty.timestamp < 3600)
                    ? 'text-red-600 animate-pulse'
                    : state.latestGrant && (simulationNow(state) - state.latestGrant.timestamp < 3600)
                    ? 'text-emerald-600 animate-bounce'
                    : 'text-amber-700'
                }`}
              >
                {state.budget}
              </span>
              <span className="text-xs font-bold text-amber-800 ml-0.5">₪</span>
            </div>
            <span
              className={`text-[9px] font-black tracking-tighter ${
                (state.incomeRate ?? 4) >= 3
                  ? 'text-emerald-700'
                  : (state.incomeRate ?? 4) === 2
                  ? 'text-amber-700'
                  : 'text-red-600 animate-pulse'
              }`}
            >
              {state.latestGrant && (simulationNow(state) - state.latestGrant.timestamp < 3600)
                ? translate(state.locale, 'components.TopStatusPill.grant', [state.latestGrant.amount])
                : (state.incomeRate ?? 4) <= 0
                ? (translate(state.locale, 'components.TopStatusPill.180', []))
                : `+${state.incomeRate ?? 4}₪/${translate(state.locale, 'components.TopStatusPill.181', [])}`}
            </span>
          </div>
        </button>

      </div>

      {/* Lower Pill: surviving citizens & border readiness */}
      <div className="status-pill flex items-center justify-between w-full max-w-[340px] px-3 py-1 sm:py-1.5 rounded-full shadow-md gap-2 border border-amber-100/60 font-heebo">
        {/* Citizen Section */}
        <button type="button" onClick={() => triggerInfo('citizens')}
          className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
          title={translate(state.locale, 'status.tapForInfo')}>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Users className={`w-3.5 h-3.5 ${citizenPercent < 35 ? 'text-red-600 animate-ping' : 'text-red-500'}`} />
            <span className="text-xs font-black text-slate-800 font-rubik tracking-tight">
              {state.citizens.toLocaleString(state.locale === 'he' ? 'he-IL' : 'en-US')}
            </span>
          </div>

          {/* Citizen survival bar */}
          <div className="flex-1 bg-amber-100/80 rounded-full h-3.5 p-0.5 border border-amber-300/60 overflow-hidden shadow-inner relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${landBarColor}`}
              style={{ width: `${Math.max(4, citizenPercent)}%` }}
            />
          </div>

          {state.activeBreaches.length > 0 && (
            <span className="text-[9px] font-black text-red-600 flex-shrink-0 animate-pulse" title={translate(state.locale, 'components.TopStatusPill.212', [])}>
              -{(state.activeBreaches.length * RULES.gapDeaths).toLocaleString(state.locale === 'he' ? 'he-IL' : 'en-US')}/{translate(state.locale, 'components.TopStatusPill.213', [])}
            </span>
          )}
        </button>

        <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Border Readiness Section */}
        <button type="button" onClick={() => triggerInfo('border')}
          className="flex items-center gap-1 text-slate-700 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={translate(state.locale, 'status.tapForInfo')}>
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
        </button>
      </div>

      {state.infoPopover && (
        <div role="dialog" aria-modal="true" aria-label={state.infoPopover.title}
          onClick={() => dispatch({ type: 'CLEAR_INFO_POPOVER' })}
          className="absolute top-full mt-1.5 inset-x-3 sm:inset-x-auto sm:w-[320px] z-50 cursor-pointer rounded-2xl border-2 border-amber-400 bg-slate-900/95 p-2.5 text-white shadow-2xl backdrop-blur-md sm:p-3">
          <div className="mb-1.5 flex items-start justify-between gap-2 border-b border-amber-400/40 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300"><Info className="h-3.5 w-3.5" /><span>{state.infoPopover.title}</span></div>
            <button type="button" onClick={event => { event.stopPropagation(); dispatch({ type: 'CLEAR_INFO_POPOVER' }); }}
              aria-label={translate(state.locale, 'status.closeTooltip')} className="min-h-11 min-w-11 px-1 text-xs font-bold text-slate-300 hover:text-white">✕</button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-200">{state.infoPopover.text}</p>
          <div className="mt-1 text-end text-[9px] text-amber-400/80">{translate(state.locale, 'status.tapToClose')}</div>
        </div>
      )}
    </div>
  );
};
