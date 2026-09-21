import React from 'react';
import { AlertTriangle, Radio } from 'lucide-react';
import { GameState } from '../types';

interface NewsAlertTickerProps {
  state: GameState;
}

export const NewsAlertTicker: React.FC<NewsAlertTickerProps> = ({ state }) => {
  if (!state.currentNews) return null;

  const isUrgent = Boolean(state.currentNews.isUrgent);
  const isHe = state.locale === 'he';

  return (
    <div className="px-3 py-0.5 z-20 w-full h-[36px] min-h-[36px] max-h-[36px] sm:h-[40px] sm:min-h-[40px] sm:max-h-[40px] flex-shrink-0">
      <div
        role="status"
        className={`flex items-center gap-2 px-3 py-1 rounded-2xl border text-xs shadow-md select-none h-full w-full overflow-hidden ${
          isUrgent
            ? 'bg-red-600/95 text-white border-red-400 shadow-red-500/20'
            : 'bg-white/95 text-slate-800 border-amber-200/80 backdrop-blur-md'
        }`}
      >
        <div className="flex-shrink-0">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
          ) : (
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          )}
        </div>

        {/* Truncated single-line headline with clickable indicator */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 font-heebo overflow-hidden">
          <span
            className={`font-black text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap ${
              isUrgent
                ? 'bg-red-800 text-amber-200'
                : 'bg-amber-100 text-amber-900 border border-amber-300/60'
            }`}
          >
            {isHe ? (state.currentNews.sourceHe || state.currentNews.source) : (state.currentNews.sourceEn || state.currentNews.source)}
          </span>
          <span className="font-semibold text-xs tracking-tight truncate flex-1 min-w-0">
            {isHe ? (state.currentNews.headlineHe || state.currentNews.headline) : (state.currentNews.headlineEn || state.currentNews.headline)}
          </span>
        </div>
      </div>
    </div>
  );
};
