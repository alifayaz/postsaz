import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        console.log("🔄 Signup API called")

        const body = await request.json()
        console.log("📝 Request body:", { email: body.email, firstName: body.firstName, lastName: body.lastName })

        const { email, password, firstName, lastName } = body

        // اعتبارسنجی
        if (!email || !password) {
            console.log("❌ Missing email or password")
            return NextResponse.json({ error: "ایمیل و رمز عبور الزامی است" }, { status: 400 })
        }

        if (password.length < 6) {
            console.log("❌ Password too short")
            return NextResponse.json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد" }, { status: 400 })
        }

        console.log("🔄 Calling AuthService.signUp...")

        // ثبت نام
        const result = await AuthService.signUp({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        })

        console.log("✅ User created successfully:", result.user.email)

        return NextResponse.json({
            success: true,
            user: result.user,
            message: "ثبت نام با موفقیت انجام شد",
        })
    } catch (error: any) {
        console.error("❌ Signup API error:", error)
        return NextResponse.json({ error: error.message || "خطا در ثبت نام" }, { status: 400 })
    }
}
