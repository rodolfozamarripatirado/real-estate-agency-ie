"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "./i18n-provider";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n";

const options: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
];

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { lang } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === lang) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border p-0.5 text-[11px] font-semibold ${
        dark ? "border-cream/25 text-cream" : "border-pine/20 text-pine"
      } ${pending ? "opacity-60" : ""}`}
      role="group"
      aria-label="Language"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => switchTo(option.value)}
          aria-pressed={lang === option.value}
          className={`rounded-full px-2.5 py-1 transition ${
            lang === option.value
              ? dark
                ? "bg-cream text-pine-deep"
                : "bg-pine text-cream"
              : dark
                ? "text-cream/70 hover:text-cream"
                : "text-pine/60 hover:text-pine"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
