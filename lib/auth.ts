import { cookies } from "next/headers"
import { UserService, SessionService, JWTService } from "./database"

export interface AuthUser {
    id: number
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
    avatar_url?: string
}

export class AuthService {
    static async signUp(userData: {
        email: string
        password: string
        first_name?: string
        last_name?: string
    }): Promise<{ user: AuthUser; token: string }> {
        try {
            // بررسی وجود کاربر
            const existingUser = UserService.getUserByEmail(userData.email)
            if (existingUser) {
                throw new Error("این ایمیل قبلاً ثبت شده است")
            }

            // ایجاد کاربر جدید
            const user = await UserService.createUser(userData)

            // ایجاد نشست
            const sessionId = SessionService.createSession(user.id)

            // ایجاد JWT
            const token = JWTService.generateToken({
                userId: user.id,
                sessionId,
                email: user.email,
            })

            // تنظیم کوکی
            const cookieStore = cookies()
            cookieStore.set("auth-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60, // 30 روز
            })

            const { password: _, ...userWithoutPassword } = user as any
            return { user: userWithoutPassword, token }
        } catch (error) {
            console.error("Sign up error:", error)
            throw error
        }
    }

    static async signIn(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
        try {
            // احراز هویت کاربر
            const user = await UserService.authenticateUser(email, password)
            if (!user) {
                throw new Error("ایمیل یا رمز عبور اشتباه است")
            }

            // ایجاد نشست
            const sessionId = SessionService.createSession(user.id)

            // ایجاد JWT
            const token = JWTService.generateToken({
                userId: user.id,
                sessionId,
                email: user.email,
            })

            // تنظیم کوکی
            const cookieStore = cookies()
            cookieStore.set("auth-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60, // 30 روز
            })

            return { user, token }
        } catch (error) {
            console.error("Sign in error:", error)
            throw error
        }
    }

    static async getCurrentUser(): Promise<AuthUser | null> {
        try {
            const cookieStore = cookies()
            const token = cookieStore.get("auth-token")?.value

            if (!token) {
                return null
            }

            // تأیید JWT
            const payload = JWTService.verifyToken(token)
            if (!payload) {
                return null
            }

            // بررسی نشست
            const session = SessionService.getSession(payload.sessionId)
            if (!session) {
                return null
            }

            // دریافت کاربر
            const user = UserService.getUserById(payload.userId)
            return user
        } catch (error) {
            console.error("Get current user error:", error)
            return null
        }
    }

    static async signOut(): Promise<void> {
        try {
            const cookieStore = cookies()
            const token = cookieStore.get("auth-token")?.value

            if (token) {
                const payload = JWTService.verifyToken(token)
                if (payload?.sessionId) {
                    SessionService.deleteSession(payload.sessionId)
                }
            }

            // حذف کوکی
            cookieStore.delete("auth-token")
        } catch (error) {
            console.error("Sign out error:", error)
        }
    }

    static async requireAuth(): Promise<AuthUser> {
        const user = await this.getCurrentUser()
        if (!user) {
            throw new Error("احراز هویت مورد نیاز است")
        }
        return user
    }
}
