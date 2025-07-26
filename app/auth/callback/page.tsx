"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...")

        // دریافت کد تأیید از URL
        const code = searchParams.get("code")
        const error_code = searchParams.get("error")
        const error_description = searchParams.get("error_description")

        console.log("📊 Callback params:", {
          hasCode: !!code,
          error_code,
          error_description,
        })

        if (error_code) {
          console.error("❌ Auth callback error:", error_code, error_description)
          setError(error_description || "خطا در تأیید ایمیل")
          setLoading(false)
          return
        }

        if (!code) {
          console.error("❌ No auth code found")
          setError("کد تأیید یافت نشد")
          setLoading(false)
          return
        }

        // تبدیل کد به session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error("❌ Code exchange error:", exchangeError)
          setError("خطا در تأیید ایمیل: " + exchangeError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          console.log("✅ Email confirmed successfully:", data.user.email)
          setSuccess(true)
          setLoading(false)

          // انتقال به داشبورد بعد از 2 ثانیه
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          console.error("❌ No user data received")
          setError("خطا در دریافت اطلاعات کاربر")
          setLoading(false)
        }
      } catch (err) {
        console.error("❌ Unexpected callback error:", err)
        setError("خطای غیرمنتظره رخ داد")
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Instagram className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">پُست‌ساز</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">تأیید ایمیل</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {loading && (
              <div className="py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">در حال تأیید ایمیل شما...</p>
              </div>
            )}

            {success && (
              <div className="py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">ایمیل با موفقیت تأیید شد! 🎉</h3>
                <p className="text-gray-600 mb-4">حساب کاربری شما فعال شد. در حال انتقال به داشبورد...</p>
                <div className="animate-pulse">
                  <div className="h-2 bg-purple-200 rounded-full">
                    <div className="h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">خطا در تأیید ایمیل</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/login">رفتن به صفحه ورود</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/signup">ثبت نام مجدد</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/">بازگشت به خانه</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
