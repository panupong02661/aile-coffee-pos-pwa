export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addon_groups: {
        Row: {
          allow_multiple: boolean
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          allow_multiple?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          allow_multiple?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      addons: {
        Row: {
          addon_group_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          addon_group_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          addon_group_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addons_addon_group_id_fkey"
            columns: ["addon_group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_addons_addon_group_id"
            columns: ["addon_group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_addon_groups: {
        Row: {
          addon_group_id: string | null
          category_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          addon_group_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          addon_group_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_addon_groups_addon_group_id_fkey"
            columns: ["addon_group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_addon_groups_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_category_addon_groups_addon_group_id"
            columns: ["addon_group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_category_addon_groups_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          id: string
          is_active: boolean
          minimum_stock: number
          name: string
          quantity: number
          sort_order: number
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_stock?: number
          name: string
          quantity?: number
          sort_order?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_stock?: number
          name?: string
          quantity?: number
          sort_order?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          join_date: string
          name: string
          phone: string
          points: number
          tier: string
          total_spent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          join_date?: string
          name: string
          phone: string
          points?: number
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          join_date?: string
          name?: string
          phone?: string
          points?: number
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      membership_settings: {
        Row: {
          created_at: string
          discount_percentage: number
          id: string
          minimum_spend_for_upgrade: number
          points_per_baht: number
          points_to_redeem: number
          redeem_value: number
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number
          id?: string
          minimum_spend_for_upgrade?: number
          points_per_baht?: number
          points_to_redeem?: number
          redeem_value?: number
          tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          id?: string
          minimum_spend_for_upgrade?: number
          points_per_baht?: number
          points_to_redeem?: number
          redeem_value?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_addon_groups: {
        Row: {
          addon_group_id: string | null
          created_at: string
          id: string
          menu_item_id: string | null
        }
        Insert: {
          addon_group_id?: string | null
          created_at?: string
          id?: string
          menu_item_id?: string | null
        }
        Update: {
          addon_group_id?: string | null
          created_at?: string
          id?: string
          menu_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_addon_groups_addon_group_id"
            columns: ["addon_group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_addon_groups_menu_item_id"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_addon_groups_addon_group_id_fkey"
            columns: ["addon_group_id"]
            isOneToOne: false
            referencedRelation: "addon_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_addon_groups_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string | null
          menu_item_id: string | null
          quantity_needed: number
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          menu_item_id?: string | null
          quantity_needed?: number
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          menu_item_id?: string | null
          quantity_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_items_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_discount: number | null
          item_discount_type: string | null
          menu_item_id: string | null
          menu_item_name: string
          order_id: string
          quantity: number
          selected_addons: Json | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_discount?: number | null
          item_discount_type?: string | null
          menu_item_id?: string | null
          menu_item_name: string
          order_id: string
          quantity?: number
          selected_addons?: Json | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_discount?: number | null
          item_discount_type?: string | null
          menu_item_id?: string | null
          menu_item_name?: string
          order_id?: string
          quantity?: number
          selected_addons?: Json | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bill_discount: number | null
          bill_discount_type: string | null
          created_at: string
          id: string
          items_count: number
          member_id: string | null
          order_number: string
          payment_method: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          bill_discount?: number | null
          bill_discount_type?: string | null
          created_at?: string
          id?: string
          items_count?: number
          member_id?: string | null
          order_number: string
          payment_method?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          bill_discount?: number | null
          bill_discount_type?: string | null
          created_at?: string
          id?: string
          items_count?: number
          member_id?: string | null
          order_number?: string
          payment_method?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          member_id: string
          order_id: string | null
          points_change: number
          transaction_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          member_id: string
          order_id?: string | null
          points_change: number
          transaction_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          member_id?: string
          order_id?: string | null
          points_change?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_menu_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          promotion_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          promotion_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          promotion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_menu_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_menu_items_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          name: string
          start_date: string
          target_group: string
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_value?: number
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          target_group?: string
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          target_group?: string
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      receipt_settings: {
        Row: {
          created_at: string
          footer_message: string | null
          id: string
          show_customer_info: boolean
          show_date_time: boolean
          show_item_details: boolean
          show_logo: boolean
          show_order_number: boolean
          show_payment_method: boolean
          show_shop_info: boolean
          show_tax_id: boolean
          show_total: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          footer_message?: string | null
          id?: string
          show_customer_info?: boolean
          show_date_time?: boolean
          show_item_details?: boolean
          show_logo?: boolean
          show_order_number?: boolean
          show_payment_method?: boolean
          show_shop_info?: boolean
          show_tax_id?: boolean
          show_total?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          footer_message?: string | null
          id?: string
          show_customer_info?: boolean
          show_date_time?: boolean
          show_item_details?: boolean
          show_logo?: boolean
          show_order_number?: boolean
          show_payment_method?: boolean
          show_shop_info?: boolean
          show_tax_id?: boolean
          show_total?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          shop_name: string
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          shop_name?: string
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          shop_name?: string
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          created_by: string | null
          id: string
          ingredient_id: string | null
          movement_type: string
          notes: string | null
          order_id: string | null
          quantity_change: number
          reference_number: string | null
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          ingredient_id?: string | null
          movement_type: string
          notes?: string | null
          order_id?: string | null
          quantity_change: number
          reference_number?: string | null
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          ingredient_id?: string | null
          movement_type?: string
          notes?: string | null
          order_id?: string | null
          quantity_change?: number
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_menu_cost: {
        Args: { menu_id: string }
        Returns: number
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_low_stock_ingredients: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          category: string
          quantity: number
          unit: string
          minimum_stock: number
          shortage: number
        }[]
      }
      test_order_number_generation: {
        Args: { test_count?: number }
        Returns: {
          test_num: number
          order_number: string
          success: boolean
          error_message: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
