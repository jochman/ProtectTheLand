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
  const close = () => dispatch({ type: 'CLOSE_NEWS_MODAL' });
  const categoryBadge = (category?: NewsItem['category']) => {
    switch (category) {
      case 'politics': return { label: translate(state.locale, 'news.politics'), color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'celebs': return { label: translate(state.locale, 'news.celebs'), color: 'bg-pink-100 text-pink-900 border-pink-300' };
      case 'rabbis': return { label: translate(state.locale, 'news.faith'), color: 'bg-amber-100 text-amber-900 border-amber-300' };
      default: return { label: translate(state.locale, 'news.defense'), color: 'bg-red-100 text-red-900 border-red-300' };
    }
  };

  return (
    <div onClick={close} className="absolute inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-5">
      <section role="dialog" aria-modal="true" aria-label={translate(state.locale, 'news.title')} onClick={event => event.stopPropagation()}
        className="modal-panel flex max-h-[88vh] w-full max-w-sm cursor-default flex-col gap-3.5 rounded-3xl border-2 border-amber-300/80 bg-amber-50/98 p-4 text-slate-800 shadow-2xl sm:p-5">
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Radio className="h-5 w-5 animate-pulse text-red-600" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{translate(state.locale, 'news.center')}</h2>
              <p className="text-[10px] text-slate-500">{translate(state.locale, 'news.subtitle')}</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label={translate(state.locale, 'news.close')}
            className="grid min-h-11 min-w-11 place-items-center rounded-full text-slate-500 hover:bg-amber-200 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </div>

        {current && (
          <article className="flex flex-col gap-2.5 rounded-2xl border border-amber-200/90 bg-white p-4 shadow-md">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${categoryBadge(current.category).color}`}>{categoryBadge(current.category).label}</span>
                <span className="rounded-md border border-amber-300/60 bg-amber-100/80 px-2 py-0.5 font-extrabold text-amber-900">
                  {isHe ? (current.sourceHe || current.source) : (current.sourceEn || current.source)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{current.timestamp || translate(state.locale, 'news.now')}</span>
            </div>
            <p className="text-sm font-black leading-snug text-slate-900">
              {isHe ? (current.headlineHe || current.headline) : (current.headlineEn || current.headline)}
            </p>
          </article>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-slate-600"><MessageSquare className="h-3.5 w-3.5" />{translate(state.locale, 'news.recent')}</span>
            <span className="text-[10px] text-slate-400">{history.length} {translate(state.locale, 'news.updates')}</span>
          </div>
          <div className="max-h-[32vh] space-y-2 overflow-y-auto pe-1 custom-scrollbar">
            {history.length === 0 ? <div className="py-6 text-center text-xs text-slate-400">{translate(state.locale, 'news.empty')}</div>
              : history.map((item, index) => (
                <article key={item.id || index} className="flex flex-col gap-1 rounded-xl border border-amber-200/60 bg-white/80 p-2.5 text-xs">
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">{isHe ? (item.sourceHe || item.source) : (item.sourceEn || item.source)}</span>
                    <span className="text-slate-400">{item.timestamp || translate(state.locale, 'news.earlier')}</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-slate-800">{isHe ? (item.headlineHe || item.headline) : (item.headlineEn || item.headline)}</p>
                </article>
              ))}
          </div>
        </div>

        <button type="button" onClick={close} className="min-h-11 w-full rounded-2xl bg-slate-200 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-300">
          {translate(state.locale, 'news.back')}
        </button>
      </section>
    </div>
  );
};
