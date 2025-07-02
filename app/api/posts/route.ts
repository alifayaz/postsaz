import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { PostService } from "@/lib/database"

export async function GET(request: NextRequest) {
    try {
        console.log("🔄 GET /api/posts called")

        const user = await AuthService.getCurrentUser()
        if (!user) {
            console.log("❌ No authenticated user")
            return NextResponse.json({ error: "احراز هویت مورد نیاز است" }, { status: 401 })
        }

        console.log("✅ User authenticated:", user.email, "ID:", user.id)

        const { searchParams } = new URL(request.url)
        const limit = Number.parseInt(searchParams.get("limit") || "20")
        const offset = Number.parseInt(searchParams.get("offset") || "0")

        console.log("🔄 Fetching posts for user:", user.id, "limit:", limit, "offset:", offset)

        const posts = PostService.getUserPosts(user.id, limit, offset)
        console.log("✅ Posts fetched:", posts.length)

        return NextResponse.json({
            success: true,
            posts,
        })
    } catch (error: any) {
        console.error("❌ Get posts API error:", error)
        return NextResponse.json({ error: error.message || "خطا در دریافت پست‌ها" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log("🔄 POST /api/posts called")

        const user = await AuthService.getCurrentUser()
        if (!user) {
            console.log("❌ No authenticated user")
            return NextResponse.json({ error: "احراز هویت مورد نیاز است" }, { status: 401 })
        }

        console.log("✅ User authenticated:", user.email, "ID:", user.id)

        const body = await request.json()
        console.log("📝 Request body:", body)

        const { title, template_id, image_url, caption, topic } = body

        if (!template_id) {
            console.log("❌ Missing template_id")
            return NextResponse.json({ error: "شناسه قالب الزامی است" }, { status: 400 })
        }

        if (!caption) {
            console.log("❌ Missing caption")
            return NextResponse.json({ error: "کپشن الزامی است" }, { status: 400 })
        }

        console.log("🔄 Creating post with data:", {
            user_id: user.id,
            title,
            template_id,
            image_url: image_url ? "provided" : "null",
            caption: caption.substring(0, 50) + "...",
            topic,
        })

        const post = PostService.createPost({
            user_id: user.id,
            title,
            template_id,
            image_url,
            caption,
            topic,
        })

        console.log("✅ Post created successfully:", post.id)

        return NextResponse.json({
            success: true,
            post,
            message: "پست با موفقیت ایجاد شد",
        })
    } catch (error: any) {
        console.error("❌ Create post API error:", error)
        return NextResponse.json(
            {
                error: error.message || "خطا در ایجاد پست",
                details: error.stack,
            },
            { status: 500 },
        )
    }
}
