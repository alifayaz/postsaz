"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

interface ForgotPasswordPageProps {
  params: { locale: Locale }
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const { t, isRTL } = useTranslation(params.locale)

  const getLocalizedPath = (path: string) => {
    return params.locale === "fa" ? path : `/${params.locale}${path}`
  }

  // تابع کمکی برای تشخیص URL صحیح
  const getRedirectURL = () => {
    if (typeof window !== "undefined") {
      const { protocol, host } = window.location
      return `${protocol}//${host}${getLocalizedPath("/reset-password")}`
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${getLocalizedPath("/reset-password")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!email) {
      setError(t("messages.errors.required"))
      return
    }

    setLoading(true)

    try {
      const redirectURL = getRedirectURL()
      console.log("🔗 Reset password redirect URL:", redirectURL)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL,
      })

      if (error) {
        setError(t("messages.errors.unexpected") + ": " + error.message)
      } else {
        setMessage(t("messages.success.passwordResetSent"))
      }
    } catch (err) {
      setError(t("messages.errors.unexpected"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className={`flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 ${isRTL ? "justify-center flex-row-reverse" : "justify-center"}`}
          >
            <Link
              href={getLocalizedPath("/login")}
              className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {isRTL ? (
                <>
                  <span>{t("auth.forgotPassword.backToLogin")}</span>
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>{t("auth.forgotPassword.backToLogin")}</span>
                </>
              )}
            </Link>
          </div>
          <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <img
                src="/logo.svg"
                alt="postsazAI"
                className="max-w-full h-9 mx-auto object-cover"
            />
          </div>
          <div className="mb-4">
            <LanguageSwitcher currentLocale={params.locale}/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.forgotPassword.title")}</h1>
          <p className="text-gray-600 mt-2">{t("auth.forgotPassword.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("auth.forgotPassword.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("auth.forgotPassword.loading")}
                  </>
                ) : (
                  t("auth.forgotPassword.submit")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
