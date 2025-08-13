"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Zap, ImageIcon, Type, Download, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"
import React from "react";

interface HomePageProps {
  params: { locale: Locale }
}

export default function HomePage({ params }: HomePageProps) {
  const { user, loading, signOut } = useAuth()
  const { t, isRTL } = useTranslation(params.locale)

  const handleSignOut = async () => {
    await signOut()
  }

  const getLocalizedPath = (path: string) => {
    return params.locale === "fa" ? 'fa/'+ path : `/${params.locale}${path}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""} ${user ? 'flex-col' : 'flex-row'}`}>
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <img
                src="/logo.svg"
                alt="postsazAI"
                className="max-w-full h-9 mx-auto object-cover"
            />
          </div>
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <LanguageSwitcher currentLocale={params.locale}/>
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{user.user_metadata?.first_name || user.email?.split("@")[0]}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("nav.logout")}
                </Button>
                <Button asChild>
                  <Link href={getLocalizedPath("/dashboard")}>{t("nav.dashboard")}</Link>
                </Button>
              </>
            ) : (
              <>
              <Button asChild>
                <Link href={getLocalizedPath("/login")} className="text-gray-600 hover:text-gray-900">
                  {t("nav.login")}
                </Link>
              </Button>
                <Button asChild>
                <Link href={getLocalizedPath("/signup")} className="text-gray-600 hover:text-gray-900">
                  {t("nav.signup")}
                </Link>
              </Button>
                {/*<Button asChild>
                  <Link href={getLocalizedPath("/create")}>{t("home.hero.cta")}</Link>
                </Button>*/}
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">{t("home.hero.title")}</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("home.hero.subtitle")}</p>
        <Button size="lg" asChild className="text-lg px-8 py-6">
          <Link href={getLocalizedPath(user ? "/dashboard" : "/create")}>
            <Zap className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
            {user ? t("home.hero.ctaLoggedIn") : t("home.hero.cta")}
          </Link>
        </Button>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("home.features.title")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <ImageIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("home.features.templates.title")}</h3>
              <p className="text-gray-600">{t("home.features.templates.description")}</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Type className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("home.features.captions.title")}</h3>
              <p className="text-gray-600">{t("home.features.captions.description")}</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Download className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("home.features.download.title")}</h3>
              <p className="text-gray-600">{t("home.features.download.description")}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.cta.title")}</h2>
          <p className="text-xl mb-8 opacity-90">{t("home.cta.subtitle")}</p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link href={getLocalizedPath(user ? "/dashboard" : "/create")}>{t("home.cta.button")}</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Instagram className="h-6 w-6" />
            <span className="text-xl font-bold">{t("home.title")}</span>
          </div>
          <p className="text-gray-400">{t("home.subtitle")}</p>
        </div>
      </footer>
    </div>
  )
}
