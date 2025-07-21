"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Plus, LogOut, Settings, Calendar, Eye, Trash2, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Post {
  id: number
  title: string
  template_id: string
  image_url?: string
  caption: string
  topic?: string
  created_at: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    thisWeek: 0,
    thisMonth: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchUserPosts()
    }
  }, [user])

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true)
      const response = await fetch("/api/posts")
      if (response.ok) {
        const data = await response.json()
        const userPosts = data.posts || []
        setPosts(userPosts.slice(0, 6)) // فقط 6 پست اخیر برای داشبورد

        // محاسبه آمار
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const thisWeekPosts = userPosts.filter((post: Post) => new Date(post.created_at) >= oneWeekAgo)
        const thisMonthPosts = userPosts.filter((post: Post) => new Date(post.created_at) >= oneMonthAgo)

        setStats({
          totalPosts: userPosts.length,
          thisWeek: thisWeekPosts.length,
          thisMonth: thisMonthPosts.length,
        })
      } else {
        console.error("Failed to fetch posts")
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟")) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
        // بروزرسانی آمار
        setStats((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts - 1,
        }))
      } else {
        alert("خطا در حذف پست")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("خطا در حذف پست")
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTemplateStyle = (templateId: string) => {
    switch (templateId) {
      case "modern":
        return "bg-gradient-to-br from-blue-500 to-purple-600"
      case "minimal":
        return "bg-gradient-to-br from-gray-100 to-gray-200"
      case "vibrant":
        return "bg-gradient-to-br from-orange-400 to-pink-500"
      default:
        return "bg-gray-200"
    }
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
                <span className="text-gray-600">خوش آمدید، {user?.first_name || user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  خروج
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد کاربری</h1>
              <p className="text-gray-600">مدیریت پست‌ها و مشاهده آمار</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">کل پست‌ها</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">این هفته</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">این ماه</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <Link href="/posts" className="block">
                    <Instagram className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">مشاهده همه پست‌ها</h3>
                    <p className="text-gray-600 text-sm">مدیریت تمام پست‌های شما</p>
                  </Link>
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
                <div className="flex items-center justify-between">
                  <CardTitle>پست‌های اخیر</CardTitle>
                  <Link href="/posts" className="text-sm text-purple-600 hover:text-purple-700">
                    مشاهده همه
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">در حال بارگذاری پست‌ها...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">هنوز پستی نساخته‌اید</p>
                      <Button asChild>
                        <Link href="/create">
                          <Plus className="h-4 w-4 mr-2" />
                          اولین پست خود را بسازید
                        </Link>
                      </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {posts.map((post) => (
                          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                              {/* Post Preview */}
                              <div
                                  className={`aspect-square ${getTemplateStyle(post.template_id)} flex items-center justify-center`}
                              >
                                {post.image_url ? (
                                    <img
                                        src={post.image_url || "/placeholder.svg"}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-white text-center">
                                      <Instagram className="h-8 w-8 mx-auto mb-2 opacity-75" />
                                      <p className="text-sm opacity-75">{post.title}</p>
                                    </div>
                                )}
                              </div>

                              {/* Post Actions */}
                              <div className="absolute top-2 right-2 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                                    onClick={() => handleDeletePost(post.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>

                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2 truncate">{post.title}</h3>

                              {post.topic && <p className="text-sm text-purple-600 mb-2">موضوع: {post.topic}</p>}

                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {post.caption.substring(0, 100)}
                                {post.caption.length > 100 ? "..." : ""}
                              </p>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(post.created_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.template_id}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
