export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_views: {
        Row: {
          created_at: string
          id: string
          last_watched_at: string | null
          updated_at: string
          user_id: string
          video_1_watched: boolean
          video_2_watched: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          last_watched_at?: string | null
          updated_at?: string
          user_id: string
          video_1_watched?: boolean
          video_2_watched?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          last_watched_at?: string | null
          updated_at?: string
          user_id?: string
          video_1_watched?: boolean
          video_2_watched?: boolean
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      departmental_courses: {
        Row: {
          course_code: string
          course_title: string
          created_at: string
          created_by: string | null
          department: string
          id: string
          level: string
          semester: string
          session: string
          status: string
          units: number
          updated_at: string
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string
          created_by?: string | null
          department: string
          id?: string
          level: string
          semester: string
          session: string
          status?: string
          units?: number
          updated_at?: string
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string
          created_by?: string | null
          department?: string
          id?: string
          level?: string
          semester?: string
          session?: string
          status?: string
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          course_id: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_admin_reply: boolean
          likes: number
          parent_id: string | null
          updated_at: string
          user_avatar: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_admin_reply?: boolean
          likes?: number
          parent_id?: string | null
          updated_at?: string
          user_avatar?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_admin_reply?: boolean
          likes?: number
          parent_id?: string | null
          updated_at?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department: string
          description: string
          id: string
          level: string
          overview: string
          semester: string
          status: string
          title: string
          units: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department: string
          description: string
          id?: string
          level: string
          overview: string
          semester: string
          status: string
          title: string
          units: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department?: string
          description?: string
          id?: string
          level?: string
          overview?: string
          semester?: string
          status?: string
          title?: string
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          avatar: string | null
          course_id: string
          created_at: string
          id: string
          name: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          course_id: string
          created_at?: string
          id?: string
          name: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          course_id?: string
          created_at?: string
          id?: string
          name?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          course_id: string
          created_at: string
          duration: string | null
          id: string
          link: string
          pages: number | null
          title: string
          type: string
        }
        Insert: {
          course_id: string
          created_at?: string
          duration?: string | null
          id?: string
          link: string
          pages?: number | null
          title: string
          type: string
        }
        Update: {
          course_id?: string
          created_at?: string
          duration?: string | null
          id?: string
          link?: string
          pages?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          date: string
          excerpt: string
          external_link: string | null
          google_ads_slot: string | null
          id: string
          is_external: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          date?: string
          excerpt: string
          external_link?: string | null
          google_ads_slot?: string | null
          id?: string
          is_external?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          date?: string
          excerpt?: string
          external_link?: string | null
          google_ads_slot?: string | null
          id?: string
          is_external?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      past_questions: {
        Row: {
          course_id: string
          created_at: string
          id: string
          link: string
          semester: string
          year: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          link: string
          semester: string
          year: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          link?: string
          semester?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "past_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      private_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          online_at: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          online_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          online_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quiz_history: {
        Row: {
          course_id: string
          created_at: string
          id: string
          questions_data: Json
          score: number
          time_taken: number | null
          total_questions: number
          user_id: string
          user_name: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          questions_data: Json
          score?: number
          time_taken?: number | null
          total_questions: number
          user_id: string
          user_name: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          questions_data?: Json
          score?: number
          time_taken?: number | null
          total_questions?: number
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          course_id: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          question: string
        }
        Insert: {
          correct_answer: number
          course_id: string
          created_at?: string
          explanation?: string | null
          id?: string
          options: Json
          question: string
        }
        Update: {
          correct_answer?: number
          course_id?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: string
          apply_link: string
          created_at: string
          created_by: string | null
          deadline: string
          description: string
          google_ads_slot: string | null
          id: string
          is_active: boolean
          level: string
          provider: string
          requirements: Json
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: string
          apply_link: string
          created_at?: string
          created_by?: string | null
          deadline: string
          description: string
          google_ads_slot?: string | null
          id?: string
          is_active?: boolean
          level: string
          provider: string
          requirements?: Json
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: string
          apply_link?: string
          created_at?: string
          created_by?: string | null
          deadline?: string
          description?: string
          google_ads_slot?: string | null
          id?: string
          is_active?: boolean
          level?: string
          provider?: string
          requirements?: Json
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      textbooks: {
        Row: {
          author: string
          course_id: string
          created_at: string
          download_link: string | null
          id: string
          title: string
          year: number
        }
        Insert: {
          author: string
          course_id: string
          created_at?: string
          download_link?: string | null
          id?: string
          title: string
          year: number
        }
        Update: {
          author?: string
          course_id?: string
          created_at?: string
          download_link?: string | null
          id?: string
          title?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "textbooks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "head_admin" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["head_admin", "admin", "user"],
    },
  },
} as const
