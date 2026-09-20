import { inlineTranslations } from './inlineTranslations';

export type Locale = 'he' | 'en';

/** Selects a catalog entry and interpolates positional values extracted from UI copy. */
export function translate(locale: Locale, key: string, values: readonly unknown[] = []): string {
  const entry = inlineTranslations[key];
  if (!entry) return key;
  return entry[locale].replace(/{{(\d+)}}/g, (_, index: string) => String(values[Number(index)] ?? ''));
}

/** Selects an already-bilingual runtime value, with a locale-neutral fallback. */
export function selectLocale(locale: Locale, hebrew?: string, english?: string, fallback = ''): string {
  return locale === 'he' ? (hebrew || fallback) : (english || fallback);
}
