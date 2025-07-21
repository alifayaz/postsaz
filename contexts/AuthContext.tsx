"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("🔄 Checking authentication...")
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        console.log("✅ User authenticated:", data.user?.email)
        setUser(data.user)
      } else {
        console.log("ℹ️ No authenticated user")
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔄 Signing in user:", email)

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Sign in failed:", data.error)
        throw new Error(data.error || "خطا در ورود")
      }

      console.log("✅ Sign in successful:", data.user?.email)
      setUser(data.user)
    } catch (error) {
      console.error("❌ Sign in error:", error)
      throw error
    }
  }

  const signUp = async (userData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) => {
    try {
      console.log("🔄 Signing up user:", userData.email)

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Sign up failed:", data.error)
        throw new Error(data.error || "خطا در ثبت نام")
      }

      console.log("✅ Sign up successful:", data.user?.email)
      setUser(data.user)
    } catch (error) {
      console.error("❌ Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("🔄 Signing out...")

      await fetch("/api/auth/signout", {
        method: "POST",
      })

      console.log("✅ Sign out successful")
      setUser(null)
    } catch (error) {
      console.error("❌ Sign out error:", error)
      // حتی در صورت خطا، کاربر را خارج کنیم
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
