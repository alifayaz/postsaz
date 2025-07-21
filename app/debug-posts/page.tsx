"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPostsPage() {
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const checkDatabase = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/posts/debug")
            const data = await response.json()
            setDebugInfo(data)
        } catch (error) {
            console.error("Debug error:", error)
            setDebugInfo({ error: "خطا در اتصال به API" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkDatabase()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">دیباگ پست‌ها</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>وضعیت دیتابیس پست‌ها</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={checkDatabase} disabled={loading}>
                            {loading ? "در حال بررسی..." : "بررسی مجدد"}
                        </Button>

                        {debugInfo && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
