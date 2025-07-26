import { supabase } from "@/lib/supabase"

export interface EmailCheckResult {
  exists: boolean
  error?: string
}

export async function checkEmailExists(email: string): Promise<EmailCheckResult> {
  try {
    console.log("🔍 Checking email existence:", email)

    // روش 1: استفاده از Auth API (محدود است)
    // Supabase Auth API معمولاً اجازه بررسی مستقیم وجود ایمیل را نمی‌دهد

    // روش 2: تلاش برای ثبت نام و بررسی خطا
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: "temp_password_for_check_123456", // رمز موقت
      options: {
        data: {
          temp_check: true, // علامت‌گذاری که این یک بررسی موقت است
        },
      },
    })

    if (error) {
      if (
        error.message.includes("User already registered") ||
        error.message.includes("already been registered") ||
        error.message.includes("email address is already registered")
      ) {
        return { exists: true }
      } else {
        return { exists: false, error: error.message }
      }
    }

    // اگر ثبت نام موفق بود، یعنی ایمیل وجود نداشت
    // باید این کاربر موقت را حذف کنیم (اما این کار پیچیده است)
    return { exists: false }
  } catch (error) {
    console.error("Error checking email:", error)
    return { exists: false, error: "خطا در بررسی ایمیل" }
  }
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    return { valid: false, error: "ایمیل الزامی است" }
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: "فرمت ایمیل نامعتبر است" }
  }

  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: "رمز عبور الزامی است" }
  }

  if (password.length < 6) {
    return { valid: false, error: "رمز عبور باید حداقل ۶ کاراکتر باشد" }
  }

  if (password.length > 72) {
    return { valid: false, error: "رمز عبور نباید بیش از ۷۲ کاراکتر باشد" }
  }

  // بررسی قدرت رمز عبور (اختیاری)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length

  if (strength < 2) {
    return {
      valid: true, // قبول می‌کنیم اما هشدار می‌دهیم
      error: "رمز عبور ضعیف است. ترکیبی از حروف، اعداد و نمادها استفاده کنید",
    }
  }

  return { valid: true }
}

export function validateName(name: string, fieldName: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: `${fieldName} الزامی است` }
  }

  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} باید حداقل ۲ کاراکتر باشد` }
  }

  if (name.trim().length > 50) {
    return { valid: false, error: `${fieldName} نباید بیش از ۵۰ کاراکتر باشد` }
  }

  // بررسی کاراکترهای مجاز (فارسی، انگلیسی، فاصله)
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/
  if (!nameRegex.test(name)) {
    return { valid: false, error: `${fieldName} فقط می‌تواند شامل حروف فارسی و انگلیسی باشد` }
  }

  return { valid: true }
}
