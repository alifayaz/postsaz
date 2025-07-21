import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST() {
    try {
        await AuthService.signOut()

        return NextResponse.json({
            success: true,
            message: "خروج با موفقیت انجام شد",
        })
    } catch (error: any) {
        console.error("Signout API error:", error)
        return NextResponse.json({ error: error.message || "خطا در خروج" }, { status: 500 })
    }
}
