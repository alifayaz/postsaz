import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
    try {
        const database = db()
        if (!db) {
            return NextResponse.json({ error: "Database not available" }, { status: 503 })
        }

        // بررسی تعداد پست‌ها
        const postCount = database?.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number }

        // نمایش همه پست‌ها
        const allPosts = database?.prepare("SELECT * FROM posts ORDER BY created_at DESC").all()

        // بررسی تعداد کاربران
        const userCount = database?.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }

        // نمایش همه کاربران
        const allUsers = database?.prepare("SELECT id, email, first_name, last_name, created_at FROM users").all()

        return NextResponse.json({
            success: true,
            database: {
                postCount: postCount.count,
                posts: allPosts,
                userCount: userCount.count,
                users: allUsers,
            },
        })
    } catch (error: any) {
        console.error("Debug posts API error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
        })
    }
}
