import React from 'react';
import { RotateCcw, Share2 } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { en } from '../locales/en';

interface October7DefeatModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const October7DefeatModal: React.FC<October7DefeatModalProps> = ({ state, dispatch }) => {
  if (state.gameStatus !== 'catastrophe') return null;

  const strings = state.locale === 'he' ? he : en;

  const handleShare = () => {
    const text = state.locale === 'he'
      ? `במשחק סימולציית הביטחון ניסיתי להגן על ${state.settlementsCount} מאחזים... התוצאה: קריסת קווי הגבול ו-7 באוקטובר. לא מצביעים בלי שיודעים!`
      : `In the Security Simulation I built ${state.settlementsCount} outposts... resulting in border collapse and October 7th. Don't vote without knowing the cost!`;

    if (navigator.share) {
      navigator.share({ title: strings.gameTitle, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(state.locale === 'he' ? 'הטקסט הועתק ללוח!' : 'Copied to clipboard!');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#fff9f0] border-4 border-red-700/80 w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-slate-800 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Massive 7 באוקטובר Header (Matching Yoni's Video Card) */}
        <div className="bg-[#fff1e0] border-2 border-red-400/60 rounded-2xl px-6 py-3 shadow-inner w-full">
          <h1 className="text-3xl font-black text-red-700 tracking-tight font-rubik drop-shadow-sm">
            {strings.modals.defeatTitle}
          </h1>
          <p className="text-xs font-bold text-red-900 mt-1 font-heebo">
            {strings.modals.defeatSubtitle}
          </p>
        </div>

        {/* Analytical Explanation */}
        <p className="text-xs leading-relaxed text-slate-700 px-1 font-heebo">
          {strings.modals.defeatBody}
        </p>

        {/* Policy Outcome Breakdown */}
        <div className="w-full bg-white rounded-2xl p-3 border border-amber-200 shadow-sm flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>{strings.modals.statSettlements}</span>
            <span className="font-black text-slate-900 text-sm font-rubik">{state.settlementsCount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>{strings.modals.statTroopsLost}</span>
            <span className="font-black text-red-600 text-sm font-rubik">{state.activeBreaches.length} מתוך 8</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>{strings.modals.statReservesSpent}</span>
            <span className="font-black text-amber-700 text-sm font-rubik">{3 - state.reservesBatchesLeft} מתוך 3</span>
          </div>
        </div>

        {/* The Civic Movement Slogan */}
        <div className="bg-emerald-800 text-emerald-100 font-black text-sm px-4 py-2 rounded-xl tracking-wide shadow-sm w-full font-rubik">
          {strings.slogan}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full pt-1">
          <button
            onClick={() => dispatch({ type: 'RESTART_GAME' })}
            className="flex-1 py-3 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 font-heebo"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{strings.modals.restartBtn}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold rounded-2xl shadow-sm transition-all"
            title={strings.modals.shareBtn}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
