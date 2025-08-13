export const defaultLocale = "en" as const
export const locales = ["en", "fa"] as const

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
