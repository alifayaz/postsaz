import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://agjdeylhwrvsrouftljn.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnamRleWxod3J2c3JvdWZ0bGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTA1MzIsImV4cCI6MjA2NTI4NjUzMn0.yUUc5GM92v8POTeBmTcNeS5x76Akki3z1WTbXC5ZViQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}
