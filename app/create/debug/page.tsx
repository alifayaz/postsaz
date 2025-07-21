"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

export default function CreateDebugPage() {
    const { user } = useAuth()
    const [debugInfo, setDebugInfo] = useState<any>(null)

    const testCreateFlow = async () => {
        if (!user) {
            alert("ابتدا وارد شوید")
            return
        }

        try {
            console.log("🔄 Testing complete create flow...")

            // مرحله 1: تولید کپشن
            console.log("📝 Step 1: Generate caption")
            const { generateSmartCaption } = await import("@/lib/smart-caption-generator")

            const captionResult = await generateSmartCaption({
                topic: "تست",
                style: "casual",
                length: "medium",
                includeHashtags: true,
            })

            console.log("✅ Caption generated:", captionResult)

            if (!captionResult.success) {
                throw new Error("خطا در تولید کپشن")
            }

            // مرحله 2: ذخیره پست
            console.log("💾 Step 2: Save post")
            const postData = {
                title: "پست تست کامل",
                template_id: "modern",
                image_url: null,
                caption: captionResult.caption,
                topic: "تست",
            }

            const response = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            })

            const saveResult = await response.json()
            console.log("✅ Post save result:", saveResult)

            setDebugInfo({
                user: user,
                captionGeneration: captionResult,
                postSave: {
                    status: response.status,
                    data: saveResult,
                },
                success: response.ok && saveResult.success,
            })
        } catch (error: any) {
            console.error("❌ Test flow error:", error)
            setDebugInfo({
                error: error.message,
                stack: error.stack,
            })
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">دیباگ صفحه Create</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>تست کامل فرآیند ایجاد پست</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user ? (
                            <>
                                <p className="text-green-600">✅ کاربر وارد شده: {user.email}</p>
                                <Button onClick={testCreateFlow}>تست کامل فرآیند (تولید کپشن + ذخیره)</Button>
                            </>
                        ) : (
                            <p className="text-red-600">❌ کاربر وارد نشده است</p>
                        )}

                        {debugInfo && (
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">نتیجه تست:</h3>
                                <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
