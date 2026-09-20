import type { Dispatch } from 'react';
import type { GameState, GameAction } from '../types';
import { RULES } from '../game/rules';

export function EntranceInstructionModal({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  if (!state.isIntroModalOpen) return null;
  const he = state.locale === 'he';
  return <div className="absolute inset-0 z-50 grid place-items-center bg-black/75 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="intro-title" className="modal-panel w-full max-w-sm rounded-3xl bg-amber-50 p-5 text-slate-900 shadow-2xl">
      <h2 id="intro-title" className="text-xl font-black">{he ? 'נצחון מוחלט: המחיר של כל החלטה' : 'Total Victory: Every choice has a cost'}</h2>
      <p className="mt-3 text-sm leading-relaxed">{he ? '8 חיילים, 8 גזרות גבול ותקציב מוגבל. הקם מאחז, בחר מאין להעביר חייל, וראה איזו גזרה נחשפת.' : '8 soldiers, 8 border sectors, limited funding. Build an outpost, choose where its guard comes from, and see which sector becomes exposed.'}</p>
      <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm">
        <li>{he ? 'בנה מאחז: 100₪.' : 'Build an outpost: ₪100.'}</li>
        <li>{he ? 'בחר מאחז וחייל זמין או גזרת מקור. בדוק את התחזית ואשר פריסה: 25₪.' : 'Choose an outpost and an available soldier or source sector. Preview and confirm deployment: ₪25.'}</li>
        <li>{he ? 'פרצה שוחקת 0.4 חוסן לשנייה. לחץ עליה להחזרת חייל.' : 'A gap drains 0.4 HP/s. Tap it to bring a soldier back.'}</li>
      </ol>
      <p className="mt-4 rounded-xl bg-amber-100 p-3 text-xs leading-relaxed">{he ? 'הבטחות הגאולה וכפתור ״יהוה צבאות״ הם חלק מהסאטירה. הכפתור אינו מחזיר חיילים ואינו מתקן נזק. המטרה המעשית: גבול בטוח וחוסן לאומי.' : 'Promises of redemption and the “Lord of Hosts” button are satire. The button does not restore troops or repair damage. Your practical goal is a secure border and national resilience.'}</p>
      <p className="mt-3 text-xs">{he ? `פגיעת חדירה: ${RULES.raidDamage} חוסן ו-${RULES.raidCost}₪. מאחז מאויש: +${RULES.guardedIncome}₪ לשנייה. זהו מודל לימודי, לא שחזור היסטורי.` : `Raid impact: ${RULES.raidDamage} HP and ₪${RULES.raidCost}. Guarded outpost: +₪${RULES.guardedIncome}/s. This is an educational model, not a historical reconstruction.`}</p>
      <p className="mt-3 text-sm font-bold">{he ? 'ההדרכה היא רק ההתחלה. סגירת הפרצה הראשונה מסיימת את ההדרכה והמשחק ממשיך עם אותם כוחות ותקציב.' : 'The tutorial is just the beginning. Sealing the first gap finishes the tutorial; play continues with the same troops and budget.'}</p>
      <button className="mt-4 min-h-11 w-full rounded-xl bg-amber-700 p-3 font-bold text-white" onClick={() => dispatch({ type: 'CLOSE_INTRO_MODAL' })}>{he ? 'למפה — נלמד תוך כדי משחק' : 'To the map — learn by playing'}</button>
    </section>
  </div>;
}
