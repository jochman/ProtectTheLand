import { translate } from '../locales/translate';
import React from 'react';
import { X, Radio, MessageSquare } from 'lucide-react';
import { GameState, GameAction, NewsItem } from '../types';

interface NewsFeedModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const NewsFeedModal: React.FC<NewsFeedModalProps> = ({ state, dispatch }) => {
  if (!state.isNewsModalOpen) return null;

  const current = state.currentNews;
  const history = state.newsHistory || [];
  const isHe = state.locale === 'he';

  const getCategoryBadge = (category?: NewsItem['category']) => {
    switch (category) {
      case 'politics':
        return { label: translate(state.locale, 'components.NewsFeedModal.20', []), color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'celebs':
        return { label: translate(state.locale, 'components.NewsFeedModal.22', []), color: 'bg-pink-100 text-pink-900 border-pink-300' };
      case 'rabbis':
        return { label: translate(state.locale, 'components.NewsFeedModal.24', []), color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'military':
      default:
        return { label: translate(state.locale, 'components.NewsFeedModal.27', []), color: 'bg-red-100 text-red-900 border-red-300' };
    }
  };

  return (
    <div
      onClick={() => dispatch({ type: 'CLOSE_NEWS_MODAL' })}
      className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 cursor-pointer animate-in fade-in duration-200"
    >
      <div
        role="dialog" aria-modal="true" aria-label={isHe ? 'חדשות' : 'News'}
        onClick={(e) => e.stopPropagation()}
        className="bg-amber-50/98 border-2 border-amber-300/80 w-full max-w-sm rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-800 flex flex-col gap-3.5 max-h-[88vh] cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Radio className="w-5 h-5 text-red-600 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-rubik flex items-center gap-1.5">
                {translate(state.locale, 'components.NewsFeedModal.52', [])}
              </h3>
              <p className="text-[10px] text-slate-500 font-heebo">
                {translate(state.locale, 'components.NewsFeedModal.55', [])}
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_NEWS_MODAL' })}
            className="p-1.5 rounded-full hover:bg-amber-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Current Breaking News Card */}
        {current && (
          <div className="bg-white rounded-2xl p-4 border border-amber-200/90 shadow-md flex flex-col gap-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${getCategoryBadge(current.category).color}`}>
                  {getCategoryBadge(current.category).label}
                </span>
                <span className="font-extrabold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60">
                  {isHe ? (current.sourceHe || current.source) : (current.sourceEn || current.source)}
                </span>
              </div>
              <span className="text-slate-400 text-[10px] font-mono">
                {current.timestamp || (translate(state.locale, 'components.NewsFeedModal.80', []))}
              </span>
            </div>

            {/* Big Headline */}
            <p className="text-sm font-black text-slate-900 leading-snug font-heebo">
              {isHe ? (current.headlineHe || current.headline) : (current.headlineEn || current.headline)}
            </p>
          </div>
        )}

        {/* History Feed List */}
        <div className="flex flex-col gap-1.5 min-h-0 flex-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              {translate(state.locale, 'components.NewsFeedModal.96', [])}
            </span>
            <span className="text-[10px] text-slate-400">
              {history.length} {translate(state.locale, 'components.NewsFeedModal.99', [])}
            </span>
          </div>

          <div className="overflow-y-auto max-h-[32vh] space-y-2 pr-1 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                {translate(state.locale, 'components.NewsFeedModal.106', [])}
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white/80 hover:bg-white rounded-xl p-2.5 border border-amber-200/60 text-xs transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {isHe ? (item.sourceHe || item.source) : (item.sourceEn || item.source)}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {item.timestamp || (translate(state.locale, 'components.NewsFeedModal.119', []))}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {isHe ? (item.headlineHe || item.headline) : (item.headlineEn || item.headline)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Dismiss */}
        <button
          onClick={() => dispatch({ type: 'CLOSE_NEWS_MODAL' })}
          className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-2xl text-xs transition-colors shadow-sm"
        >
          {translate(state.locale, 'components.NewsFeedModal.136', [])}
        </button>
      </div>
    </div>
  );
};
