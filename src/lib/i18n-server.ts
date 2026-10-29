import { cookies } from "next/headers";
import {
  defaultLocale,
  getDictionary,
  isLocale,
  type Dictionary,
  type Locale,
} from "./i18n";

export async function getLang(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("lang")?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getI18n(): Promise<{ lang: Locale; t: Dictionary }> {
  const lang = await getLang();
  return { lang, t: getDictionary(lang) };
}
