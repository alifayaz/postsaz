import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // اعتبارسنجی
        if (!email || !password) {
            return NextResponse.json({ error: "ایمیل و رمز عبور الزامی است" }, { status: 400 })
        }

        // ورود
        const result = await AuthService.signIn(email, password)

        return NextResponse.json({
            success: true,
            user: result.user,
            message: "ورود با موفقیت انجام شد",
        })
    } catch (error: any) {
        console.error("Signin API error:", error)
        return NextResponse.json({ error: error.message || "خطا در ورود" }, { status: 401 })
    }
}
