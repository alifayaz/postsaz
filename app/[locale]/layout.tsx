import type React from "react"
import type { Metadata } from "next"
import "../globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { locales, type Locale } from "@/lib/i18n/config"
import { createTranslator } from "@/lib/i18n"

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: Locale }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const { t } = createTranslator(params.locale)

  return {
    title: t("home.title") + " - " + t("home.subtitle"),
    description: t("home.hero.subtitle"),
  }
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  const isRTL = params.locale === "fa"

  return (
    <html lang={params.locale} dir={isRTL ? "rtl" : "ltr"}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
