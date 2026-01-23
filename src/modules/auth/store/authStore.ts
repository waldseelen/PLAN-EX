/**
 * Auth Store - Kullanıcı kimlik doğrulama state yönetimi
 * 
 * Supabase Auth ile entegre çalışır
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'
import type { PlanType } from '@/config/plans'

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  school?: string
  department?: string
  grade?: string
  plan: PlanType
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing'
  subscriptionEndDate?: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  // State
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  
  // Profile methods
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  
  // Subscription methods
  isPro: () => boolean
  canUseFeature: (feature: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      // Setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      // Sign in with email/password
      signIn: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
          })

          await get().fetchProfile()
        } catch (error) {
          console.error('[Auth] Sign in error:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Sign up with email/password
      signUp: async (email, password, fullName) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })

          if (error) throw error

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
          })

          // Create profile
          if (data.user) {
            const profileData = {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              plan: 'free',
            }

            const { error: profileError } = await supabase
              .from('profiles')
              .insert(profileData)

            if (profileError) {
              console.error('[Auth] Profile creation error:', profileError)
            }

            await get().fetchProfile()
          }
        } catch (error) {
          console.error('[Auth] Sign up error:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) throw error
        } catch (error) {
          console.error('[Auth] Google sign in error:', error)
          set({ isLoading: false })
          throw error
        }
      },

      // Sign in with GitHub
      signInWithGithub: async () => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) throw error
        } catch (error) {
          console.error('[Auth] GitHub sign in error:', error)
          set({ isLoading: false })
          throw error
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true })
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          set({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
          })
        } catch (error) {
          console.error('[Auth] Sign out error:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Reset password
      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          })

          if (error) throw error
        } catch (error) {
          console.error('[Auth] Reset password error:', error)
          throw error
        }
      },

      // Update password
      updatePassword: async (newPassword) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })

          if (error) throw error
        } catch (error) {
          console.error('[Auth] Update password error:', error)
          throw error
        }
      },

      // Fetch user profile
      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) throw error

          set({ profile: data as UserProfile })
        } catch (error) {
          console.error('[Auth] Fetch profile error:', error)
          throw error
        }
      },

      // Update user profile
      updateProfile: async (updates) => {
        const { user, profile } = get()
        if (!user || !profile) return

        try {
          const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
          }

          const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

          if (error) throw error

          set({
            profile: {
              ...profile,
              ...updates,
            } as UserProfile,
          })
        } catch (error) {
          console.error('[Auth] Update profile error:', error)
          throw error
        }
      },

      // Check if user is Pro
      isPro: () => {
        const { profile } = get()
        return profile?.plan === 'pro' && profile?.subscriptionStatus === 'active'
      },

      // Check if user can use a feature
      canUseFeature: (_feature) => {
        const { profile } = get()
        if (!profile) return false

        // Pro users can use all features
        if (get().isPro()) return true

        // Free users have limited features
        // Bu logic plans.ts'deki canUseFeature ile senkronize olmalı
        return false
      },
    }),
    {
      name: 'planex-auth',
      partialize: (state) => ({
        // Sadece gerekli state'i persist et
        user: state.user,
        profile: state.profile,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

/**
 * Auth state listener
 * 
 * Supabase auth state değişikliklerini dinler
 */
export function initAuthListener() {
  supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
    console.log('[Auth] State changed:', event)

    const store = useAuthStore.getState()

    if (event === 'SIGNED_IN' && session) {
      store.setUser(session.user)
      store.setSession(session)
      store.fetchProfile()
    } else if (event === 'SIGNED_OUT') {
      store.setUser(null)
      store.setProfile(null)
      store.setSession(null)
    } else if (event === 'TOKEN_REFRESHED' && session) {
      store.setSession(session)
    } else if (event === 'USER_UPDATED' && session) {
      store.setUser(session.user)
      store.fetchProfile()
    }

    store.setLoading(false)
  })

  // Initial session check
  supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
    if (session) {
      useAuthStore.getState().setUser(session.user)
      useAuthStore.getState().setSession(session)
      useAuthStore.getState().fetchProfile()
    }
    useAuthStore.getState().setLoading(false)
  })
}
