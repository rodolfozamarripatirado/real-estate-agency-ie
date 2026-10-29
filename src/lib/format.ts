import type { Locale } from "./i18n";

const intlLocale = (locale: Locale) => (locale === "es" ? "es-ES" : "en-IE");

export function formatPrice(
  amount: number,
  locale: Locale,
  listingType: "SALE" | "RENT" = "SALE",
): string {
  const formatted = new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

  return listingType === "RENT" ? `${formatted} / ${locale === "es" ? "mes" : "month"}` : formatted;
}

export function formatCompactPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

export function formatDate(value: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Tailwind classes for the Irish BER label colours. */
export function berClass(rating: string): string {
  const letter = rating.charAt(0).toUpperCase();
  switch (letter) {
    case "A":
      return "bg-[#00843d] text-white";
    case "B":
      return "bg-[#4c9f38] text-white";
    case "C":
      return "bg-[#c9b000] text-white";
    case "D":
      return "bg-[#e07b00] text-white";
    case "E":
      return "bg-[#d34100] text-white";
    default:
      return "bg-[#a61b1b] text-white";
  }
}

export function localisedValue(
  en: string | null | undefined,
  es: string | null | undefined,
  locale: Locale,
): string {
  if (locale === "es" && es?.trim()) return es;
  return en ?? "";
}

export function propertyTitle(
  property: { titleEn: string; titleEs: string },
  locale: Locale,
): string {
  return localisedValue(property.titleEn, property.titleEs, locale);
}

export function propertySummary(
  property: { summaryEn: string; summaryEs: string },
  locale: Locale,
): string {
  return localisedValue(property.summaryEn, property.summaryEs, locale);
}

export function propertyDescription(
  property: { descriptionEn: string; descriptionEs: string },
  locale: Locale,
): string {
  return localisedValue(property.descriptionEn, property.descriptionEs, locale);
}
