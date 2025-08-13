import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name?: string
  display_name?: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}
