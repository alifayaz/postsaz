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
// خط زیر را حذف کنید:
// import { checkEmailStatus } from "@/lib/email-checker"

export default function SignupPage() {
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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation مرحله به مرحله
    const firstNameValidation = validateName(formData.firstName, "نام")
    if (!firstNameValidation.valid) {
      setError(firstNameValidation.error!)
      return
    }

    const lastNameValidation = validateName(formData.lastName, "نام خانوادگی")
    if (!lastNameValidation.valid) {
      setError(lastNameValidation.error!)
      return
    }

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      setError(emailValidation.error!)
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error!)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند")
      return
    }

    if (!formData.acceptTerms) {
      setError("لطفاً قوانین و مقررات را بپذیرید")
      return
    }

    setLoading(true)

    try {
      console.log("🔄 Starting signup process...")

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          },
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

        // بررسی انواع خطاهای مختلف با پیام‌های فارسی
        if (
            error.message.includes("User already registered") ||
            error.message.includes("already been registered") ||
            error.message.includes("email address is already registered") ||
            error.message.includes("A user with this email address has already been registered")
        ) {
          setError(
              "⚠️ این ایمیل قبلاً ثبت شده است.\n\n" +
              "🔑 اگر حساب کاربری دارید، از صفحه ورود استفاده کنید.\n" +
              "🔒 اگر رمز عبور را فراموش کرده‌اید، از لینک بازیابی رمز عبور استفاده کنید.\n" +
              "📧 اگر ایمیل تأیید دریافت نکرده‌اید، از صفحه ورود گزینه 'ارسال مجدد' را انتخاب کنید.",
          )
          return
        } else if (error.message.includes("Password should be at least")) {
          setError("رمز عبور باید حداقل ۶ کاراکتر باشد")
          return
        } else if (error.message.includes("Invalid email")) {
          setError("فرمت ایمیل نامعتبر است")
          return
        } else if (error.message.includes("Signup is disabled")) {
          setError("امکان ثبت نام در حال حاضر غیرفعال است. لطفاً بعداً تلاش کنید.")
          return
        } else if (error.message.includes("Email rate limit exceeded")) {
          setError("تعداد درخواست‌های ایمیل بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.")
          return
        } else {
          setError("خطا در ثبت نام: " + error.message)
          return
        }
      }

      // بررسی وضعیت پاسخ
      if (data?.user) {
        console.log("✅ User data received:", {
          id: data.user.id,
          email: data.user.email,
          confirmed: !!data.user.email_confirmed_at,
          identities: data.user.identities?.length || 0,
        })

        // اگر کاربر وجود داشت اما ایمیل تأیید نشده (identities خالی است)
        if (data.user.identities && data.user.identities.length === 0) {
          setError(
              "⚠️ این ایمیل قبلاً ثبت شده است اما تأیید نشده.\n\n" +
              "📧 لطفاً ایمیل خود را چک کنید و روی لینک تأیید کلیک کنید.\n\n" +
              "اگر ایمیل تأیید دریافت نکرده‌اید، از صفحه ورود گزینه 'ارسال مجدد ایمیل تأیید' را انتخاب کنید.",
          )
          return
        }

        // اگر ایمیل از قبل تأیید شده (کاربر وارد شده)
        if (data.user.email_confirmed_at) {
          setSuccess("🎉 ثبت نام با موفقیت انجام شد! در حال انتقال به داشبورد...")
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          // کاربر جدید - ایمیل تأیید ارسال شده
          setSuccess(
              "✅ ثبت نام با موفقیت انجام شد!\n\n" +
              "📧 ایمیل تأیید به آدرس شما ارسال شد.\n" +
              "لطفاً ایمیل خود را چک کنید و روی لینک تأیید کلیک کنید.\n\n" +
              "پس از تأیید ایمیل، می‌توانید وارد شوید.",
          )

          // پاک کردن فرم
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
          })

          setTimeout(() => {
            router.push("/login?message=please-verify-email")
          }, 4000)
        }
      } else {
        // اگر هیچ داده‌ای برنگشت (حالت نادر)
        setError(
            "⚠️ ممکن است این ایمیل قبلاً ثبت شده باشد.\n\n" +
            "اگر حساب کاربری دارید، از صفحه ورود استفاده کنید.\n" +
            "اگر رمز عبور را فراموش کرده‌اید، از لینک بازیابی رمز عبور استفاده کنید.",
        )
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err)
      setError("خطای غیرمنتظره رخ داد. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.")
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
            <p>در حال بررسی وضعیت ورود...</p>
          </div>
        </div>
    )
  }

  // Don't render signup form if user is already logged in
  if (user) {
    return null
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
              <ArrowRight className="h-4 w-4" />
              بازگشت به خانه
            </Link>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Instagram className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">پُست‌ساز</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ایجاد حساب کاربری</h1>
            <p className="text-gray-600 mt-2">به جمع کاربران پُست‌ساز بپیوندید</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">ثبت نام</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
              )}

              {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">نام</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="نام خود را وارد کنید"
                        className="mt-1"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">نام خانوادگی</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="نام خانوادگی"
                        className="mt-1"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">ایمیل</Label>
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
                  <Label htmlFor="password">رمز عبور</Label>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="رمز عبور قوی انتخاب کنید"
                      className="mt-1"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                  <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="رمز عبور را مجدداً وارد کنید"
                      className="mt-1"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <div className="flex items-center space-x-2">
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
                    با{" "}
                    <Link href="#" className="text-purple-600 hover:text-purple-700">
                      قوانین و مقررات
                    </Link>{" "}
                    موافقم
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال ثبت نام...
                      </>
                  ) : (
                      "ثبت نام"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  قبلاً حساب کاربری دارید؟{" "}
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                    وارد شوید
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/create">ادامه بدون ثبت نام</Link>
            </Button>
          </div>
        </div>
      </div>
  )
}
