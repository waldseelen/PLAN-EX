/**
 * Supabase Configuration
 * 
 * Cloud backend için Supabase client yapılandırması
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] URL veya Anon Key bulunamadı. Cloud sync devre dışı.'
  )
}

/**
 * Supabase client instance
 * 
 * Auth, Database, Storage ve Realtime için kullanılır
 */
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'plan-ex',
      },
    },
  }
)

/**
 * Supabase bağlantısı aktif mi?
 */
export function isSupabaseEnabled(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

/**
 * Sync özelliği aktif mi?
 */
export function isSyncEnabled(): boolean {
  return (
    isSupabaseEnabled() &&
    import.meta.env.VITE_ENABLE_SYNC === 'true'
  )
}
