import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Whenever a new urgent news item arrives, display the floating alert
  useEffect(() => {
    if (!currentNews) return;

    if (isUrgent && currentNews.id !== dismissedNewsId) {
      setIsVisible(true);

      // Auto-dismiss after 4.5 seconds so it doesn't linger or overwhelm
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4500);

      return () => clearTimeout(timer);
    } else if (!isUrgent) {
      setIsVisible(false);
    }
  }, [currentNews?.id, isUrgent, dismissedNewsId]);

  if (!isVisible || !currentNews || !isUrgent) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedNewsId(currentNews.id);
    setIsVisible(false);
  };

  const handleOpenFeed = () => {
    dispatch({ type: 'OPEN_NEWS_MODAL' });
  };

  return (
    <div
      role="region"
      aria-live="assertive"
      className="absolute top-[138px] inset-x-3 z-40 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-3"
    >
      <div
        onClick={handleOpenFeed}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/95 via-red-900/95 to-red-950/95 border-2 border-red-500 shadow-2xl backdrop-blur-md p-3 text-white transition-all hover:border-amber-400 active:scale-[0.99]"
      >
        {/* Subtle pulsing background glow */}
        <div className="absolute inset-0 bg-red-600/15 animate-pulse pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative flex items-center justify-between gap-2 border-b border-red-700/60 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-[11px] font-black text-amber-300 tracking-wider uppercase font-rubik">
              {isHe ? 'התרעת חירום מבצעית' : 'OPERATIONAL EMERGENCY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-red-800/90 text-amber-200 px-2 py-0.5 rounded-md font-black border border-red-600/50">
              {currentNews.source}
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-red-300 hover:text-white hover:bg-white/20 transition-colors"
              title={isHe ? 'סגור התרעה' : 'Dismiss'}
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Full Headline Text - Zero Truncation Needed Here! */}
        <p className="relative text-xs sm:text-sm font-black text-white leading-relaxed font-heebo">
          {currentNews.headline}
        </p>

        {/* Footer info: Defense Level + Click hint */}
        <div className="relative flex items-center justify-between gap-2 mt-2 pt-1 text-[11px] border-t border-red-800/40">
          <span className="flex items-center gap-1 font-bold text-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>
              {isHe ? `הגנה בגבול: ${state.defenseScore}%` : `Border Defense: ${state.defenseScore}%`}
            </span>
          </span>

          <span className="font-extrabold text-amber-300 group-hover:text-amber-200 flex items-center gap-1 text-[10.5px]">
            <span>{isHe ? 'לדיווח המלא' : 'View Full Feed'}</span>
            {isHe ? (
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            ) : (
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
