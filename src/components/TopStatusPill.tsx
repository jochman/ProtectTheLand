import { translate } from '../locales/translate';
import React from 'react';
import { Shield, Coins, Users, Info } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { simulationNow, availableTroops, RULES } from '../game/rules';
import { haptics } from '../utils/haptics';

interface TopStatusPillProps {
  state: GameState;
  dispatch?: React.Dispatch<GameAction>;
}

const STAT_INFO = {
  soldiers: {
    he: {
      title: '🎖️ סד״כ צבאי (חיילים בשירות)',
      text: 'סך כל הכוחות העומדים לרשותך. כל חייל יכול לבצר את גבול עזה או להישלח לאבטח מאחז ביו״ש. החלט היכן להציב אותם בקפידה!',
    },
    en: {
      title: '🎖️ Military Force (Active Troops)',
      text: 'Total available personnel. Each soldier can fortify the Gaza border or be deployed to secure a West Bank outpost. Choose deployments wisely!',
    },
  },
  settlements: {
    he: {
      title: '🏡 מאחזים ויישובים ביו״ש',
      text: 'מספר נקודות ההתיישבות שהוקמו בגבעות. כל מאחז מקרב את גאולת ״יהוה צבאות״, אך אינו מייצר הכנסה ודורש אבטחה צבאית קבועה למניעת פשיטות והרג אזרחים.',
    },
    en: {
      title: '🏡 Hilltop Outposts & Settlements',
      text: 'Settlements established across the West Bank. They advance total conquest and redemption, but generate no income and require standing guards to prevent raids and civilian deaths.',
    },
  },
  budget: {
    he: {
      title: '💰 תקציב קואליציוני (₪)',
      text: 'המשאבים הכספיים שלך. משמשים לבניית מאחזים (100₪) ולפריסת כוחות (15₪). ההכנסה מגיעה מהמשק האזרחי בלבד; מאחזים אינם מייצרים כסף.',
    },
    en: {
      title: '💰 Coalition Budget (₪)',
      text: 'Your political funding. Used to construct outposts (₪100) and deploy troops (₪15). Income comes only from civilian revenue; outposts generate no money.',
    },
  },
  citizens: {
    he: {
      title: '👥 אזרחים שנותרו בחיים',
      text: 'כל פרצה פתוחה, חדירה ופגיעה לא מאובטחת הורגות אזרחים. האבדות קבועות ואינן מתאוששות. אם מספר האזרחים מגיע לאפס – המשחק נגמר.',
    },
    en: {
      title: '👥 Citizens Still Alive',
      text: 'Every open breach, infiltration, and undefended strike kills citizens. These losses are permanent. If the citizen count reaches zero, the game ends.',
    },
  },
  border: {
    he: {
      title: '🛡️ הגנת הגבול (מוכנות קו המגע)',
      text: 'מצב 8 גזרות הגבול סביב רצועת עזה. ככל שחיילים נשלחים לאבטח מאחזים, הגבול נותר חשוף ונוצרות פרצות (⚠️). החזר חיילים לגבול כדי לסגור אותן!',
    },
    en: {
      title: '🛡️ Border Defense (Perimeter Readiness)',
      text: 'Status of 8 border sectors around Gaza. Diverting soldiers to guard West Bank hilltops exposes the border to breaches (⚠️). Recall troops to seal them!',
    },
  },
};

export const TopStatusPill: React.FC<TopStatusPillProps> = ({ state, dispatch }) => {
  const strings = state.locale === 'he' ? he : en;

  const triggerInfo = (key: keyof typeof STAT_INFO) => {
    haptics.light();
    if (dispatch) {
      const info = STAT_INFO[key][state.locale];
      dispatch({
        type: 'SHOW_INFO_POPOVER',
        title: info.title,
        text: info.text,
      });
    }
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
    // This stacking context must sit above the ticker so the explanatory
    // popover is never obscured by the news bar.
    <div className="relative flex flex-col items-center gap-1 sm:gap-1.5 px-3 sm:px-4 z-30 flex-shrink-0">
      {/* Upper Pill: Soldiers, Settlements, and Budget ₪ */}
      <div className="status-pill relative flex items-center justify-around w-full max-w-[340px] px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-amber-100/60">
        {/* Soldiers Counter (Tap for Info) */}
        <button type="button"
          onClick={() => triggerInfo('soldiers')}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={`${strings.stats.soldiers} (${translate(state.locale, 'components.TopStatusPill.111', [])})`}
        >
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

        {/* Settlements Counter (Tap for Info) */}
        <button type="button"
          onClick={() => triggerInfo('settlements')}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={`${strings.stats.settlements} (${translate(state.locale, 'components.TopStatusPill.131', [])})`}
        >
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

        {/* Coalition Budget ₪ Counter & Income Rate (Tap for Info) */}
        <button type="button"
          onClick={() => triggerInfo('budget')}
          className="flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={`${strings.stats.budget} (${translate(state.locale, 'components.TopStatusPill.150', [])})`}
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-100 border border-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-baseline">
              <span
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
              {(state.incomeRate ?? 4) <= 0
                ? (translate(state.locale, 'components.TopStatusPill.180', []))
                : `+${state.incomeRate ?? 4}₪/${translate(state.locale, 'components.TopStatusPill.181', [])}`}
            </span>
          </div>
        </button>

      </div>

      {/* Lower Pill: surviving citizens & border readiness */}
      <div className="status-pill flex items-center justify-between w-full max-w-[340px] px-3 py-1 sm:py-1.5 rounded-full shadow-md gap-2 border border-amber-100/60 font-heebo">
        {/* Citizen Section (Tap for Info) */}
        <button type="button"
          onClick={() => triggerInfo('citizens')}
          className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
          title={`${strings.stats.citizens} (${translate(state.locale, 'components.TopStatusPill.194', [])})`}
        >
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

        {/* Border Readiness Section (Tap for Info) */}
        <button type="button"
          onClick={() => triggerInfo('border')}
          className="flex items-center gap-1 text-slate-700 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title={`${strings.stats.borderReadiness} (${translate(state.locale, 'components.TopStatusPill.224', [])})`}
        >
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

      {/* Floating Tap-to-Explain Info Popover Bubble (0px layout footprint) */}
      {state.infoPopover && (
        <div
          role="dialog" aria-modal="true" aria-label={state.infoPopover.title}
          onClick={(e) => {
            e.stopPropagation();
            dispatch?.({ type: 'CLEAR_INFO_POPOVER' });
          }}
          className="absolute top-full mt-1.5 inset-x-3 sm:inset-x-auto sm:w-[320px] z-50 p-2.5 sm:p-3 bg-slate-900/95 border-2 border-amber-400 text-white rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 cursor-pointer pointer-events-auto"
        >
          <div className="flex items-start justify-between gap-2 border-b border-amber-400/40 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 font-rubik">
              <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{state.infoPopover.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch?.({ type: 'CLEAR_INFO_POPOVER' });
              }}
              aria-label={translate(state.locale, 'components.ThreatCommand.63')}
              className="min-h-11 min-w-11 text-slate-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-200 font-heebo">
            {state.infoPopover.text}
          </p>
          <div className="mt-1 text-[9px] text-amber-400/80 text-end font-heebo">
            {translate(state.locale, 'components.TopStatusPill.274', [])}
          </div>
        </div>
      )}
    </div>
  );
};
