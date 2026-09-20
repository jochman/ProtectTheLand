import React, { useEffect } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { haptics } from '../utils/haptics';

interface LordOfHostsButtonProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const LordOfHostsButton: React.FC<LordOfHostsButtonProps> = ({ state, dispatch }) => {
  const strings = state.locale === 'he' ? he : en;
  const { lordOfHosts } = state;

  const isPanic = lordOfHosts.isPanicMashMode;
  const isCracked = lordOfHosts.isCracked;

  // Auto-dismiss pious toast speech bubble after 3 seconds
  useEffect(() => {
    if (lordOfHosts.piousToast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_TOAST' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lordOfHosts.piousToast, dispatch]);

  const handleClick = () => {
    if (isCracked) return;
    if (isPanic) {
      haptics.warning();
      dispatch({ type: 'MASH_LORD_OF_HOSTS' });
    } else {
      haptics.light();
      dispatch({ type: 'CLICK_LORD_OF_HOSTS' });
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Pious Toast Speech Bubble */}
      {lordOfHosts.piousToast && (
        <div
          onClick={() => dispatch({ type: 'DISMISS_TOAST' })}
          title={state.locale === 'he' ? 'לחץ לסגירה' : 'Tap to dismiss'}
          className="absolute -top-14 z-30 px-3 py-1.5 bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs font-bold rounded-xl shadow-xl cursor-pointer flex items-center gap-1.5 max-w-[280px] text-center font-heebo"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>{lordOfHosts.piousToast}</span>
        </div>
      )}

      {/* The Messianic Button */}
      <button
        onClick={handleClick}
        disabled={isCracked || state.gameStatus !== 'playing'}
        className={`w-full py-1.5 sm:py-2 px-3 transition-all relative overflow-hidden ${
          isCracked
            ? 'bg-stone-500 border-stone-600 text-stone-300 cursor-not-allowed opacity-80 rounded-full border-2'
            : isPanic
            ? 'messianic-btn panic-mash'
            : 'messianic-btn'
        }`}
      >
        {/* Subtle background golden shimmer */}
        {!isCracked && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        )}

        <div className="flex items-center justify-center gap-1.5">
          {isPanic ? (
            <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-800" />
          )}

          <span className="text-sm font-black tracking-wide">
            {isCracked ? strings.lordOfHosts.crackedText : strings.actions.lordOfHosts}
          </span>
        </div>

        {/* Subtext with shifting requirement / fake countdown / progress */}
        {!isCracked && (
          <div className="mt-0.5 flex flex-col items-center">
            {isPanic ? (
              <span className="text-[10px] font-black text-white bg-black/40 px-2 py-0.5 rounded-full animate-pulse">
                {strings.lordOfHosts.panicMashPrompt} ({state.locale === 'he' ? `עוד ${7 - lordOfHosts.mashCount} לחיצות` : `${7 - lordOfHosts.mashCount} taps left`})
              </span>
            ) : lordOfHosts.countdownSeconds !== null ? (
              <span className="text-[10px] font-bold text-red-950 bg-white/40 px-2 py-0.5 rounded-full">
                {strings.lordOfHosts.stage4Countdown} 00:{lordOfHosts.countdownSeconds < 10 ? '0' : ''}
                {lordOfHosts.countdownSeconds}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-950/90">
                <span title={lordOfHosts.stageGoalText}>{state.locale === 'he' ? 'הבטחת גאולה' : 'Promise of redemption'}</span>
                <span className="bg-white/50 px-1.5 py-0.2 rounded-full font-black text-amber-900">
                  {lordOfHosts.chargePercent}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Visual Crack Overlay on Shatter */}
        {isCracked && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 40">
            <path
              d="M 10 20 L 60 15 L 90 25 L 130 12 L 180 28"
              stroke="#1c1917"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
};
