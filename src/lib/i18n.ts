import { en, locales, defaultLocale, isLocale, type Locale } from "./dictionaries/en";
import { es } from "./dictionaries/es";

export { locales, defaultLocale, isLocale };
export type { Locale };

export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/** Replace {placeholders} in a dictionary string. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
