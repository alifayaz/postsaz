import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "کاربر وارد نشده است" }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            user,
        })
    } catch (error: any) {
        console.error("Get current user API error:", error)
        return NextResponse.json({ error: error.message || "خطا در دریافت اطلاعات کاربر" }, { status: 500 })
    }
}
