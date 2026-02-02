/**
 * TypeScript types generated from Supabase database schema
 * Migration: 20260201000000_init_task_manager_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

// Database schema type for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_tags: {
        Row: {
          task_id: string;
          tag_id: string;
        };
        Insert: {
          task_id: string;
          tag_id: string;
        };
        Update: {
          task_id?: string;
          tag_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_status: TaskStatus;
      task_priority: TaskPriority;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for working with tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskTag = Database['public']['Tables']['task_tags']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskTagInsert = Database['public']['Tables']['task_tags']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
export type TaskTagUpdate = Database['public']['Tables']['task_tags']['Update'];

// Extended types with relations
export type TaskWithRelations = Task & {
  category: Category | null;
  tags: Tag[];
};
