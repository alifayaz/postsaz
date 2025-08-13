import { translations } from "./translations"
import { type Locale, defaultLocale, isValidLocale } from "./config"

// Get translation function
export function getTranslation(locale: Locale) {
  return translations[locale] || translations[defaultLocale]
}

// Get nested translation value
export function getNestedTranslation(translations: any, key: string): string {
  return key.split(".").reduce((obj, k) => obj?.[k], translations) || key
}

// Translation hook for client components
export function useTranslation(locale: Locale) {
  const t = getTranslation(locale)

  return {
    t: (key: string) => getNestedTranslation(t, key),
    locale,
    isRTL: locale === "fa",
  }
}

// Server-side translation function
export function createTranslator(locale: Locale) {
  const translations = getTranslation(locale)

  return {
    t: (key: string) => getNestedTranslation(translations, key),
    locale,
    isRTL: locale === "fa",
  }
}

// Get locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/")
  const potentialLocale = segments[1]

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale
  }

  return defaultLocale
}

// Remove locale from pathname
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/")
  const potentialLocale = segments[1]

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return "/" + segments.slice(2).join("/")
  }

  return pathname
}

// Add locale to pathname
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return pathname
  }

  const cleanPathname = removeLocaleFromPathname(pathname)
  return `/${locale}${cleanPathname === "/" ? "" : cleanPathname}`
}
