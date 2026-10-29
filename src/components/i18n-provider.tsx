"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

type I18nValue = {
  lang: Locale;
  t: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  lang,
  t,
  children,
}: I18nValue & { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside an I18nProvider");
  }
  return context;
}
