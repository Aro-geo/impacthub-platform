export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          created_at: string | null
          id: string
          reason: string | null
          recommended_id: string | null
          recommended_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string | null
          recommended_id?: string | null
          recommended_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string | null
          recommended_id?: string | null
          recommended_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          date: string
          description: string | null
          id: string
          location: string | null
          max_participants: number | null
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date: string
          description?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          is_completed: boolean | null
          progress: number | null
          target: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          target: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          target?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string | null
          description: string
          id: string
          status: string | null
          title: string
          user_id: string
          votes: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          status?: string | null
          title: string
          user_id: string
          votes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          status?: string | null
          title?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          language: string | null
          level: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          language?: string | null
          level?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          language?: string | null
          level?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_packages: {
        Row: {
          created_at: string | null
          description: string | null
          download_link: string | null
          id: string
          language: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_link?: string | null
          id?: string
          language?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_link?: string | null
          id?: string
          language?: string | null
          title?: string
        }
        Relationships: []
      }
      mentorship_matches: {
        Row: {
          created_at: string | null
          id: string
          mentee_id: string
          mentor_id: string
          skills_focus: string[] | null
          status: Database["public"]["Enums"]["mentorship_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentee_id: string
          mentor_id: string
          skills_focus?: string[] | null
          status?: Database["public"]["Enums"]["mentorship_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          skills_focus?: string[] | null
          status?: Database["public"]["Enums"]["mentorship_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_matches_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_matches_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category: Database["public"]["Enums"]["post_category"] | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["post_category"] | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["post_category"] | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quiz_attempts: {
        Row: {
          attempted_at: string | null
          id: string
          is_correct: boolean | null
          quiz_id: string | null
          selected_answer: number | null
          user_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          id?: string
          is_correct?: boolean | null
          quiz_id?: string | null
          selected_answer?: number | null
          user_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          id?: string
          is_correct?: boolean | null
          quiz_id?: string | null
          selected_answer?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          correct_answer: string
          id: string
          module_id: string | null
          options: string[]
          question: string
        }
        Insert: {
          correct_answer: string
          id?: string
          module_id?: string | null
          options: string[]
          question: string
        }
        Update: {
          correct_answer?: string
          id?: string
          module_id?: string | null
          options?: string[]
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          created_at: string | null
          email: string | null
          grade: number | null
          id: string
          impact_points: number | null
          location: string | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          grade?: number | null
          id: string
          impact_points?: number | null
          location?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          grade?: number | null
          id?: string
          impact_points?: number | null
          location?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      simple_lessons: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          grade: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          subject_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          grade?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          subject_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          grade?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          subject_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simple_lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          last_accessed: string | null
          lesson_id: string
          progress_percentage: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          last_accessed?: string | null
          lesson_id: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          last_accessed?: string | null
          lesson_id?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "simple_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          correct_answer: number
          created_at: string | null
          explanation: string | null
          id: string
          lesson_id: string
          options: Json
          order_index: number | null
          question: string
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id: string
          options: Json
          order_index?: number | null
          question: string
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          order_index?: number | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "simple_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "simple_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          created_at: string | null
          id: string
          is_featured: boolean | null
          lesson_id: string | null
          post_type: string | null
          subject_id: string | null
          title: string
          content: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          lesson_id?: string | null
          post_type?: string | null
          subject_id?: string | null
          title: string
          content: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          lesson_id?: string | null
          post_type?: string | null
          subject_id?: string | null
          title?: string
          content?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "simple_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_upvotes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reply_upvotes: {
        Row: {
          created_at: string | null
          id: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_upvotes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "community_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reply_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          id: string
          is_completed: boolean | null
          last_accessed: string | null
          module_id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          module_id: string
          progress?: number | null
          user_id: string
        }
        Update: {
          id?: string
          is_completed?: boolean | null
          last_accessed?: string | null
          module_id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          language: string | null
          link: string | null
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          language?: string | null
          link?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          language?: string | null
          link?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_opportunities: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string
          id: string
          location: string | null
          skills_required: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description: string
          id?: string
          location?: string | null
          skills_required?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string
          id?: string
          location?: string | null
          skills_required?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_category:
        | "workshop"
        | "webinar"
        | "volunteer"
        | "networking"
        | "community"
      goal_type: "learning" | "volunteering" | "sustainability" | "community"
      mentorship_status: "pending" | "active" | "completed" | "cancelled"
      post_category:
        | "education"
        | "accessibility"
        | "sustainability"
        | "community"
        | "general"
      resource_category:
        | "education"
        | "accessibility"
        | "sustainability"
        | "community"
      user_role: "user" | "mentor" | "admin" | "moderator"
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
      event_category: [
        "workshop",
        "webinar",
        "volunteer",
        "networking",
        "community",
      ],
      goal_type: ["learning", "volunteering", "sustainability", "community"],
      mentorship_status: ["pending", "active", "completed", "cancelled"],
      post_category: [
        "education",
        "accessibility",
        "sustainability",
        "community",
        "general",
      ],
      resource_category: [
        "education",
        "accessibility",
        "sustainability",
        "community",
      ],
      user_role: ["user", "mentor", "admin", "moderator"],
    },
  },
} as const
