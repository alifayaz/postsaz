"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Instagram,
  Plus,
  LogOut,
  Settings,
  Calendar,
  Eye,
  Trash2,
  BarChart3,
  Download,
  Copy,
  Check,
  Home,
  FileText,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

interface Post {
  id: string
  title: string
  template_id: string
  image_url?: string
  caption: string
  topic?: string
  created_at: string
}

interface DashboardPageProps {
  params: { locale: Locale }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalPosts: 0,
    thisWeek: 0,
    thisMonth: 0,
  })
  const { t, isRTL } = useTranslation(params.locale)

  const getLocalizedPath = (path: string) => {
    return params.locale === "fa" ? path : `/${params.locale}${path}`
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push(getLocalizedPath("/login"))
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
      console.log("🔄 Fetching user posts from Supabase...")

      const { data: userPosts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Supabase error:", error)
        throw error
      }

      console.log("✅ Posts fetched:", userPosts?.length || 0)
      setPosts(userPosts || [])

      // محاسبه آمار
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const thisWeekPosts = (userPosts || []).filter((post: Post) => new Date(post.created_at) >= oneWeekAgo)
      const thisMonthPosts = (userPosts || []).filter((post: Post) => new Date(post.created_at) >= oneMonthAgo)

      setStats({
        totalPosts: userPosts?.length || 0,
        thisWeek: thisWeekPosts.length,
        thisMonth: thisMonthPosts.length,
      })
    } catch (error) {
      console.error("❌ Error fetching posts:", error)
      alert(t("messages.errors.unexpected"))
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm(t("messages.errors.deleteConfirm"))) {
      return
    }

    try {
      console.log("🗑️ Deleting post:", postId)

      const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", user?.id)

      if (error) {
        console.error("❌ Delete error:", error)
        throw error
      }

      console.log("✅ Post deleted successfully")
      setPosts(posts.filter((post) => post.id !== postId))
      setStats((prev) => ({
        ...prev,
        totalPosts: prev.totalPosts - 1,
      }))
      alert(t("messages.success.postDeleted"))
    } catch (error) {
      console.error("Error deleting post:", error)
      alert(t("messages.errors.unexpected"))
    }
  }

  const handleCopyCaption = async (caption: string, postId: string) => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopiedPostId(postId)
      setTimeout(() => setCopiedPostId(null), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
      alert(t("messages.errors.copyFailed"))
    }
  }

  const handleDownloadCaption = (caption: string, title: string) => {
    const blob = new Blob([caption], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title}-caption.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    await signOut()
    router.push(getLocalizedPath("/"))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(params.locale === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case "modern":
        return "🎨"
      case "minimal":
        return "⚪"
      case "vibrant":
        return "🌈"
      default:
        return "📱"
    }
  }

  const getTemplateName = (templateId: string) => {
    switch (templateId) {
      case "modern":
        return t("create.template.modern")
      case "minimal":
        return t("create.template.minimal")
      case "vibrant":
        return t("create.template.vibrant")
      default:
        return templateId
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p>{t("common.loading")}</p>
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
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""} ${user ? 'flex-col' : 'flex-row'}`}>
            <div className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link
                  href={getLocalizedPath("/")}
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <img
                    src="/logo.svg"
                    alt="postsazAI"
                    className="max-w-full h-9 mx-auto object-cover"
                />
              </Link>

              {/*<nav className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Link
                    href={getLocalizedPath("/")}
                    className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Home className="h-4 w-4" />
                  {t("nav.home")}
                </Link>
                <Link
                  href={getLocalizedPath("/create")}
                  className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Plus className="h-4 w-4" />
                  {t("nav.create")}
                </Link>
              </nav>*/}
            </div>

            <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <LanguageSwitcher currentLocale={params.locale} />
              <span className="flex !flex-col justify-center items-center gap-4">
                {t("dashboard.welcome")}, {user?.user_metadata?.first_name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.title")}</h1>
            <p className="text-gray-600">{t("dashboard.subtitle")}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("dashboard.stats.totalPosts")}</p>
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
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("dashboard.stats.thisWeek")}</p>
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
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("dashboard.stats.thisMonth")}</p>
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
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Link href={getLocalizedPath("/create")} className="block">
                  <Plus className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("dashboard.quickActions.createPost.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("dashboard.quickActions.createPost.description")}</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("dashboard.quickActions.settings.title")}</h3>
                <p className="text-gray-600 text-sm">{t("dashboard.quickActions.settings.description")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Posts List */}
          <Card>
            <CardHeader>
              <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <CardTitle>
                  {t("dashboard.posts.title")} ({stats.totalPosts})
                </CardTitle>
                <Link href={getLocalizedPath("/create")}>
                  <Button size="sm">
                    <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("nav.create")}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-gray-500">{t("common.loading")}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("dashboard.posts.empty.title")}</h3>
                  <p className="text-gray-500 mb-6">{t("dashboard.posts.empty.description")}</p>
                  <Button asChild>
                    <Link href={getLocalizedPath("/create")}>
                      <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("dashboard.posts.empty.cta")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                          {/* Template Preview */}
                          <div
                            className={`w-16 h-16 rounded-lg ${getTemplateStyle(post.template_id)} flex items-center justify-center flex-shrink-0`}
                          >
                            <span className="text-2xl">{getTemplateIcon(post.template_id)}</span>
                          </div>

                          {/* Post Info */}
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-start justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h3>
                                <div className={`flex items-center gap-2 mt-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                                  {post.topic && (
                                    <Badge variant="secondary" className="text-xs">
                                      {post.topic}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {getTemplateName(post.template_id)}
                                  </Badge>
                                  {post.image_url && (
                                    <Badge variant="default" className="text-xs bg-green-500">
                                      {t("dashboard.posts.meta.withImage")}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyCaption(post.caption, post.id)}
                                  className="flex items-center gap-1"
                                >
                                  {copiedPostId === post.id ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      {t("dashboard.posts.actions.copied")}
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      {t("dashboard.posts.actions.copy")}
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadCaption(post.caption, post.title)}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  {t("dashboard.posts.actions.download")}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  {t("dashboard.posts.actions.delete")}
                                </Button>
                              </div>
                            </div>

                            {/* Caption Preview */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {post.caption.length > 200 ? post.caption.substring(0, 200) + "..." : post.caption}
                              </p>
                            </div>

                            {/* Meta Info */}
                            <div
                              className={`flex items-center justify-between text-xs text-gray-500 ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(post.created_at)}
                                </div>
                                <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                                  <FileText className="h-3 w-3" />
                                  {post.caption.length} {t("dashboard.posts.meta.characters")}
                                </div>
                              </div>
                            </div>
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
