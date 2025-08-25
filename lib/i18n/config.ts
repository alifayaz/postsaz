export const defaultLocale = "fa" as const
export const locales = ["fa", "en"] as const

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
}

export const localeFlags: Record<Locale, string> = {
  fa: "🇮🇷",
  en: "🇺🇸",
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
