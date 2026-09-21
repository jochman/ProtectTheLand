import { translate } from '../locales/translate';
import React from 'react';
import { AlertTriangle, Radio, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameAction, GameState } from '../types';

interface NewsAlertTickerProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const NewsAlertTicker: React.FC<NewsAlertTickerProps> = ({ state, dispatch }) => {
  if (!state.currentNews) return null;

  const isUrgent = Boolean(state.currentNews.isUrgent);
  const isHe = state.locale === 'he';

  return (
    <div className="px-3 py-0.5 z-20 w-full h-[36px] min-h-[36px] max-h-[36px] sm:h-[40px] sm:min-h-[40px] sm:max-h-[40px] flex-shrink-0">
      <div
        role="button" tabIndex={0}
        aria-label={translate(state.locale, 'news.open')}
        onClick={() => dispatch({ type: 'OPEN_NEWS_MODAL' })}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); dispatch({ type: 'OPEN_NEWS_MODAL' }); } }}
        className={`group flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border px-3 py-1 text-xs shadow-md transition-all duration-200 select-none h-full w-full hover:border-amber-400 hover:shadow-lg active:scale-[0.98] ${
          isUrgent
            ? 'bg-red-600/95 text-white border-red-400 shadow-red-500/20 hover:bg-red-600'
            : 'bg-white/95 text-slate-800 border-amber-200/80 backdrop-blur-md hover:bg-amber-50/60'
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
        <div className="flex flex-shrink-0 items-center gap-0.5 whitespace-nowrap text-slate-400 transition-colors group-hover:text-amber-700">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden text-[10px] font-extrabold xs:inline">{translate(state.locale, 'news.feed')}</span>
          {isHe ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </div>
      </div>
    </div>
  );
};
