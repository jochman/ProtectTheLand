import { translate } from '../locales/translate';
import React, { useEffect } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { haptics } from '../utils/haptics';
import { lordOfHostsPromise, RULES } from '../game/rules';

interface LordOfHostsButtonProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const LordOfHostsButton: React.FC<LordOfHostsButtonProps> = ({ state, dispatch }) => {
  const strings = state.locale === 'he' ? he : en;
  const { lordOfHosts } = state;

  const isPanic = lordOfHosts.isPanicMashMode;
  const isCracked = lordOfHosts.isCracked;
  const tapCount = lordOfHosts.mashCount;
  const feedback = tapCount > 0
    ? strings.lordOfHosts.tapFeedback[Math.min(tapCount - 1, RULES.miracleTaps - 2)]
    : strings.lordOfHosts.panicMashPrompt;

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
      {lordOfHosts.piousToast && !isPanic && !isCracked && (
        <div
          onClick={() => dispatch({ type: 'DISMISS_TOAST' })}
          title={translate(state.locale, 'components.LordOfHostsButton.52', [])}
          className="absolute -top-14 z-30 px-3 py-1.5 bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs font-bold rounded-xl shadow-xl cursor-pointer flex items-center gap-1.5 max-w-[280px] text-center font-heebo"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>{lordOfHosts.piousToast}</span>
        </div>
      )}

      {/* The Messianic Button */}
      <button
        data-testid="lord-of-hosts"
        data-ready={isPanic}
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
        {/* The entire control is the fill; logical inset mirrors it in Hebrew. */}
        {!isCracked && (
          <span aria-hidden="true" data-testid="miracle-fill" className="miracle-fill"
            style={{ width: `${isPanic ? 100 : lordOfHosts.chargePercent}%` }} />
        )}
        {isPanic && tapCount > 0 && <span key={tapCount} aria-hidden="true" className="miracle-tap-flash" />}

        <div className="relative flex items-center justify-center gap-1.5">
          {isPanic ? (
            <Flame className="w-4 h-4 text-orange-800 animate-pulse" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-800" />
          )}

          <span className="text-sm font-black leading-tight tracking-wide">
            {isCracked ? strings.lordOfHosts.crackedText : strings.actions.lordOfHosts}
          </span>
        </div>

        {/* Compact progress gives way to escalating feedback once the button is operational. */}
        {!isCracked && (
          <div className="relative mt-0.5 flex flex-col items-center" aria-live="polite" aria-atomic="true">
            {isPanic ? (
              <>
                <span className="text-[10px] font-black leading-tight">{feedback}</span>
                <span className="miracle-tap-steps" aria-label={`${RULES.miracleTaps - tapCount} ${strings.lordOfHosts.tapsLeft}`}>
                  {Array.from({ length: RULES.miracleTaps }, (_, i) =>
                    <span key={i} aria-hidden="true" className={i < tapCount ? 'is-lit' : ''} />)}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-black leading-tight">{lordOfHostsPromise(state)}</span>
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
