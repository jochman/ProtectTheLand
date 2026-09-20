import type { GameState } from '../types';
import { medals, objective } from '../game/rules';

const labels = {
  build: ['תחילת בנייה', 'Construction started'], deploy: ['פריסת חייל', 'Troop deployed'],
  reserve: ['גיוס מילואים', 'Reserves called'], recall: ['החזרת כוחות', 'Troops recalled'],
  evacuate: ['פינוי מאחז', 'Outpost evacuated'], seal: ['סגירת פרצה', 'Gap sealed'],
  raid: ['פגיעת חדירה', 'Raid impact'], clash: ['אובדן מאחז', 'Outpost lost'],
  reinforce: ['שליחת תגבור', 'Reinforcements sent'], threat: ['תוצאת קרב', 'Battle resolved'],
};

export function RunReport({ state }: { state: GameState }) {
  const he = state.locale === 'he';
  const m = state.metrics;
  const damage = [[he ? 'חשיפה ממושכת' : 'Open border gaps', m.exposureDamage],
    [he ? 'פגיעות חדירה' : 'Raid impacts', m.raidDamage], [he ? 'אובדן מאחזים' : 'Outpost losses', m.clashDamage],
    [he ? 'איומים ללא תגבור מספיק' : 'Understaffed battles', m.threatDamage]] as const;
  return <div className="w-full space-y-3 text-start text-xs text-slate-800">
    <p className="rounded-xl bg-slate-100 p-3">{objective(state)}<br />{he ? 'זמן משחק' : 'Playing time'}: {state.elapsedSeconds}s · {he ? 'חוסן' : 'HP'}: {state.landHp.toFixed(1)} · {he ? 'יירוטים' : 'Intercepted'}: {m.intercepted}</p>
    <div className="grid gap-1">{medals(state).map(medal => <p key={medal.label} className={medal.earned ? 'font-bold text-emerald-800' : 'text-slate-600'}>{medal.earned ? '🏅' : '○'} {medal.label}</p>)}</div>
    <table className="w-full overflow-hidden rounded-xl bg-white text-start">
      <caption className="mb-1 text-start font-bold">{he ? 'נזק מצטבר בפועל (לפני התאוששות)' : 'Actual damage taken (before recovery)'}</caption>
      <tbody>{damage.map(([label, amount]) => <tr key={label} className="border-b border-slate-100"><th className="p-2 text-start font-medium">{label}</th><td className="p-2 text-end tabular-nums">{amount.toFixed(1)} HP</td></tr>)}</tbody>
    </table>
    {m.miracleClicks > 0 && <p>{he ? `כפתור הנס נלחץ ${m.miracleClicks} פעמים; לא הוחזרו חיילים ולא תוקן נזק.` : `The miracle button was pressed ${m.miracleClicks} times; it restored no troops or HP.`}</p>}
    <details className="rounded-xl border border-slate-200 bg-white p-3" open>
      <summary className="min-h-8 cursor-pointer font-bold">{he ? 'ציר ההחלטות והתוצאות' : 'Decisions and consequences'}</summary>
      {state.timeline.length === 0 ? <p>{he ? 'טרם נרשמו אירועים.' : 'No events recorded.'}</p> : <ol className="space-y-2 border-s-2 border-amber-300 ps-3">
        {state.timeline.map((event, i) => <li key={i}>
          <span className="font-bold tabular-nums">{event.second}s · {labels[event.kind][he ? 0 : 1]}</span>
          {event.borderId && <> · {event.borderId === 'available' ? (he ? 'כוח זמין' : 'available troops') : `${he ? 'גזרה' : 'sector'} ${event.borderId.replace('bdr-', '')}`}</>}
          <span className="block text-slate-600">{event.gaps} {he ? 'פרצות' : 'gaps'} · {event.hp.toFixed(1)} HP{event.damage ? ` · −${event.damage} HP` : ''}{event.intercepted ? ` · ${event.intercepted} ${he ? 'יירוטים' : 'intercepted'}` : ''}</span>
        </li>)}
      </ol>}
    </details>
    <p className="text-slate-600">{he ? `זרע משחק: ${state.seed}. משחק חוזר שומר את נקודת הפתיחה ואת הגרלות האיום לפי זמן משחק; החלטותיך משנות אילו איומים יכולים להתממש.` : `Game seed: ${state.seed}. Replay preserves the starting position and threat rolls by game time; your decisions change which threats can occur.`}</p>
  </div>;
}
