"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

interface AuthCallbackPageProps {
  params: { locale: Locale }
}

export default function AuthCallbackPage({ params }: AuthCallbackPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { t, isRTL } = useTranslation(params.locale)

  const getLocalizedPath = (path: string) => {
    return params.locale === "fa" ? path : `/${params.locale}${path}`
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...")
        console.log("📍 Current URL:", window.location.href)

        // بررسی hash fragment برای token
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        const tokenType = hashParams.get("token_type")
        const type = hashParams.get("type")

        console.log("📊 Hash params:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          type,
        })

        // اگر token در hash وجود دارد
        if (accessToken && refreshToken) {
          console.log("✅ Found tokens in hash, setting session...")

          // تنظیم session با token های دریافتی
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("❌ Session error:", sessionError)
            setError(t("messages.errors.unexpected") + ": " + sessionError.message)
            setLoading(false)
            return
          }

          if (data.user) {
            console.log("✅ Session set successfully:", data.user.email)
            setSuccess(true)
            setLoading(false)

            // پاک کردن hash از URL
            window.history.replaceState({}, document.title, window.location.pathname)

            // انتقال به داشبورد بعد از 2 ثانیه
            setTimeout(() => {
              router.push(getLocalizedPath("/dashboard"))
            }, 2000)
            return
          }
        }

        // بررسی query parameters برای کد تأیید (روش جدید Supabase)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        const error_code = urlParams.get("error")
        const error_description = urlParams.get("error_description")

        console.log("📊 Query params:", {
          hasCode: !!code,
          error_code,
          error_description,
        })

        if (error_code) {
          console.error("❌ Auth callback error:", error_code, error_description)
          setError(error_description || t("messages.errors.unexpected"))
          setLoading(false)
          return
        }

        if (code) {
          console.log("✅ Found auth code, exchanging for session...")

          // تبدیل کد به session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error("❌ Code exchange error:", exchangeError)
            setError(t("messages.errors.unexpected") + ": " + exchangeError.message)
            setLoading(false)
            return
          }

          if (data.user) {
            console.log("✅ Email confirmed successfully:", data.user.email)
            setSuccess(true)
            setLoading(false)

            // انتقال به داشبورد بعد از 2 ثانیه
            setTimeout(() => {
              router.push(getLocalizedPath("/dashboard"))
            }, 2000)
            return
          }
        }

        // اگر هیچ token یا کدی پیدا نشد، بررسی کنیم که آیا کاربر قبلاً لاگین است
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("❌ Get user error:", userError)
          setError(t("messages.errors.unexpected") + ": " + userError.message)
          setLoading(false)
          return
        }

        if (user) {
          console.log("✅ User already authenticated:", user.email)
          setSuccess(true)
          setLoading(false)

          // انتقال به داشبورد بعد از 1 ثانیه
          setTimeout(() => {
            router.push(getLocalizedPath("/dashboard"))
          }, 1000)
          return
        }

        // اگر هیچ‌کدام از موارد بالا صادق نبود
        console.error("❌ No valid auth data found")
        setError(t("messages.errors.unexpected"))
        setLoading(false)
      } catch (err) {
        console.error("❌ Unexpected callback error:", err)
        setError(t("messages.errors.unexpected"))
        setLoading(false)
      }
    }

    // اجرای تابع بعد از mount شدن کامپوننت
    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`flex items-center justify-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Instagram className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{t("home.title")}</span>
          </div>
          <div className="mb-4">
            <LanguageSwitcher currentLocale={params.locale} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("auth.callback.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {loading && (
              <div className="py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">{t("auth.callback.processing")}</p>
                <p className="text-xs text-gray-400 mt-2">{t("common.loading")}</p>
              </div>
            )}

            {success && (
              <div className="py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">{t("auth.callback.success")}</h3>
                <p className="text-gray-600 mb-4">{t("auth.callback.successMessage")}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse w-full"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">{t("auth.callback.error")}</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href={getLocalizedPath("/dashboard")}>{t("auth.callback.goToDashboard")}</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href={getLocalizedPath("/login")}>{t("auth.callback.goToLogin")}</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href={getLocalizedPath("/")}>{t("auth.callback.backToHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
