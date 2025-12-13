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
      department_announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          department_space_id: string
          id: string
          is_urgent: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          department_space_id: string
          id?: string
          is_urgent?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          department_space_id?: string
          id?: string
          is_urgent?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_announcements_department_space_id_fkey"
            columns: ["department_space_id"]
            isOneToOne: false
            referencedRelation: "department_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      department_members: {
        Row: {
          department_space_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["department_role"]
          user_id: string
        }
        Insert: {
          department_space_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["department_role"]
          user_id: string
        }
        Update: {
          department_space_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["department_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_members_department_space_id_fkey"
            columns: ["department_space_id"]
            isOneToOne: false
            referencedRelation: "department_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      department_spaces: {
        Row: {
          code_hash: string
          created_at: string
          created_by: string | null
          department: string
          display_tag: string
          id: string
          level: string
          school: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          created_by?: string | null
          department: string
          display_tag: string
          id?: string
          level: string
          school: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          created_by?: string | null
          department?: string
          display_tag?: string
          id?: string
          level?: string
          school?: string
        }
        Relationships: []
      }
      department_timetables: {
        Row: {
          course_code: string
          course_title: string
          created_at: string
          created_by: string
          day_of_week: string
          department_space_id: string
          end_time: string
          id: string
          lecturer: string | null
          start_time: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string
          created_by: string
          day_of_week: string
          department_space_id: string
          end_time: string
          id?: string
          lecturer?: string | null
          start_time: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string
          created_by?: string
          day_of_week?: string
          department_space_id?: string
          end_time?: string
          id?: string
          lecturer?: string | null
          start_time?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_timetables_department_space_id_fkey"
            columns: ["department_space_id"]
            isOneToOne: false
            referencedRelation: "department_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      department_votes: {
        Row: {
          created_at: string
          created_by: string
          department_space_id: string
          ended_at: string | null
          id: string
          is_active: boolean
          started_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          department_space_id: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string | null
          title?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          department_space_id?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_votes_department_space_id_fkey"
            columns: ["department_space_id"]
            isOneToOne: false
            referencedRelation: "department_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      departmental_courses: {
        Row: {
          course_code: string
          course_title: string
          created_at: string | null
          created_by: string | null
          department: string
          id: string
          level: string
          semester: string
          session: string
          status: string
          units: number
          updated_at: string | null
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string | null
          created_by?: string | null
          department: string
          id?: string
          level: string
          semester: string
          session: string
          status?: string
          units?: number
          updated_at?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string | null
          created_by?: string | null
          department?: string
          id?: string
          level?: string
          semester?: string
          session?: string
          status?: string
          units?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
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
      user_votes: {
        Row: {
          id: string
          user_id: string
          vote_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vote_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vote_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "department_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_candidates: {
        Row: {
          created_at: string
          id: string
          manifesto: string | null
          user_id: string
          vote_count: number
          vote_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manifesto?: string | null
          user_id: string
          vote_count?: number
          vote_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manifesto?: string | null
          user_id?: string
          vote_count?: number
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_candidates_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "department_votes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_department: {
        Args: { _department_space_id: string; _user_id: string }
        Returns: boolean
      }
      has_department_role: {
        Args: {
          _department_space_id: string
          _role: Database["public"]["Enums"]["department_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_department_member: {
        Args: { _department_space_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "head_admin" | "admin" | "user"
      department_role: "student" | "class_rep" | "dept_admin"
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
      department_role: ["student", "class_rep", "dept_admin"],
    },
  },
} as const
