import { supabase } from "@/lib/supabase"

export interface EmailCheckResult {
  exists: boolean
  confirmed: boolean
  error?: string
}

export async function checkEmailStatus(email: string): Promise<EmailCheckResult> {
  try {
    console.log("🔍 Checking email status:", email)

    // روش جدید: تلاش برای ثبت نام با رمز تصادفی و بررسی نوع خطا
    const tempPassword = "TempCheck123!@#" + Math.random().toString(36)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      options: {
        data: {
          temp_check: true, // علامت‌گذاری برای بررسی موقت
        },
      },
    })

    console.log("📊 Signup check response:", {
      hasData: !!data,
      hasUser: !!data?.user,
      hasIdentities: data?.user?.identities?.length || 0,
      error: error?.message,
    })

    if (error) {
      // بررسی انواع خطاهای مختلف
      if (
          error.message.includes("User already registered") ||
          error.message.includes("already been registered") ||
          error.message.includes("email address is already registered") ||
          error.message.includes("A user with this email address has already been registered")
      ) {
        console.log("❌ Email already exists")
        return { exists: true, confirmed: true }
      } else {
        console.log("✅ Email is available (got other error):", error.message)
        return { exists: false, confirmed: false }
      }
    }

    // اگر خطایی نبود، بررسی کنیم که آیا واقعاً کاربر جدید است
    if (data?.user) {
      // اگر identities خالی باشد، یعنی کاربر قبلاً وجود داشته
      if (data.user.identities && data.user.identities.length === 0) {
        console.log("❌ Email exists but not confirmed")
        return { exists: true, confirmed: false }
      } else {
        console.log("⚠️ New user created during check - this shouldn't happen in production")
        // در حالت تست، کاربر جدید ایجاد شد
        // در production باید این کاربر را حذف کنیم یا از روش دیگری استفاده کنیم
        return { exists: false, confirmed: false }
      }
    }

    console.log("✅ Email is available")
    return { exists: false, confirmed: false }
  } catch (error) {
    console.error("Error checking email status:", error)
    return { exists: false, confirmed: false, error: "خطا در بررسی ایمیل" }
  }
}

export async function resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("📧 Resending confirmation email to:", email)

    // تابع کمکی برای تشخیص URL صحیح
    const getRedirectURL = () => {
      if (typeof window !== "undefined") {
        const { protocol, host } = window.location
        return `${protocol}//${host}/auth/callback`
      }
      return `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`
    }

    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: getRedirectURL(),
      },
    })

    if (error) {
      console.error("❌ Resend error:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Confirmation email resent successfully")
    return { success: true }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return { success: false, error: "خطای غیرمنتظره" }
  }
}
