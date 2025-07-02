import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { PostService } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "احراز هویت مورد نیاز است" }, { status: 401 })
        }

        const postId = Number.parseInt(params.id)
        if (isNaN(postId)) {
            return NextResponse.json({ error: "شناسه پست نامعتبر است" }, { status: 400 })
        }

        const success = PostService.deletePost(postId, user.id)

        if (!success) {
            return NextResponse.json({ error: "پست یافت نشد یا شما مجاز به حذف آن نیستید" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "پست با موفقیت حذف شد",
        })
    } catch (error: any) {
        console.error("Delete post API error:", error)
        return NextResponse.json({ error: error.message || "خطا در حذف پست" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await AuthService.getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "احراز هویت مورد نیاز است" }, { status: 401 })
        }

        const postId = Number.parseInt(params.id)
        if (isNaN(postId)) {
            return NextResponse.json({ error: "شناسه پست نامعتبر است" }, { status: 400 })
        }

        const body = await request.json()
        const { title, template_id, image_url, caption, topic } = body

        const updatedPost = PostService.updatePost(postId, user.id, {
            title,
            template_id,
            image_url,
            caption,
            topic,
        })

        return NextResponse.json({
            success: true,
            post: updatedPost,
            message: "پست با موفقیت بروزرسانی شد",
        })
    } catch (error: any) {
        console.error("Update post API error:", error)
        return NextResponse.json({ error: error.message || "خطا در بروزرسانی پست" }, { status: 500 })
    }
}
