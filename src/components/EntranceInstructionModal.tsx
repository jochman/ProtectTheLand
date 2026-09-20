import React from 'react';
import { Shield, AlertTriangle, Building2, Award, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameState, GameAction } from '../types';

interface EntranceInstructionModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const EntranceInstructionModal: React.FC<EntranceInstructionModalProps> = ({ state, dispatch }) => {
  if (!state.isIntroModalOpen) return null;

  const isHe = state.locale === 'he';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-heebo animate-in fade-in duration-200">
      <div className="bg-[#fffdf9] border-4 border-amber-600/70 w-full max-w-md rounded-[32px] p-4 sm:p-5 shadow-2xl text-slate-800 flex flex-col gap-3.5 my-auto max-h-[92dvh] overflow-y-auto">
        
        {/* Top Header with Close Button */}
        <div className="flex items-start justify-between border-b border-amber-200 pb-2.5">
          <div className="flex flex-col text-start">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🇮🇱</span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-rubik tracking-tight">
                {isHe ? '7 באוקטובר: איך משחקים?' : 'October 7th: How to Play'}
              </h2>
            </div>
            <p className="text-xs font-black text-amber-800 mt-0.5">
              {isHe ? 'לא מצביעים בלי שיודעים את המחיר.' : "Don't vote without knowing the cost."}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'CLOSE_INTRO_MODAL' })}
            className="p-1.5 rounded-full hover:bg-amber-100 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Core Strategic Dilemma Callout */}
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3 text-start flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 font-rubik">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{isHe ? 'מטרת המשחק והדילמה הלאומית:' : 'Game Objective & The Core Dilemma:'}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {isHe
              ? 'אתם מקבלי ההחלטות של ישראל. עליכם לתמרן בין לחצים פוליטיים להקמת מאחזים ביו״ש לבין ביצור הגבול הריבוני. זכרו: כל חייל שנשלח לאבטח גבעה מבודדת — נגרע ממוצבי הגבול הריבוני!'
              : 'You are the policymaker. Balance political pressure to establish West Bank outposts against securing sovereign borders. Remember: every soldier diverted to a remote hilltop leaves a hole in sovereign border defense!'}
          </p>
        </div>

        {/* 4 Gameplay Steps */}
        <div className="flex flex-col gap-2 text-start text-xs">
          
          {/* Step 1: Building Outposts */}
          <div className="bg-white border border-amber-200 rounded-2xl p-2.5 shadow-sm flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 font-rubik text-xs flex items-center gap-1">
                <span>1.</span>
                <span>{isHe ? 'הקמת מאחזים (100₪)' : 'Build Outposts (₪100)'}</span>
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                {isHe
                  ? 'לחץ על "בניית יישוב" ובחר גבעה ריקה בשומרון. מאחזים מניבים תקציב קואליציוני שוטף.'
                  : 'Tap "Build Outpost" and pick an empty hilltop. Outposts generate coalition budget income.'}
              </p>
            </div>
          </div>

          {/* Step 2: Deploying Troops */}
          <div className="bg-white border border-amber-200 rounded-2xl p-2.5 shadow-sm flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 font-rubik text-xs flex items-center gap-1">
                <span>2.</span>
                <span>{isHe ? 'פריסת כוחות (עלות 25₪ לחייל)' : 'Deploy Troops (Costs ₪25 per troop)'}</span>
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                {isHe
                  ? 'מאחז חשוף מותקף בעימותים וגורר קנסות. אך העברת חייל מהגבול פוערת פרצה מסוכנת בגדר!'
                  : 'Exposed outposts get damaged and penalized. But shifting troops leaves dangerous gaps in the border fence!'}
              </p>
            </div>
          </div>

          {/* Step 3: Land HP & Border Defense */}
          <div className="bg-white border border-red-200 rounded-2xl p-2.5 shadow-sm flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 font-rubik text-xs flex items-center gap-1">
                <span>3.</span>
                <span>{isHe ? 'חוסן המדינה (Land HP) ובלימת חדירות' : 'Homeland HP & Intercepting Raids'}</span>
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                {isHe
                  ? 'כל פרצה פתוחה מדממת את חוסן המדינה (0.4- נק\' לשנייה)! חוליות עוינות חודרות לערי העורף (20%- חוסן). בלום חדירות ע״י לחיצה על הפרצה, החזרת לוחם או מילואים.'
                  : 'Unsealed gaps bleed Homeland HP (-0.4 HP/s)! Hostile squads raid border cities (-20% HP). Intercept them by tapping the gap, recalling soldiers, or calling reserves.'}
              </p>
            </div>
          </div>

          {/* Step 4: Game Endings */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-2.5 shadow-sm flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 font-rubik text-xs flex items-center gap-1">
                <span>4.</span>
                <span>{isHe ? 'איך מנצחים? ואיך נמנעים מתבוסה?' : 'How to Win vs How You Lose'}</span>
              </span>
              <div className="text-[11px] text-slate-600 mt-0.5 flex flex-col gap-0.5 leading-tight">
                <div>
                  <span className="font-bold text-red-700">❌ {isHe ? 'תבוסה (7 באוקטובר):' : 'Defeat (Oct 7):'} </span>
                  <span>{isHe ? 'חוסן המדינה צונח ל-0% או לחיצה 7 פעמים בפאניקה על כפתור האשליה "יהוה צבאות".' : 'Homeland HP hits 0% or mashing the false miracle "Lord of Hosts" button 7 times.'}</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-700">🏆 {isHe ? 'ניצחון בר-קיימא:' : 'Rational Victory:'} </span>
                  <span>{isHe ? 'בנה 3 מאחזים, חווה את הקושי, קבל החלטה לפנות מאחזים (עד 2 נותרים) ובצר את כל 8 מוצבי הגבול ל-100%!' : 'Build 3 outposts, experience the crisis, then evacuate back (≤2 outposts) and restore 100% border defense!'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Big Start Button */}
        <button
          onClick={() => dispatch({ type: 'CLOSE_INTRO_MODAL' })}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 font-rubik"
        >
          <CheckCircle2 className="w-5 h-5 text-amber-200" />
          <span>{isHe ? 'הבנתי, בואו נתחיל לשחק!' : "Understood, Let's Play!"}</span>
        </button>

        {/* Tip on how to reopen */}
        <p className="text-[10px] text-center text-slate-500 font-medium -mt-1">
          {isHe
            ? '💡 טיפ: ניתן לפתוח מדריך זה בכל שלב באמצעות כפתור ה-❓ בסרגל העליון.'
            : '💡 Tip: You can reopen this guide anytime via the ❓ button in the top bar.'}
        </p>
      </div>
    </div>
  );
};
