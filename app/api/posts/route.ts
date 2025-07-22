import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 POST /api/posts - Starting...")

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

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { title, template_id, image_url, caption, topic } = body

    // Validation
    if (!title || !template_id || !caption) {
      console.log("❌ Validation failed - Missing required fields")
      return NextResponse.json({ error: "Title, template_id, and caption are required" }, { status: 400 })
    }

    // ذخیره پست در دیتابیس
    console.log("💾 Saving post to database...")
    const { data: post, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          template_id,
          image_url: image_url || null,
          caption: caption.trim(),
          topic: topic || null,
        })
        .select()
        .single()

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ error: "Failed to save post: " + error.message }, { status: 500 })
    }

    console.log("✅ Post saved successfully:", post.id)
    return NextResponse.json({
      success: true,
      post,
      message: "Post saved successfully",
    })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 GET /api/posts - Starting...")

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

    // دریافت پست‌های کاربر
    console.log("📖 Fetching user posts...")
    const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ error: "Failed to fetch posts: " + error.message }, { status: 500 })
    }

    console.log("✅ Posts fetched successfully:", posts?.length || 0)
    return NextResponse.json({
      success: true,
      posts: posts || [],
    })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
