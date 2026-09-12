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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          type?: string
        }
        Relationships: []
      }
      landing_preview: {
        Row: {
          accent_color: string
          avatar_url: string | null
          background_color: string
          background_fit: string
          background_position: string
          background_type: string
          background_url: string | null
          background_video_url: string | null
          bio: string
          button_border_color: string
          button_border_width: number
          button_color: string
          button_icon_color: string
          button_opacity: number
          button_radius: number
          button_shadow: string
          button_text_color: string
          created_at: string
          display_name: string
          followers_text: string
          footer_text: string
          id: string
          location: string
          muted_color: string
          overlay: string
          text_color: string
          updated_at: string
          username: string
        }
        Insert: {
          accent_color?: string
          avatar_url?: string | null
          background_color?: string
          background_fit?: string
          background_position?: string
          background_type?: string
          background_url?: string | null
          background_video_url?: string | null
          bio?: string
          button_border_color?: string
          button_border_width?: number
          button_color?: string
          button_icon_color?: string
          button_opacity?: number
          button_radius?: number
          button_shadow?: string
          button_text_color?: string
          created_at?: string
          display_name?: string
          followers_text?: string
          footer_text?: string
          id?: string
          location?: string
          muted_color?: string
          overlay?: string
          text_color?: string
          updated_at?: string
          username?: string
        }
        Update: {
          accent_color?: string
          avatar_url?: string | null
          background_color?: string
          background_fit?: string
          background_position?: string
          background_type?: string
          background_url?: string | null
          background_video_url?: string | null
          bio?: string
          button_border_color?: string
          button_border_width?: number
          button_color?: string
          button_icon_color?: string
          button_opacity?: number
          button_radius?: number
          button_shadow?: string
          button_text_color?: string
          created_at?: string
          display_name?: string
          followers_text?: string
          footer_text?: string
          id?: string
          location?: string
          muted_color?: string
          overlay?: string
          text_color?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      landing_preview_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          preview_id: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          preview_id: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          preview_id?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_preview_links_preview_id_fkey"
            columns: ["preview_id"]
            isOneToOne: false
            referencedRelation: "landing_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          active: boolean
          clicks: number
          created_at: string
          id: string
          position: number
          thumbnail: string | null
          title: string
          type: string
          user_id: string
          value: string
        }
        Insert: {
          active?: boolean
          clicks?: number
          created_at?: string
          id?: string
          position?: number
          thumbnail?: string | null
          title?: string
          type?: string
          user_id: string
          value?: string
        }
        Update: {
          active?: boolean
          clicks?: number
          created_at?: string
          id?: string
          position?: number
          thumbnail?: string | null
          title?: string
          type?: string
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          background_url: string | null
          background_video_url: string | null
          bio: string | null
          counter_label: string | null
          counter_value: string | null
          created_at: string
          display_name: string
          featured_link_id: string | null
          featured_on_home: boolean
          featured_order: number
          id: string
          page_views: number
          plan: string
          status: string
          theme_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          background_url?: string | null
          background_video_url?: string | null
          bio?: string | null
          counter_label?: string | null
          counter_value?: string | null
          created_at?: string
          display_name?: string
          featured_link_id?: string | null
          featured_on_home?: boolean
          featured_order?: number
          id: string
          page_views?: number
          plan?: string
          status?: string
          theme_id?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          background_url?: string | null
          background_video_url?: string | null
          bio?: string | null
          counter_label?: string | null
          counter_value?: string | null
          created_at?: string
          display_name?: string
          featured_link_id?: string | null
          featured_on_home?: boolean
          featured_order?: number
          id?: string
          page_views?: number
          plan?: string
          status?: string
          theme_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_featured_link_id_fkey"
            columns: ["featured_link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reported_user_id: string
          reporter: string
          resolved: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string
          reported_user_id: string
          reporter?: string
          resolved?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reported_user_id?: string
          reporter?: string
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      admin_list_auth_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_link_clicks: { Args: { _link_id: string }; Returns: undefined }
      increment_page_views: {
        Args: { _profile_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
