"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Zap, ImageIcon, Type, Download, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import React from "react";

export default function HomePage() {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                  src="/logo.svg"
                  alt="postsazAI"
                  className="max-w-full h-10 mx-auto object-cover"
              />
            </div>
            <div className="flex items-center gap-4">
              {loading ? (
                  <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{user.user_metadata?.first_name || user.email?.split("@")[0]}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      خروج
                    </Button>
                    <Button asChild>
                      <Link href="/dashboard">داشبورد</Link>
                    </Button>
                  </>
              ) : (
                  <>
                    <Link href="/login" className="text-gray-600 hover:text-gray-900">
                      ورود
                    </Link>
                    <Link href="/signup" className="text-gray-600 hover:text-gray-900">
                      ثبت نام
                    </Link>
                    <Button asChild>
                      <Link href="/create">شروع رایگان</Link>
                    </Button>
                  </>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            پست اینستاگرام خود را در <span className="text-purple-600">چند ثانیه</span> بسازید
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            با پُست‌ساز، قالب‌های زیبا انتخاب کنید، عکس آپلود کنید و کپشن‌های جذاب دریافت کنید. همه چیز آماده برای انتشار در
            اینستاگرام!
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href={user ? "/dashboard" : "/create"}>
              <Zap className="mr-2 h-5 w-5" />
              {user ? "رفتن به داشبورد" : "شروع رایگان"}
            </Link>
          </Button>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">چرا پُست‌ساز؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <ImageIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">قالب‌های آماده</h3>
                <p className="text-gray-600">از قالب‌های طراحی شده و حرفه‌ای استفاده کنید</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Type className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">کپشن هوشمند</h3>
                <p className="text-gray-600">کپشن‌های جذاب و متناسب با موضوع دریافت کنید</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Download className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">دانلود آسان</h3>
                <p className="text-gray-600">پست نهایی را دانلود کنید و در اینستاگرام منتشر کنید</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">آماده برای شروع هستید؟</h2>
            <p className="text-xl mb-8 opacity-90">همین الان اولین پست خود را بسازید</p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link href={user ? "/dashboard" : "/create"}>{user ? "رفتن به داشبورد" : "شروع کنید"}</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img
                  src="/logo-w.svg"
                  alt="postsazAI"
                  className="max-w-full h-10 mx-auto object-cover"
              />
            </div>
            <p className="text-gray-400">ابزار هوشمند تولید پست اینستاگرام</p>
          </div>
        </footer>
      </div>
  )
}
