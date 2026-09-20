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

  const isHe = state.locale === 'he';

  const handleWhatsAppShare = () => {
    const text = isHe
      ? `שיחקתי בסימולטור ״7 באוקטובר״: ניסיתי להגן על ${state.settlementsCount} מאחזים במחיר דילול הגבול. התוצאה: קריסה ביטחונית ו-7 באוקטובר. לא מצביעים בלי שמבינים את המחיר! שחקו גם:`
      : `I played the "October 7" Security Simulator: deployed troops to secure ${state.settlementsCount} outposts at the expense of border defense. Result: total catastrophe. Play now:`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    const text = isHe
      ? `במשחק סימולציית הביטחון ניסיתי להגן על ${state.settlementsCount} מאחזים... התוצאה: קריסת קווי הגבול ו-7 באוקטובר. לא מצביעים בלי שיודעים!`
      : `In the Security Simulation I built ${state.settlementsCount} outposts... resulting in border collapse and October 7th. Don't vote without knowing the cost!`;

    if (navigator.share) {
      navigator.share({ title: strings.gameTitle, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(isHe ? 'הטקסט הועתק ללוח!' : 'Copied to clipboard!');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#fff9f0] border-4 border-red-700/80 w-full max-w-sm rounded-[32px] p-4 sm:p-5 shadow-2xl text-slate-800 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95 duration-300 max-h-[94dvh] overflow-y-auto">
        
        {/* Massive 7 באוקטובר Header (Matching Yoni's Video Card) */}
        <div className="bg-[#fff1e0] border-2 border-red-400/60 rounded-2xl px-5 py-2.5 shadow-inner w-full">
          <h1 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight font-rubik drop-shadow-sm">
            {strings.modals.defeatTitle}
          </h1>
          <p className="text-xs font-bold text-red-900 mt-0.5 font-heebo">
            {strings.modals.defeatSubtitle}
          </p>
        </div>

        {/* Analytical Explanation */}
        <p className="text-xs leading-relaxed text-slate-700 px-1 font-heebo">
          {strings.modals.defeatBody}
        </p>

        {/* Choice-based Post-Mortem Timeline Breakdown */}
        <div className="w-full bg-red-50/80 rounded-2xl p-2.5 border border-red-200 text-start flex flex-col gap-1.5 text-[11px] font-heebo">
          <span className="font-black text-red-950 text-xs font-rubik border-b border-red-200/80 pb-1 flex items-center gap-1">
            <span>⏱️</span>
            <span>{isHe ? 'שרשרת ההחלטות שהובילה לקריסה:' : 'Chain of decisions that caused collapse:'}</span>
          </span>
          <div className="flex items-start gap-1.5 text-slate-700">
            <span className="text-red-600 font-bold">•</span>
            <span>
              {isHe
                ? `הקמת ${state.settlementsCount} מאחזים מבודדים על גבעות יו״ש.`
                : `Built ${state.settlementsCount} isolated hilltop outposts in the West Bank.`}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-700">
            <span className="text-red-600 font-bold">•</span>
            <span>
              {isHe
                ? `הסטת ${state.soldiersAtSettlements} לוחמים מהגבול לשמירה על התנחלויות (${state.soldiersAtBorder} נותרו בגבול).`
                : `Diverted ${state.soldiersAtSettlements} soldiers to guard settlements (${state.soldiersAtBorder} left at border).`}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-700">
            <span className="text-red-600 font-bold">•</span>
            <span>
              {isHe
                ? `גיוס ${3 - state.reservesBatchesLeft}/3 סבבי מילואים שפגעו בפעילות המשק.`
                : `Mobilized ${3 - state.reservesBatchesLeft}/3 reserve batches, disrupting civilian economy.`}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-700">
            <span className="text-red-600 font-bold">•</span>
            <span>
              {isHe
                ? `הסתמכות על כפתור ״יהוה צבאות״ (${state.lordOfHosts.mashCount} לחיצות) במקום אסטרטגיה.`
                : `Relied on "Lord of Hosts" button (${state.lordOfHosts.mashCount} taps) instead of strategy.`}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-red-800 font-bold">
            <span className="text-red-600 font-black">💥</span>
            <span>
              {isHe
                ? `קריסת הגבול: ${state.activeBreaches.length} פרצות נפתחו במקביל ללא כוחות בלימה.`
                : `Border collapse: ${state.activeBreaches.length} breach points opened with no defense forces.`}
            </span>
          </div>
        </div>

        {/* Policy Outcome Breakdown Stats */}
        <div className="w-full bg-white rounded-2xl p-2.5 border border-amber-200 shadow-sm flex flex-col gap-1.5 text-xs">
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
        <div className="bg-emerald-800 text-emerald-100 font-black text-xs sm:text-sm px-4 py-2 rounded-xl tracking-wide shadow-sm w-full font-rubik">
          {strings.slogan}
        </div>

        {/* 1-Click WhatsApp Share Button */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#1ebd59] active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 font-heebo"
        >
          <span className="text-base">💬</span>
          <span>{isHe ? 'שתף בוואטסאפ (WhatsApp)' : 'Share to WhatsApp'}</span>
        </button>

        {/* Action Buttons: Restart & Native Share */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => dispatch({ type: 'RESTART_GAME' })}
            className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 font-heebo"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{strings.modals.restartBtn}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 font-bold rounded-2xl shadow-sm transition-all"
            title={strings.modals.shareBtn}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
