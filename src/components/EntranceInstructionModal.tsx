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
                {isHe ? 'נצחון מוחלט: איך משחקים?' : 'Total Victory: How to Play'}
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

        {/* The Stated Gameplay Objective */}
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3 text-start flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 font-rubik">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{isHe ? 'המטרה הלאומית: כיבוש מדינת ישראל והבאת הגאולה לארצנו!' : 'The National Mission: Total Conquest & Bringing Redemption!'}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {isHe
              ? 'אתם מנהיגי המערכה. המשימה שלכם: ליישב את כל גבעות השומרון, להוביל את כיבוש מדינת ישראל והבאת הגאולה לארצנו, ולאבטח את המאחזים כדי לקרב את ״יהוה צבאות״ (100%) ולהביא נצחון מוחלט! אך היזהרו: כל חייל שנעקר מהגבול פוער פרצה מסוכנת...'
              : 'You lead the campaign. Your mission: settle every hilltop, lead the conquest of the land and bring redemption, and secure the outposts to awaken "Lord of Hosts" (100%) for Total Victory! But beware: every troop pulled from the border leaves a dangerous gap...'}
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
                  : 'Tap "Build Outpost" and select an empty hilltop. Outposts generate steady coalition funding.'}
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
                  ? 'מאחז חשוף ללא חייל נפגע בעימותים. אך העברת חייל מהגבול פוערת פרצה מסוכנת בגדר!'
                  : 'Ungarrisoned outposts get damaged in clashes. But shifting troops opens dangerous gaps in the border fence!'}
              </p>
            </div>
          </div>

          {/* Step 3: Land HP & Interception */}
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
                  ? 'פרצות בגבול מדממות את חוסן המדינה (0.4- נק\' לשנייה)! רכבי מחבלים חודרים לעורף (20%- חוסן). בלום חדירות ע״י לחיצה על הפרצה (⚠️), החזרת לוחם או מילואים.'
                  : 'Border gaps bleed Homeland HP (-0.4 HP/s)! Hostile squads raid border cities (-20% HP). Intercept them by tapping the gap, recalling soldiers, or calling reserves.'}
              </p>
            </div>
          </div>

          {/* Step 4: יהוה צבאות - כיבוש מדינת ישראל והבאת הגאולה לארצנו */}
          <div className="bg-white border border-amber-300 rounded-2xl p-2.5 shadow-sm flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 font-rubik text-xs flex items-center gap-1">
                <span>4.</span>
                <span>{isHe ? '״יהוה צבאות״: כיבוש מדינת ישראל והבאת הגאולה לארצנו' : '"Lord of Hosts": Total Conquest & Bringing Redemption'}</span>
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                {isHe
                  ? 'כל מאחז שנבנה ומאובטח מקדם את כפתור ״יהוה צבאות״ לקראת הגאולה השלמה והניצחון (100%). אך היזהרו: אם חוסן המדינה יגיע ל-0% — הגבול יקרוס ואסון 7 באוקטובר יתרחש!'
                  : 'Every outpost built and secured advances the "Lord of Hosts" meter toward 100% redemption. But beware: if Homeland HP hits 0% — the border will collapse and disaster strikes!'}
              </p>
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
