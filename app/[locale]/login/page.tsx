"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { resendConfirmationEmail } from "@/lib/email-checker"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

interface LoginPageProps {
  params: { locale: Locale }
}

export default function LoginPage({ params }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState("")
  const { t, isRTL } = useTranslation(params.locale)

  const getLocalizedPath = (path: string) => {
    return params.locale === "fa" ? path : `/${params.locale}${path}`
  }

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(getLocalizedPath("/dashboard"))
    }
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError(t("messages.errors.required"))
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? t("messages.errors.invalidEmail")
            : t("messages.errors.unexpected") + ": " + error.message,
        )
        return
      }

      if (data.user) {
        router.push(getLocalizedPath("/dashboard"))
      }
    } catch (err) {
      setError(t("messages.errors.unexpected"))
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError(t("messages.errors.required"))
      return
    }

    setResendingEmail(true)
    setError("")
    setResendSuccess("")

    try {
      const result = await resendConfirmationEmail(formData.email)

      if (result.success) {
        setResendSuccess(t("messages.success.emailSent"))
      } else {
        setError(t("messages.errors.unexpected") + ": " + result.error)
      }
    } catch (error) {
      setError(t("messages.errors.unexpected"))
    } finally {
      setResendingEmail(false)
    }
  }

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  // Don't render login form if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 ${isRTL ? "justify-center flex-row-reverse" : "justify-center"}`}
          >
            <Link
              href={getLocalizedPath("/")}
              className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {isRTL ? (
                <>
                  <span>{t("common.back")}</span>
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>{t("common.back")}</span>
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
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.login.title")}</h1>
          <p className="text-gray-600 mt-2">{t("auth.login.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("nav.login")}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.login.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  className="mt-1"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">{t("auth.login.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("auth.login.password")}
                  className="mt-1"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("auth.login.loading")}
                  </>
                ) : (
                  t("auth.login.submit")
                )}
              </Button>

              {resendSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{resendSuccess}</p>
                </div>
              )}

              <div className="text-center space-y-2">
                <Link
                  href={getLocalizedPath("/forgot-password")}
                  className="text-sm text-purple-600 hover:text-purple-700 block"
                >
                  {t("auth.login.forgotPassword")}
                </Link>

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendingEmail}
                  className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("auth.login.resendConfirmation")
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                {t("auth.login.noAccount")}{" "}
                <Link
                  href={getLocalizedPath("/signup")}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  {t("auth.login.signupLink")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href={getLocalizedPath("/create")}>{t("auth.login.continueWithoutSignup")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
