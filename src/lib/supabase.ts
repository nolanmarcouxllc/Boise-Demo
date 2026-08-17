import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-safe configuration only. The publishable key is designed to be public;
 * every table is protected by row-level security. A service-role key must never
 * appear in this bundle.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export const CLOUD_DISABLED_MESSAGE =
  'Cloud saving is not configured. The presentation remains available using local storage.'
