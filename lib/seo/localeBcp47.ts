import type { AppLocale } from "@/i18n/routing";

export const LOCALE_BCP47: Record<AppLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
  uk: "uk-UA",
  el: "el-GR",
  es: "es-ES",
};

export function localeToBcp47(locale: string): string {
  return LOCALE_BCP47[locale as AppLocale] ?? locale;
}
