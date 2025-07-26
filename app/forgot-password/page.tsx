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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // تابع کمکی برای تشخیص URL صحیح
  const getRedirectURL = () => {
    if (typeof window !== "undefined") {
      const { protocol, host } = window.location
      return `${protocol}//${host}/reset-password`
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!email) {
      setError("لطفاً ایمیل خود را وارد کنید")
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
        setError("خطا در ارسال ایمیل: " + error.message)
      } else {
        setMessage("لینک بازیابی رمز عبور به ایمیل شما ارسال شد")
      }
    } catch (err) {
      setError("خطای غیرمنتظره رخ داد")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
              <ArrowRight className="h-4 w-4" />
              بازگشت به ورود
            </Link>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Instagram className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">پُست‌ساز</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">بازیابی رمز عبور</h1>
            <p className="text-gray-600 mt-2">ایمیل خود را وارد کنید</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">بازیابی رمز عبور</CardTitle>
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
                  <Label htmlFor="email">ایمیل</Label>
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال ارسال...
                      </>
                  ) : (
                      "ارسال لینک بازیابی"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
