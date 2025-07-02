"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Plus, Calendar, Eye, Trash2, Download } from "lucide-react"
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

export default function PostsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [loadingPosts, setLoadingPosts] = useState(true)

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
                setPosts(data.posts || [])
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
            } else {
                alert("خطا در حذف پست")
            }
        } catch (error) {
            console.error("Error deleting post:", error)
            alert("خطا در حذف پست")
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
                            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                                داشبورد
                            </Link>
                            <Link href="/create" className="text-gray-600 hover:text-gray-900">
                                ساخت پست
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">پست‌های من</h1>
                            <p className="text-gray-600">مدیریت و مشاهده تمام پست‌های شما</p>
                        </div>
                        <Button asChild>
                            <Link href="/create">
                                <Plus className="h-4 w-4 mr-2" />
                                پست جدید
                            </Link>
                        </Button>
                    </div>

                    {/* Posts Grid */}
                    {loadingPosts ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">در حال بارگذاری پست‌ها...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Instagram className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">هنوز پستی نساخته‌اید</h3>
                                <p className="text-gray-500 mb-6">اولین پست اینستاگرام خود را بسازید</p>
                                <Button asChild>
                                    <Link href="/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        ساخت اولین پست
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
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
                                                    <Instagram className="h-12 w-12 mx-auto mb-2 opacity-75" />
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
                                                onClick={() => handleDownloadCaption(post.caption, post.title)}
                                                title="دانلود کپشن"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                                                onClick={() => handleDeletePost(post.id)}
                                                title="حذف پست"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>

                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 truncate">{post.title}</h3>

                                        {post.topic && (
                                            <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {post.topic}
                        </span>
                                            </div>
                                        )}

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                                            {post.caption.substring(0, 120)}
                                            {post.caption.length > 120 ? "..." : ""}
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
                </div>
            </div>
        </div>
    )
}
