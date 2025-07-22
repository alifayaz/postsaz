import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 DELETE /api/posts/[id] - Starting...")

    const supabase = createServerClient(request)

    // بررسی احراز هویت
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("👤 User check:", { user: user?.id, error: authError?.message })

    if (authError || !user) {
      console.log("❌ Unauthorized - No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    console.log("🗑️ Deleting post:", postId)

    // بررسی وجود پست و مالکیت
    const { data: post, error: fetchError } = await supabase.from("posts").select("user_id").eq("id", postId).single()

    if (fetchError || !post) {
      console.log("❌ Post not found:", fetchError?.message)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.user_id !== user.id) {
      console.log("❌ Forbidden - User doesn't own this post")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // حذف پست
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("❌ Delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete post: " + deleteError.message }, { status: 500 })
    }

    console.log("✅ Post deleted successfully")
    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 PUT /api/posts/[id] - Starting...")

    const supabase = createServerClient(request)

    // بررسی احراز هویت
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("👤 User check:", { user: user?.id, error: authError?.message })

    if (authError || !user) {
      console.log("❌ Unauthorized - No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const body = await request.json()
    console.log("📝 Update request:", { postId, body })

    const { title, template_id, image_url, caption, topic } = body

    // Validation
    if (!title || !template_id || !caption) {
      console.log("❌ Validation failed - Missing required fields")
      return NextResponse.json({ error: "Title, template_id, and caption are required" }, { status: 400 })
    }

    // بررسی وجود پست و مالکیت
    const { data: existingPost, error: fetchError } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single()

    if (fetchError || !existingPost) {
      console.log("❌ Post not found:", fetchError?.message)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (existingPost.user_id !== user.id) {
      console.log("❌ Forbidden - User doesn't own this post")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // بروزرسانی پست
    const { data: post, error: updateError } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          template_id,
          image_url: image_url || null,
          caption: caption.trim(),
          topic: topic || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .select()
        .single()

    if (updateError) {
      console.error("❌ Update error:", updateError)
      return NextResponse.json({ error: "Failed to update post: " + updateError.message }, { status: 500 })
    }

    console.log("✅ Post updated successfully")
    return NextResponse.json({
      success: true,
      post,
      message: "Post updated successfully",
    })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
