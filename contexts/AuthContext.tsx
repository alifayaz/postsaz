"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("🔍 Initial session check:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
        })

        setUser(session?.user ?? null)
      } catch (error) {
        console.error("❌ Error getting initial session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
      })

      setUser(session?.user ?? null)
      setLoading(false)

      // اگر کاربر تأیید شد، hash را از URL پاک کن
      if (event === "SIGNED_IN" && typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...")
      await supabase.auth.signOut()
      console.log("✅ Signed out successfully")
    } catch (error) {
      console.error("❌ Error signing out:", error)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
