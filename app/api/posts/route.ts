import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { PostService } from "@/lib/database"

export async function GET(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "احراز هویت مورد نیاز است" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = Number.parseInt(searchParams.get("limit") || "20")
        const offset = Number.parseInt(searchParams.get("offset") || "0")

        const posts = PostService.getUserPosts(user.id, limit, offset)

        return NextResponse.json({
            success: true,
            posts,
        })
    } catch (error: any) {
        console.error("Get posts API error:", error)
        return NextResponse.json({ error: error.message || "خطا در دریافت پست‌ها" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "احراز هویت مورد نیاز است" }, { status: 401 })
        }

        const body = await request.json()
        const { title, template_id, image_url, caption, topic } = body

        if (!template_id) {
            return NextResponse.json({ error: "شناسه قالب الزامی است" }, { status: 400 })
        }

        const post = PostService.createPost({
            user_id: user.id,
            title,
            template_id,
            image_url,
            caption,
            topic,
        })

        return NextResponse.json({
            success: true,
            post,
            message: "پست با موفقیت ایجاد شد",
        })
    } catch (error: any) {
        console.error("Create post API error:", error)
        return NextResponse.json({ error: error.message || "خطا در ایجاد پست" }, { status: 500 })
    }
}
