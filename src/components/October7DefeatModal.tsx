import React from 'react';
import { Download, RotateCcw, Share2 } from 'lucide-react';
import { GameState, GameAction } from '../types';
import { he } from '../locales/he';
import { RunReport } from './RunReport';
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
      ? `שיחקתי בסימולטור ״נצחון מוחלט״: סיימתי עם ${state.settlementsCount} מאחזים, ${state.activeBreaches.length} פרצות ו-${Math.round(state.landHp)} חוסן. לא מצביעים בלי שמבינים את המחיר! שחקו גם:`
      : `I played the "Total Victory" Security Simulator: finished with ${state.settlementsCount} outposts, ${state.activeBreaches.length} gaps and ${Math.round(state.landHp)} HP. Play now:`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    const text = isHe
      ? `במשחק ״נצחון מוחלט״ סיימתי עם ${state.settlementsCount} מאחזים, ${state.activeBreaches.length} פרצות ו-${Math.round(state.landHp)} חוסן. לא מצביעים בלי שיודעים!`
      : `In the "Total Victory" simulation I finished with ${state.settlementsCount} outposts, ${state.activeBreaches.length} gaps and ${Math.round(state.landHp)} HP. Don't vote without knowing the cost!`;

    if (navigator.share) {
      navigator.share({ title: strings.gameTitle, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert(isHe ? 'הטקסט הועתק ללוח!' : 'Copied to clipboard!');
    }
  };

  const handleDownloadCard = () => {
    const title = isHe ? 'המחיר של פיזור הכוחות' : 'The cost of dispersed forces';
    const detail = isHe
      ? `${state.settlementsCount} מאחזים · ${state.activeBreaches.length} פרצות · ${Math.max(0, Math.round(state.landHp))}% חוסן`
      : `${state.settlementsCount} outposts · ${state.activeBreaches.length} breaches · ${Math.max(0, Math.round(state.landHp))}% resilience`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#172033"/><rect x="45" y="45" width="1110" height="540" rx="42" fill="#fff9f0"/><text x="600" y="210" text-anchor="middle" font-family="Arial" font-size="58" font-weight="700" fill="#b91c1c">${title}</text><text x="600" y="315" text-anchor="middle" font-family="Arial" font-size="40" fill="#334155">${detail}</text><text x="600" y="440" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#047857">${strings.slogan}</text><text x="600" y="510" text-anchor="middle" font-family="Arial" font-size="25" fill="#64748b">Total Victory · educational simulation</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'total-victory-result.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label={strings.modals.defeatTitle} className="modal-panel bg-[#fff9f0] border-4 border-red-700/80 w-full max-w-sm rounded-[32px] p-4 sm:p-5 shadow-2xl text-slate-800 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Massive 7 באוקטובר Header (Matching Yoni's Video Card) */}
        <div className="bg-[#fff1e0] border-2 border-red-400/60 rounded-2xl px-5 py-2.5 shadow-inner w-full">
          <h1 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight font-rubik drop-shadow-sm">
            {strings.modals.defeatTitle}
          </h1>
          <p className="text-xs font-bold text-red-900 mt-0.5 font-heebo">
            {strings.modals.defeatSubtitle}
          </p>
        </div>

        <p className="text-sm">{state.landHp <= 0
          ? (isHe ? 'החוסן הגיע לאפס. הפירוט מציג את הנזק ואת ההחלטות במשחק הזה.' : 'Resilience reached zero. Review the damage and decisions from this run.')
          : (isHe ? 'הגבול נותר חשוף וכפתור הנס נשבר. ההבטחה לא החליפה כוחות בשטח.' : 'The border remained exposed and the miracle button shattered. Its promise did not replace troops.')}</p>
        <RunReport state={state} />

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

        <button onClick={handleDownloadCard} className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 font-heebo">
          <Download className="w-4 h-4" />
          <span>{isHe ? 'הורדת כרטיס תוצאה' : 'Download result card'}</span>
        </button>

        {/* Action Buttons: Restart & Native Share */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => dispatch({ type: 'RESTART_GAME' })}
            className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 font-heebo"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isHe ? 'משחק חדש' : 'Play again'}</span>
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
