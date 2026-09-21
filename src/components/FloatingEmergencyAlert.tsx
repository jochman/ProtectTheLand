import { translate } from '../locales/translate';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { GameState, GameAction } from '../types';

interface FloatingEmergencyAlertProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const FloatingEmergencyAlert: React.FC<FloatingEmergencyAlertProps> = ({ state, dispatch }) => {
  const [dismissedNewsId, setDismissedNewsId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const currentNews = state.currentNews;
  const isUrgent = Boolean(currentNews?.isUrgent);
  const isHe = state.locale === 'he';
  const hasActiveAttacks = (state.greenSideAttacks || []).length > 0;

  // ONLY display the floating alert for active hostile raids (drastically reduces popup spam!)
  useEffect(() => {
    if (!currentNews) return;

    if (hasActiveAttacks && isUrgent && currentNews.id !== dismissedNewsId) {
      setIsVisible(true);

      // Auto-dismiss after 6 seconds so it never lingers on screen
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);

      return () => clearTimeout(timer);
    } else if (!hasActiveAttacks || !isUrgent) {
      setIsVisible(false);
    }
  }, [currentNews?.id, isUrgent, dismissedNewsId, hasActiveAttacks]);

  if (!isVisible || !currentNews || !hasActiveAttacks) return null;

  const handleDismiss = () => {
    setDismissedNewsId(currentNews.id);
    setIsVisible(false);
  };

  const firstAttack = (state.greenSideAttacks || [])[0];

  return (
    <div
      role="region"
      aria-live="assertive"
      className="absolute top-[138px] inset-x-3 z-40 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-3"
    >
      {/* Tapping anywhere on the popup card IMMEDIATELY dismisses it! */}
      <div
        onClick={handleDismiss}
        title={translate(state.locale, 'components.FloatingEmergencyAlert.55', [])}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/95 via-red-900/95 to-red-950/95 border-2 border-red-500 shadow-2xl backdrop-blur-md p-2.5 sm:p-3 text-white transition-all hover:border-amber-400 active:scale-[0.99]"
      >
        {/* Subtle pulsing background glow */}
        <div className="absolute inset-0 bg-red-600/15 animate-pulse pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative flex items-center justify-between gap-2 border-b border-red-700/60 pb-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-[11px] font-black text-amber-300 tracking-wider uppercase font-rubik">
              {translate(state.locale, 'components.FloatingEmergencyAlert.70', [])}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] bg-red-800/90 text-amber-200 px-2 py-0.5 rounded-md font-black border border-red-600/50">
              {isHe ? (currentNews.sourceHe || currentNews.source) : (currentNews.sourceEn || currentNews.source)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="p-1 rounded-full text-red-300 hover:text-white hover:bg-white/20 transition-colors text-xs font-bold"
              title={translate(state.locale, 'components.FloatingEmergencyAlert.84', [])}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Full Headline Text */}
        <p className="relative text-xs font-bold text-white leading-tight font-heebo">
          {isHe ? (currentNews.headlineHe || currentNews.headline) : (currentNews.headlineEn || currentNews.headline)}
        </p>

        {/* Direct Action Button to Intercept (Stops propagation from dismissal) */}
        {firstAttack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'SEAL_BREACH', checkpointId: firstAttack.breachId });
              handleDismiss();
            }}
            className="mt-2 w-full py-1.5 px-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-98 border border-amber-300 rounded-xl font-black text-xs text-white shadow-lg flex items-center justify-center gap-1.5 animate-pulse cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
            <span>{translate(state.locale, 'components.FloatingEmergencyAlert.108', [])}</span>
          </button>
        )}

        {/* Footer info: Tap anywhere hint */}
        <div className="relative flex items-center justify-between gap-2 mt-1.5 pt-1 text-[10px] border-t border-red-800/40 text-red-300">
          <span className="flex items-center gap-1 font-bold">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>
              {translate(state.locale, 'components.FloatingEmergencyAlert.117', [state.defenseScore])}
            </span>
          </span>

          <span className="text-[10px] text-amber-300/90 font-medium">
            {translate(state.locale, 'components.FloatingEmergencyAlert.122', [])}
          </span>
        </div>
      </div>
    </div>
  );
};
