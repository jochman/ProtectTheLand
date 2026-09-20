import { translate } from '../locales/translate';
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
  const damage = [[translate(state.locale, 'components.RunReport.15', []), m.exposureDamage],
    [translate(state.locale, 'report.raid'), m.raidDamage], [translate(state.locale, 'components.RunReport.16', []), m.clashDamage],
    [translate(state.locale, 'components.RunReport.17', []), m.threatDamage]] as const;
  const largestIndex = damage.reduce((best, item, index) => item[1] > damage[best][1] ? index : best, 0);
  const largest = damage[largestIndex];
  const tips = ['gaps', 'raids', 'outposts', 'threats'];
  return <div className="w-full space-y-3 text-start text-xs text-slate-800">
    <p className="rounded-xl bg-slate-100 p-3">{objective(state)}<br />{translate(state.locale, 'report.time')}: {state.elapsedSeconds}s · {translate(state.locale, 'report.hp')}: {state.landHp.toFixed(1)} · {translate(state.locale, 'components.RunReport.19', [])}: {m.intercepted}</p>
    <div data-testid="run-lesson" className="rounded-xl border border-amber-300 bg-amber-50 p-3 leading-relaxed">
      {largest[1] > 0 ? <><p className="font-bold">{translate(state.locale, 'report.largest', [largest[0], largest[1].toFixed(1)])}</p><p>{translate(state.locale, `report.tip.${tips[largestIndex]}`)}</p></> : translate(state.locale, 'report.none')}
    </div>
    <div className="grid gap-1">{medals(state).map(medal => <p key={medal.label} className={medal.earned ? 'font-bold text-emerald-800' : 'text-slate-600'}>{medal.earned ? '🏅' : '○'} {medal.label}</p>)}</div>
    <table className="w-full overflow-hidden rounded-xl bg-white text-start">
      <caption className="mb-1 text-start font-bold">{translate(state.locale, 'components.RunReport.22', [])}</caption>
      <tbody>{damage.map(([label, amount]) => <tr key={label} className="border-b border-slate-100"><th className="p-2 text-start font-medium">{label}</th><td className="p-2 text-end tabular-nums">{amount.toFixed(1)} HP</td></tr>)}</tbody>
    </table>
    {m.miracleClicks > 0 && <p>{translate(state.locale, 'components.RunReport.25', [m.miracleClicks])}</p>}
    <details className="rounded-xl border border-slate-200 bg-white p-3" open>
      <summary className="min-h-8 cursor-pointer font-bold">{translate(state.locale, 'components.RunReport.27', [])}</summary>
      {state.timeline.length === 0 ? <p>{translate(state.locale, 'components.RunReport.28', [])}</p> : <ol className="space-y-2 border-s-2 border-amber-300 ps-3">
        {state.timeline.map((event, i) => <li key={i}>
          <span className="font-bold tabular-nums">{event.second}s · {labels[event.kind][he ? 0 : 1]}</span>
          {event.borderId && <> · {event.borderId === 'available' ? translate(state.locale, 'report.available') : `${translate(state.locale, 'components.RunReport.31', [])} ${event.borderId.replace('bdr-', '')}`}</>}
          <span className="block text-slate-600">{event.gaps} {translate(state.locale, 'report.gaps')} · {event.hp.toFixed(1)} HP{event.damage ? ` · −${event.damage} HP` : ''}{event.intercepted ? ` · ${event.intercepted} ${translate(state.locale, 'components.RunReport.32', [])}` : ''}</span>
        </li>)}
      </ol>}
    </details>
    <p className="text-slate-600">{translate(state.locale, 'components.RunReport.36', [state.seed])}</p>
  </div>;
}
