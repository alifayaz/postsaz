"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

export default function TestPostPage() {
    const { user } = useAuth()
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testCreatePost = async () => {
        if (!user) {
            alert("ابتدا وارد شوید")
            return
        }

        setLoading(true)
        setResult(null)

        try {
            console.log("🔄 Testing post creation...")

            const response = await fetch("/api/posts/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()
            console.log("📡 Test response:", data)

            setResult({
                status: response.status,
                data: data,
            })
        } catch (error) {
            console.error("❌ Test error:", error)
            setResult({
                error: error instanceof Error ? error.message : "خطای غیرمنتظره",
            })
        } finally {
            setLoading(false)
        }
    }

    const testNormalPost = async () => {
        if (!user) {
            alert("ابتدا وارد شوید")
            return
        }

        setLoading(true)
        setResult(null)

        try {
            console.log("🔄 Testing normal post creation...")

            const response = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: "پست تست عادی",
                    template_id: "modern",
                    image_url: null,
                    caption: "این یک کپشن تست عادی است\n\n#تست #پست_ساز",
                    topic: "تست",
                }),
            })

            const data = await response.json()
            console.log("📡 Normal post response:", data)

            setResult({
                status: response.status,
                data: data,
            })
        } catch (error) {
            console.error("❌ Normal post test error:", error)
            setResult({
                error: error instanceof Error ? error.message : "خطای غیرمنتظره",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p>برای تست ایجاد پست ابتدا وارد شوید</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">تست ایجاد پست</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>کاربر فعلی</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>تست ایجاد پست</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button onClick={testCreatePost} disabled={loading}>
                                {loading ? "در حال تست..." : "تست مستقیم"}
                            </Button>

                            <Button onClick={testNormalPost} disabled={loading} variant="outline">
                                {loading ? "در حال تست..." : "تست عادی"}
                            </Button>
                        </div>

                        {result && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">نتیجه تست:</h3>
                                <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
