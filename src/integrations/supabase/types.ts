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
      otp_codes: {
        Row: {
          attempts: number | null
          code_hash: string
          consumed: boolean | null
          created_at: string
          email: string
          expires_at: string
          id: string
        }
        Insert: {
          attempts?: number | null
          code_hash: string
          consumed?: boolean | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
        }
        Update: {
          attempts?: number | null
          code_hash?: string
          consumed?: boolean | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          community: string | null
          created_at: string
          date_of_birth: string | null
          education: string | null
          email: string
          family_details: string | null
          full_name: string
          gender: string | null
          horoscope: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          occupation: string | null
          partner_expectations: string | null
          phone: string | null
          photo_url: string | null
          profile_completion: number | null
          sub_sect: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          community?: string | null
          created_at?: string
          date_of_birth?: string | null
          education?: string | null
          email: string
          family_details?: string | null
          full_name: string
          gender?: string | null
          horoscope?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          occupation?: string | null
          partner_expectations?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_completion?: number | null
          sub_sect?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          community?: string | null
          created_at?: string
          date_of_birth?: string | null
          education?: string | null
          email?: string
          family_details?: string | null
          full_name?: string
          gender?: string | null
          horoscope?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          occupation?: string | null
          partner_expectations?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_completion?: number | null
          sub_sect?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sangams: {
        Row: {
          active_events: number | null
          address_en: string | null
          address_ta: string | null
          blood_donation_info: string | null
          city: string | null
          community_name: string | null
          contact_person: string | null
          created_at: string
          description_en: string | null
          description_ta: string | null
          district: string | null
          educational_support_info: string | null
          email: string | null
          founded_year: number | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_popular: boolean | null
          map_link: string | null
          marriage_help_info: string | null
          marriage_success_count: number | null
          office_timing_en: string | null
          office_timing_ta: string | null
          phone: string | null
          registered_families: number | null
          sangam_name_en: string
          sangam_name_ta: string | null
          slug: string
          total_members: number | null
          upcoming_events: Json | null
          updated_at: string
          view_count: number | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          active_events?: number | null
          address_en?: string | null
          address_ta?: string | null
          blood_donation_info?: string | null
          city?: string | null
          community_name?: string | null
          contact_person?: string | null
          created_at?: string
          description_en?: string | null
          description_ta?: string | null
          district?: string | null
          educational_support_info?: string | null
          email?: string | null
          founded_year?: number | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          map_link?: string | null
          marriage_help_info?: string | null
          marriage_success_count?: number | null
          office_timing_en?: string | null
          office_timing_ta?: string | null
          phone?: string | null
          registered_families?: number | null
          sangam_name_en: string
          sangam_name_ta?: string | null
          slug: string
          total_members?: number | null
          upcoming_events?: Json | null
          updated_at?: string
          view_count?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          active_events?: number | null
          address_en?: string | null
          address_ta?: string | null
          blood_donation_info?: string | null
          city?: string | null
          community_name?: string | null
          contact_person?: string | null
          created_at?: string
          description_en?: string | null
          description_ta?: string | null
          district?: string | null
          educational_support_info?: string | null
          email?: string | null
          founded_year?: number | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          map_link?: string | null
          marriage_help_info?: string | null
          marriage_success_count?: number | null
          office_timing_en?: string | null
          office_timing_ta?: string | null
          phone?: string | null
          registered_families?: number | null
          sangam_name_en?: string
          sangam_name_ta?: string | null
          slug?: string
          total_members?: number | null
          upcoming_events?: Json | null
          updated_at?: string
          view_count?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
