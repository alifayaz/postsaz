import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, firstName, lastName } = body

        // اعتبارسنجی
        if (!email || !password) {
            return NextResponse.json({ error: "ایمیل و رمز عبور الزامی است" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد" }, { status: 400 })
        }

        // ثبت نام
        const result = await AuthService.signUp({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        })

        return NextResponse.json({
            success: true,
            user: result.user,
            message: "ثبت نام با موفقیت انجام شد",
        })
    } catch (error: any) {
        console.error("Signup API error:", error)
        return NextResponse.json({ error: error.message || "خطا در ثبت نام" }, { status: 400 })
    }
}
