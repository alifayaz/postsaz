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
import { validateEmail, validatePassword, validateName } from "@/lib/auth-helpers"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

interface SignupPageProps {
  params: { locale: Locale }
}

export default function SignupPage({ params }: SignupPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
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
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // تابع کمکی برای تشخیص URL صحیح
  const getRedirectURL = () => {
    if (typeof window !== "undefined") {
      const { protocol, host } = window.location
      return `${protocol}//${host}${getLocalizedPath("/auth/callback")}`
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${getLocalizedPath("/auth/callback")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation مرحله به مرحله
    const firstNameValidation = validateName(formData.firstName, t("auth.signup.firstName"))
    if (!firstNameValidation.valid) {
      setError(firstNameValidation.error!)
      return
    }

    const lastNameValidation = validateName(formData.lastName, t("auth.signup.lastName"))
    if (!lastNameValidation.valid) {
      setError(lastNameValidation.error!)
      return
    }

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      setError(t("messages.errors.invalidEmail"))
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      setError(t("messages.errors.passwordTooShort"))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("messages.errors.passwordMismatch"))
      return
    }

    if (!formData.acceptTerms) {
      setError(t("messages.errors.acceptTerms"))
      return
    }

    setLoading(true)

    try {
      console.log("🔄 Starting signup process...")

      const redirectURL = getRedirectURL()
      console.log("🔗 Redirect URL:", redirectURL)

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          },
          emailRedirectTo: redirectURL,
        },
      })

      console.log("📊 Signup response:", {
        hasData: !!data,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        emailConfirmed: !!data?.user?.email_confirmed_at,
        identitiesCount: data?.user?.identities?.length || 0,
        error: error?.message,
      })

      if (error) {
        console.error("❌ Signup error:", error)

        if (
          error.message.includes("User already registered") ||
          error.message.includes("already been registered") ||
          error.message.includes("email address is already registered") ||
          error.message.includes("A user with this email address has already been registered")
        ) {
          setError(
            t("messages.errors.unexpected") +
              "\n\n" +
              (params.locale === "fa"
                ? "⚠️ این ایمیل قبلاً ثبت شده است.\n\n🔑 اگر حساب کاربری دارید، از صفحه ورود استفاده کنید.\n🔒 اگر رمز عبور را فراموش کرده‌اید، از لینک بازیابی رمز عبور استفاده کنید.\n📧 اگر ایمیل تأیید دریافت نکرده‌اید، از صفحه ورود گزینه 'ارسال مجدد' را انتخاب کنید."
                : "⚠️ This email is already registered.\n\n🔑 If you have an account, use the login page.\n🔒 If you forgot your password, use the password recovery link.\n📧 If you didn't receive the confirmation email, use the 'Resend' option on the login page."),
          )
          return
        } else if (error.message.includes("Password should be at least")) {
          setError(t("messages.errors.passwordTooShort"))
          return
        } else if (error.message.includes("Invalid email")) {
          setError(t("messages.errors.invalidEmail"))
          return
        } else {
          setError(t("messages.errors.unexpected") + ": " + error.message)
          return
        }
      }

      if (data?.user) {
        console.log("✅ User data received:", {
          id: data.user.id,
          email: data.user.email,
          confirmed: !!data.user.email_confirmed_at,
          identities: data.user.identities?.length || 0,
        })

        if (data.user.identities && data.user.identities.length === 0) {
          setError(
            params.locale === "fa"
              ? "⚠️ این ایمیل قبلاً ثبت شده است اما تأیید نشده.\n\n📧 لطفاً ایمیل خود را چک کنید و روی لینک تأیید کلیک کنید.\n\nاگر ایمیل تأیید دریافت نکرده‌اید، از صفحه ورود گزینه 'ارسال مجدد ایمیل تأیید' را انتخاب کنید."
              : "⚠️ This email is already registered but not confirmed.\n\n📧 Please check your email and click the confirmation link.\n\nIf you didn't receive the confirmation email, use the 'Resend confirmation email' option on the login page.",
          )
          return
        }

        if (data.user.email_confirmed_at) {
          setSuccess(
            params.locale === "fa"
              ? "🎉 ثبت نام با موفقیت انجام شد! در حال انتقال به داشبورد..."
              : "🎉 Registration successful! Redirecting to dashboard...",
          )
          setTimeout(() => {
            router.push(getLocalizedPath("/dashboard"))
          }, 1500)
        } else {
          setSuccess(
            params.locale === "fa"
              ? "✅ ثبت نام با موفقیت انجام شد!\n\n📧 ایمیل تأیید به آدرس شما ارسال شد.\nلطفاً ایمیل خود را چک کنید و روی لینک تأیید کلیک کنید.\n\nپس از تأیید ایمیل، می‌توانید وارد شوید."
              : "✅ Registration successful!\n\n📧 A confirmation email has been sent to your address.\nPlease check your email and click the confirmation link.\n\nAfter confirming your email, you can log in.",
          )

          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
          })

          setTimeout(() => {
            router.push(getLocalizedPath("/login?message=please-verify-email"))
          }, 4000)
        }
      } else {
        setError(
          params.locale === "fa"
            ? "⚠️ ممکن است این ایمیل قبلاً ثبت شده باشد.\n\nاگر حساب کاربری دارید، از صفحه ورود استفاده کنید.\nاگر رمز عبور را فراموش کرده‌اید، از لینک بازیابی رمز عبور استفاده کنید."
            : "⚠️ This email might already be registered.\n\nIf you have an account, use the login page.\nIf you forgot your password, use the password recovery link.",
        )
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err)
      setError(t("messages.errors.unexpected"))
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.signup.title")}</h1>
          <p className="text-gray-600 mt-2">{t("auth.signup.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("nav.signup")}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm whitespace-pre-line">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t("auth.signup.firstName")}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder={t("auth.signup.firstName")}
                    className="mt-1"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("auth.signup.lastName")}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={t("auth.signup.lastName")}
                    className="mt-1"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t("auth.signup.email")}</Label>
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
                <Label htmlFor="password">{t("auth.signup.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("auth.signup.password")}
                  className="mt-1"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("auth.signup.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t("auth.signup.confirmPassword")}
                  className="mt-1"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={`flex items-center space-x-2 ${isRTL ? "flex-row-reverse space-x-reverse" : ""}`}>
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  {t("auth.signup.acceptTerms")}
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("auth.signup.loading")}
                  </>
                ) : (
                  t("auth.signup.submit")
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                {t("auth.signup.hasAccount")}{" "}
                <Link href={getLocalizedPath("/login")} className="text-purple-600 hover:text-purple-700 font-semibold">
                  {t("auth.signup.loginLink")}
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
