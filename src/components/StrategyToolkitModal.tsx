import React from 'react';
import { BookOpen, Check, Eye, X } from 'lucide-react';
import { GameAction, GameState } from '../types';
import { objective, medals } from '../game/rules';

interface Props { state: GameState; dispatch: React.Dispatch<GameAction>; }

export const StrategyToolkitModal: React.FC<Props> = ({ state, dispatch }) => {
  if (!state.isToolkitOpen) return null;
  const he = state.locale === 'he';
  const rows = he
    ? [['בניית מאחז', 'מימון פוליטי', 'דורש אבטחה קבועה'], ['הסטת חייל', 'הגנת מאחז', 'גזרת גבול נפתחת'], ['מילואים', '+4 לוחמים', 'פוגע בקצב המשק'], ['פינוי', 'קיצור קווים', 'ויתור על המאחז']]
    : [['Build outpost', 'Political funding', 'Needs a standing guard'], ['Deploy troop', 'Protects outpost', 'Opens a border sector'], ['Call reserves', '+4 troops', 'Slows civilian economy'], ['Evacuate', 'Shorter lines', 'Gives up the outpost']];
  return <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3" onClick={() => dispatch({ type: 'CLOSE_TOOLKIT' })}>
    <section role="dialog" aria-modal="true" aria-label={he ? 'שולחן אסטרטגיה' : 'Strategy desk'} className="modal-panel w-full max-w-md rounded-3xl border-2 border-amber-400 bg-[#fffaf2] p-4 text-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
        <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-700" /><h2 className="font-black font-rubik">{he ? 'שולחן האסטרטגיה' : 'Strategy desk'}</h2></div>
        <button className="min-h-11 min-w-11" onClick={() => dispatch({ type: 'CLOSE_TOOLKIT' })} aria-label={he ? 'סגור' : 'Close'}><X className="w-5 h-5" /></button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600">{he ? 'זהו מודל לימודי וסאטירי, לא תחזית או שחזור היסטורי. כללים כגון עלות, חוסן וקצב חדירה הם הנחות משחק מפורשות שנועדו להמחיש מחסור בכוח אדם.' : 'This is an educational, satirical model—not a forecast or historical reconstruction. Costs, resilience, and raid timing are explicit game assumptions used to illustrate finite manpower.'}</p>
      <a href="https://x.com/YoniHaimovich/status/2101197799173873977" target="_blank" rel="noreferrer" className="mt-1.5 block text-[11px] font-bold text-blue-700 underline">{he ? 'מקור השראה ומתודולוגיה: ניתוח ההשראה המקורי' : 'Inspiration & methodology: original analysis'}</a>
      <div className="mt-3 overflow-hidden rounded-2xl border border-amber-200 text-[11px]">
        <div className="grid grid-cols-3 bg-amber-100 p-2 font-black"><span>{he ? 'בחירה' : 'Choice'}</span><span>{he ? 'רווח' : 'Gain'}</span><span>{he ? 'מחיר' : 'Cost'}</span></div>
        {rows.map(row => <div key={row[0]} className="grid grid-cols-3 border-t border-amber-100 p-2"><span className="font-bold">{row[0]}</span><span>{row[1]}</span><span className="text-red-700">{row[2]}</span></div>)}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100 p-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-bold"><Eye className="w-4 h-4" />{he ? 'הפחתת תנועה והבהובים' : 'Reduce motion and flashing'}</span>
        <button onClick={() => dispatch({ type: 'TOGGLE_REDUCE_MOTION' })} className={`rounded-lg px-2 py-1 font-black ${state.reduceMotion ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>{state.reduceMotion ? <Check className="w-4 h-4" /> : he ? 'כבוי' : 'Off'}</button>
      </div>
      <h3 className="mt-4 text-sm font-black">{he ? 'מטרת המשחק' : 'Game objective'}</h3>
      <p className="mt-2 text-xs font-bold">{objective(state)}</p>
      <ul className="mt-2 space-y-1 text-xs">{medals(state).map(m => <li key={m.label}>🏅 {m.label}</li>)}</ul>
    </section>
  </div>;
};
