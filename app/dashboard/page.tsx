"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Plus, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
    )
  }

  if (!user) {
    return null
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Instagram className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">پُست‌ساز</span>
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-gray-600">خوش آمدید، {user?.user_metadata?.first_name || user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  خروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد کاربری</h1>
              <p className="text-gray-600">پست‌های خود را مدیریت کنید و پست‌های جدید بسازید</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Link href="/create" className="block">
                    <Plus className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">ساخت پست جدید</h3>
                    <p className="text-gray-600 text-sm">پست اینستاگرام جدید بسازید</p>
                  </Link>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">پروفایل</h3>
                  <p className="text-gray-600 text-sm">مشاهده و ویرایش پروفایل</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">تنظیمات</h3>
                  <p className="text-gray-600 text-sm">تنظیمات حساب کاربری</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>پست‌های اخیر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">هنوز پستی نساخته‌اید</p>
                  <Button asChild>
                    <Link href="/create">
                      <Plus className="h-4 w-4 mr-2" />
                      اولین پست خود را بسازید
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
