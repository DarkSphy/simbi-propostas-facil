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
      appointments: {
        Row: {
          client_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          proposal_id: string | null
          status: string | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          proposal_id?: string | null
          status?: string | null
          time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          proposal_id?: string | null
          status?: string | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_public: boolean
          name: string
          stock_quantity: number | null
          type: Database["public"]["Enums"]["item_type"]
          unit_price: number
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name: string
          stock_quantity?: number | null
          type: Database["public"]["Enums"]["item_type"]
          unit_price?: number
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name?: string
          stock_quantity?: number | null
          type?: Database["public"]["Enums"]["item_type"]
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string | null
          content: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          is_lead: boolean | null
          name: string
          notes: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_lead?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_lead?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_signature: string | null
          content: string
          created_at: string
          id: string
          professional_signature: string | null
          proposal_id: string
          public_slug: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_signature?: string | null
          content: string
          created_at?: string
          id?: string
          professional_signature?: string | null
          proposal_id: string
          public_slug?: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_signature?: string | null
          content?: string
          created_at?: string
          id?: string
          professional_signature?: string | null
          proposal_id?: string
          public_slug?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string
          id: string
          paid_date: string | null
          proposal_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date: string
          id?: string
          paid_date?: string | null
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          invoice_number: string
          issue_date: string
          observations: string | null
          status: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          invoice_number: string
          issue_date?: string
          observations?: string | null
          status?: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          observations?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_id: string | null
          cost_price: number
          created_at: string
          due_date: string | null
          freight_value: number
          id: string
          material_delivered: string | null
          material_sold: string | null
          payment_term: string | null
          sale_value: number
          status: string
          supplier_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          cost_price?: number
          created_at?: string
          due_date?: string | null
          freight_value?: number
          id?: string
          material_delivered?: string | null
          material_sold?: string | null
          payment_term?: string | null
          sale_value?: number
          status?: string
          supplier_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          cost_price?: number
          created_at?: string
          due_date?: string | null
          freight_value?: number
          id?: string
          material_delivered?: string | null
          material_sold?: string | null
          payment_term?: string | null
          sale_value?: number
          status?: string
          supplier_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          background_color: string | null
          background_image_url: string | null
          company_name: string | null
          created_at: string
          document: string | null
          font_family: string | null
          full_name: string | null
          header_texture: string | null
          header_type: string | null
          id: string
          instagram_url: string | null
          item_layout: string | null
          linkedin_url: string | null
          logo_url: string | null
          payment_link: string | null
          pro_expires_at: string | null
          profile_slug: string | null
          role: string
          theme_color: string | null
          trial_ends_at: string | null
          updated_at: string
          vitrine_hero_type: string | null
          vitrine_hero_url: string | null
          vitrine_marquee_words: Json | null
          vitrine_pitch_text: string | null
          vitrine_pitch_video_url: string | null
          vitrine_skin: string | null
          vitrine_testimonials: Json | null
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          background_color?: string | null
          background_image_url?: string | null
          company_name?: string | null
          created_at?: string
          document?: string | null
          font_family?: string | null
          full_name?: string | null
          header_texture?: string | null
          header_type?: string | null
          id: string
          instagram_url?: string | null
          item_layout?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          payment_link?: string | null
          pro_expires_at?: string | null
          profile_slug?: string | null
          role?: string
          theme_color?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          vitrine_hero_type?: string | null
          vitrine_hero_url?: string | null
          vitrine_marquee_words?: Json | null
          vitrine_pitch_text?: string | null
          vitrine_pitch_video_url?: string | null
          vitrine_skin?: string | null
          vitrine_testimonials?: Json | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          background_color?: string | null
          background_image_url?: string | null
          company_name?: string | null
          created_at?: string
          document?: string | null
          font_family?: string | null
          full_name?: string | null
          header_texture?: string | null
          header_type?: string | null
          id?: string
          instagram_url?: string | null
          item_layout?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          payment_link?: string | null
          pro_expires_at?: string | null
          profile_slug?: string | null
          role?: string
          theme_color?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          vitrine_hero_type?: string | null
          vitrine_hero_url?: string | null
          vitrine_marquee_words?: Json | null
          vitrine_pitch_text?: string | null
          vitrine_pitch_video_url?: string | null
          vitrine_skin?: string | null
          vitrine_testimonials?: Json | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      proposal_images: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_images_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_items: {
        Row: {
          catalog_item_id: string | null
          description: string
          id: string
          image_url: string | null
          is_optional: boolean
          proposal_id: string
          quantity: number
          selected_by_client: boolean
          sort_order: number
          unit_price: number
        }
        Insert: {
          catalog_item_id?: string | null
          description: string
          id?: string
          image_url?: string | null
          is_optional?: boolean
          proposal_id: string
          quantity?: number
          selected_by_client?: boolean
          sort_order?: number
          unit_price?: number
        }
        Update: {
          catalog_item_id?: string | null
          description?: string
          id?: string
          image_url?: string | null
          is_optional?: boolean
          proposal_id?: string
          quantity?: number
          selected_by_client?: boolean
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          location: string | null
          proposal_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          location?: string | null
          proposal_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          location?: string | null
          proposal_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_logs_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          content: Json
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          approved_at: string | null
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          public_slug: string
          status: Database["public"]["Enums"]["proposal_status"]
          title: string
          total: number
          updated_at: string
          user_id: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          public_slug?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          title: string
          total?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          public_slug?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          title?: string
          total?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_proposal_with_options: {
        Args: { p_selected_item_ids: string[]; p_slug: string }
        Returns: undefined
      }
      activate_pro_by_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      delete_user_by_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_contract_by_slug: { Args: { p_slug: string }; Returns: Json }
      get_proposal_by_slug: { Args: { p_slug: string }; Returns: Json }
      get_public_profile: { Args: { p_slug: string }; Returns: Json }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_feature: {
        Args: { check_env?: string; feature_flag: string; user_uuid: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      sign_contract_by_slug: {
        Args: { p_signature: string; p_slug: string }
        Returns: undefined
      }
      submit_quote_request: {
        Args: {
          p_client_address: string
          p_client_email: string
          p_client_name: string
          p_client_phone: string
          p_items: Json
          p_profile_slug: string
        }
        Returns: Json
      }
      update_proposal_status: {
        Args: { p_slug: string; p_status: string }
        Returns: undefined
      }
      update_user_dates_by_admin: {
        Args: {
          p_pro_expires_at: string
          p_trial_ends_at: string
          target_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      item_type: "product" | "service"
      proposal_status:
        | "sent"
        | "viewed"
        | "approved"
        | "rejected"
        | "in_progress"
        | "canceled"
        | "finished"
        | "paid"
      transaction_status: "pending" | "paid" | "cancelled"
      transaction_type: "income" | "expense"
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
      item_type: ["product", "service"],
      proposal_status: [
        "sent",
        "viewed",
        "approved",
        "rejected",
        "in_progress",
        "canceled",
        "finished",
        "paid",
      ],
      transaction_status: ["pending", "paid", "cancelled"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
