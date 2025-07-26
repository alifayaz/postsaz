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

export default function LoginPage() {
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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
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
      setError("لطفاً ایمیل و رمز عبور را وارد کنید")
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
                ? "ایمیل یا رمز عبور اشتباه است"
                : error.message === "Email not confirmed" ? 'ایمیل خود را هنوز تایید نکرده اید!'
                : "خطا در ورود: " + error.message,
        )
        return
      }

      if (data.user) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("خطای غیرمنتظره رخ داد")
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError("لطفاً ابتدا ایمیل خود را وارد کنید")
      return
    }

    setResendingEmail(true)
    setError("")
    setResendSuccess("")

    try {
      const result = await resendConfirmationEmail(formData.email)

      if (result.success) {
        setResendSuccess("✅ ایمیل تأیید مجدداً ارسال شد. لطفاً ایمیل خود را چک کنید.")
      } else {
        setError("خطا در ارسال ایمیل: " + result.error)
      }
    } catch (error) {
      setError("خطای غیرمنتظره در ارسال ایمیل")
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
            <p>در حال بررسی وضعیت ورود...</p>
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
            <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
              <ArrowRight className="h-4 w-4" />
              بازگشت به خانه
            </Link>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Instagram className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">پُست‌ساز</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ورود به حساب کاربری</h1>
            <p className="text-gray-600 mt-2">به پنل کاربری خود دسترسی پیدا کنید</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">ورود</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="رمز عبور خود را وارد کنید"
                      className="mt-1"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال ورود...
                      </>
                  ) : (
                      "ورود"
                  )}
                </Button>

                {resendSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-600 text-sm">{resendSuccess}</p>
                    </div>
                )}

                <div className="text-center space-y-2">
                  <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 block">
                    رمز عبور را فراموش کرده‌اید؟
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
                          در حال ارسال...
                        </>
                    ) : (
                        "ارسال مجدد ایمیل تأیید"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  حساب کاربری ندارید؟{" "}
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                    ثبت نام کنید
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
