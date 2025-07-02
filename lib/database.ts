import Database from "better-sqlite3"
import { hash, compare } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import path from "path"

// استفاده از متغیرهای محیطی
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production"
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db")

// بررسی وجود کلید JWT
if (!process.env.JWT_SECRET) {
    console.warn("⚠️  JWT_SECRET not set in environment variables. Using fallback key.")
    console.warn("⚠️  Please set JWT_SECRET in your .env.local file for security.")
}

// ایجاد پوشه data اگر وجود ندارد
const dataDir = path.dirname(DATABASE_PATH)
const fs = require("fs")
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

// ایجاد دیتابیس
let db: Database.Database

try {
    db = new Database(DATABASE_PATH)
    console.log("✅ Database connected successfully at:", DATABASE_PATH)
} catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
}

// ایجاد جداول
export function initializeDatabase() {
    try {
        // جدول کاربران
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 email TEXT UNIQUE NOT NULL,
                                                 password TEXT NOT NULL,
                                                 first_name TEXT,
                                                 last_name TEXT,
                                                 full_name TEXT,
                                                 avatar_url TEXT,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // جدول پست‌ها
        db.exec(`
            CREATE TABLE IF NOT EXISTS posts (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 user_id INTEGER NOT NULL,
                                                 title TEXT,
                                                 template_id TEXT NOT NULL,
                                                 image_url TEXT,
                                                 caption TEXT,
                                                 topic TEXT,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
        `)

        // جدول نشست‌ها (sessions)
        db.exec(`
            CREATE TABLE IF NOT EXISTS sessions (
                                                    id TEXT PRIMARY KEY,
                                                    user_id INTEGER NOT NULL,
                                                    expires_at DATETIME NOT NULL,
                                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
        `)

        console.log("✅ Database tables initialized successfully")
    } catch (error) {
        console.error("❌ Database initialization failed:", error)
        throw error
    }
}

// انواع داده
export interface User {
    id: number
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
    avatar_url?: string
    created_at: string
    updated_at: string
}

export interface Post {
    id: number
    user_id: number
    title?: string
    template_id: string
    image_url?: string
    caption?: string
    topic?: string
    created_at: string
    updated_at: string
}

export interface Session {
    id: string
    user_id: number
    expires_at: string
    created_at: string
}

// توابع کاربر
export class UserService {
    static async createUser(userData: {
        email: string
        password: string
        first_name?: string
        last_name?: string
    }): Promise<User> {
        try {
            const hashedPassword = await hash(userData.password, 12)
            const full_name =
                userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`
                    : userData.first_name || userData.last_name || ""

            const stmt = db.prepare(`
                INSERT INTO users (email, password, first_name, last_name, full_name)
                VALUES (?, ?, ?, ?, ?)
            `)

            const result = stmt.run(
                userData.email,
                hashedPassword,
                userData.first_name || null,
                userData.last_name || null,
                full_name,
            )

            return this.getUserById(result.lastInsertRowid as number)
        } catch (error: any) {
            if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
                throw new Error("این ایمیل قبلاً ثبت شده است")
            }
            throw error
        }
    }

    static async authenticateUser(email: string, password: string): Promise<User | null> {
        try {
            const stmt = db.prepare("SELECT * FROM users WHERE email = ?")
            const user = stmt.get(email) as any

            if (!user) {
                return null
            }

            const isValidPassword = await compare(password, user.password)
            if (!isValidPassword) {
                return null
            }

            // حذف پسورد از نتیجه
            const { password: _, ...userWithoutPassword } = user
            return userWithoutPassword as User
        } catch (error) {
            console.error("Authentication error:", error)
            return null
        }
    }

    static getUserById(id: number): User {
        try {
            const stmt = db.prepare(
                "SELECT id, email, first_name, last_name, full_name, avatar_url, created_at, updated_at FROM users WHERE id = ?",
            )
            const user = stmt.get(id) as User

            if (!user) {
                throw new Error("کاربر یافت نشد")
            }

            return user
        } catch (error) {
            console.error("Get user error:", error)
            throw error
        }
    }

    static getUserByEmail(email: string): User | null {
        try {
            const stmt = db.prepare(
                "SELECT id, email, first_name, last_name, full_name, avatar_url, created_at, updated_at FROM users WHERE email = ?",
            )
            return (stmt.get(email) as User) || null
        } catch (error) {
            console.error("Get user by email error:", error)
            return null
        }
    }

    static updateUser(id: number, userData: Partial<User>): User {
        try {
            const updates: string[] = []
            const values: any[] = []

            Object.entries(userData).forEach(([key, value]) => {
                if (key !== "id" && key !== "created_at" && value !== undefined) {
                    updates.push(`${key} = ?`)
                    values.push(value)
                }
            })

            if (updates.length === 0) {
                return this.getUserById(id)
            }

            updates.push("updated_at = CURRENT_TIMESTAMP")
            values.push(id)

            const stmt = db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`)
            stmt.run(...values)

            return this.getUserById(id)
        } catch (error) {
            console.error("Update user error:", error)
            throw error
        }
    }
}

// توابع نشست
export class SessionService {
    static createSession(userId: number): string {
        try {
            const sessionId = this.generateSessionId()
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30) // 30 روز

            const stmt = db.prepare(`
                INSERT INTO sessions (id, user_id, expires_at)
                VALUES (?, ?, ?)
            `)

            stmt.run(sessionId, userId, expiresAt.toISOString())
            return sessionId
        } catch (error) {
            console.error("Create session error:", error)
            throw error
        }
    }

    static getSession(sessionId: string): Session | null {
        try {
            const stmt = db.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP")
            return (stmt.get(sessionId) as Session) || null
        } catch (error) {
            console.error("Get session error:", error)
            return null
        }
    }

    static deleteSession(sessionId: string): void {
        try {
            const stmt = db.prepare("DELETE FROM sessions WHERE id = ?")
            stmt.run(sessionId)
        } catch (error) {
            console.error("Delete session error:", error)
        }
    }

    static cleanExpiredSessions(): void {
        try {
            const stmt = db.prepare("DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP")
            stmt.run()
        } catch (error) {
            console.error("Clean expired sessions error:", error)
        }
    }

    private static generateSessionId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36)
    }
}

// توابع پست
export class PostService {
    static createPost(postData: {
        user_id: number
        title?: string
        template_id: string
        image_url?: string
        caption?: string
        topic?: string
    }): Post {
        try {
            const stmt = db.prepare(`
                INSERT INTO posts (user_id, title, template_id, image_url, caption, topic)
                VALUES (?, ?, ?, ?, ?, ?)
            `)

            const result = stmt.run(
                postData.user_id,
                postData.title || null,
                postData.template_id,
                postData.image_url || null,
                postData.caption || null,
                postData.topic || null,
            )

            return this.getPostById(result.lastInsertRowid as number)
        } catch (error) {
            console.error("Create post error:", error)
            throw error
        }
    }

    static getPostById(id: number): Post {
        try {
            const stmt = db.prepare("SELECT * FROM posts WHERE id = ?")
            const post = stmt.get(id) as Post

            if (!post) {
                throw new Error("پست یافت نشد")
            }

            return post
        } catch (error) {
            console.error("Get post error:", error)
            throw error
        }
    }

    static getUserPosts(userId: number, limit = 20, offset = 0): Post[] {
        try {
            const stmt = db.prepare("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
            return stmt.all(userId, limit, offset) as Post[]
        } catch (error) {
            console.error("Get user posts error:", error)
            return []
        }
    }

    static updatePost(id: number, userId: number, postData: Partial<Post>): Post {
        try {
            const updates: string[] = []
            const values: any[] = []

            Object.entries(postData).forEach(([key, value]) => {
                if (key !== "id" && key !== "user_id" && key !== "created_at" && value !== undefined) {
                    updates.push(`${key} = ?`)
                    values.push(value)
                }
            })

            if (updates.length === 0) {
                return this.getPostById(id)
            }

            updates.push("updated_at = CURRENT_TIMESTAMP")
            values.push(id, userId)

            const stmt = db.prepare(`UPDATE posts SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`)
            const result = stmt.run(...values)

            if (result.changes === 0) {
                throw new Error("پست یافت نشد یا شما مجاز به ویرایش آن نیستید")
            }

            return this.getPostById(id)
        } catch (error) {
            console.error("Update post error:", error)
            throw error
        }
    }

    static deletePost(id: number, userId: number): boolean {
        try {
            const stmt = db.prepare("DELETE FROM posts WHERE id = ? AND user_id = ?")
            const result = stmt.run(id, userId)
            return result.changes > 0
        } catch (error) {
            console.error("Delete post error:", error)
            return false
        }
    }
}

// توابع JWT
export class JWTService {
    static generateToken(payload: any): string {
        return sign(payload, JWT_SECRET, { expiresIn: "30d" })
    }

    static verifyToken(token: string): any {
        try {
            return verify(token, JWT_SECRET)
        } catch (error) {
            return null
        }
    }
}

// راه‌اندازی اولیه
initializeDatabase()

export { db }
