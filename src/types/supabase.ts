/**
 * Supabase Database Types
 * 
 * Auto-generated from Supabase schema
 * Komut: npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          school: string | null
          department: string | null
          grade: string | null
          plan: 'free' | 'pro'
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          subscription_end_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          school?: string | null
          department?: string | null
          grade?: string | null
          plan?: 'free' | 'pro'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          school?: string | null
          department?: string | null
          grade?: string | null
          plan?: 'free' | 'pro'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          user_id: string
          name: string
          code: string | null
          color: string
          instructor: string | null
          credits: number | null
          semester: string | null
          archived: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          code?: string | null
          color?: string
          instructor?: string | null
          credits?: number | null
          semester?: string | null
          archived?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          code?: string | null
          color?: string
          instructor?: string | null
          credits?: number | null
          semester?: string | null
          archived?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          user_id: string
          course_id: string
          name: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          name: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          unit_id: string | null
          title: string
          description: string | null
          completed: boolean
          completed_at: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          unit_id?: string | null
          title: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          unit_id?: string | null
          title?: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          title: string
          description: string | null
          type: 'exam' | 'midterm' | 'final' | 'assignment' | 'project' | 'other'
          date: string
          location: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          title: string
          description?: string | null
          type: 'exam' | 'midterm' | 'final' | 'assignment' | 'project' | 'other'
          date: string
          location?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          title?: string
          description?: string | null
          type?: 'exam' | 'midterm' | 'final' | 'assignment' | 'project' | 'other'
          date?: string
          location?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          frequency: 'daily' | 'weekly' | 'custom'
          target_days: Json | null
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          frequency: 'daily' | 'weekly' | 'custom'
          target_days?: Json | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          frequency?: 'daily' | 'weekly' | 'custom'
          target_days?: Json | null
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          status: 'done' | 'skipped' | 'missed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          date: string
          status: 'done' | 'skipped' | 'missed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          date?: string
          status?: 'done' | 'skipped' | 'missed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lecture_notes: {
        Row: {
          id: string
          user_id: string
          course_id: string
          title: string
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          title: string
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          title?: string
          file_name?: string
          file_size?: number
          file_type?: string
          storage_path?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      sync_metadata: {
        Row: {
          id: string
          user_id: string
          table_name: string
          record_id: string
          last_synced_at: string
          local_version: number
          cloud_version: number
          conflict_resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          table_name: string
          record_id: string
          last_synced_at?: string
          local_version?: number
          cloud_version?: number
          conflict_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          table_name?: string
          record_id?: string
          last_synced_at?: string
          local_version?: number
          cloud_version?: number
          conflict_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
