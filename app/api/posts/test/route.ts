import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { PostService } from "@/lib/database"

export async function POST(request: NextRequest) {
    try {
        console.log("🔄 Test POST /api/posts/test called")

        // بررسی احراز هویت
        const user = await AuthService.getCurrentUser()
        console.log("👤 Current user:", user)

        if (!user) {
            return NextResponse.json({ error: "کاربر وارد نشده است" }, { status: 401 })
        }

        // تست مستقیم ایجاد پست
        console.log("🔄 Testing direct post creation...")

        const testPostData = {
            user_id: user.id,
            title: "پست تست",
            template_id: "modern",
            image_url: '',
            caption: "این یک کپشن تست است",
            topic: "تست",
        }

        console.log("📝 Test post data:", testPostData)

        const post = PostService.createPost(testPostData)
        console.log("✅ Test post created:", post)

        return NextResponse.json({
            success: true,
            message: "پست تست با موفقیت ایجاد شد",
            post: post,
            user: user,
        })
    } catch (error: any) {
        console.error("❌ Test post creation error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
        })
    }
}
