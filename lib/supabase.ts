import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "your-supabase-url"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-anon-key"

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// Default export for client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side function to create authenticated client
export function createServerClient(request: Request) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          const cookies = request.headers.get("cookie")
          if (!cookies) return null

          const cookie = cookies.split(";").find((c) => c.trim().startsWith(`${key}=`))

          return cookie ? decodeURIComponent(cookie.split("=")[1]) : null
        },
        setItem: () => {
          // No-op for server-side
        },
        removeItem: () => {
          // No-op for server-side
        },
      },
    },
  })
}
