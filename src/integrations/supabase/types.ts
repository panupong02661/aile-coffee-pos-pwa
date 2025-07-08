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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      cancelled_orders: {
        Row: {
          cancelled_at: string
          cancelled_by: string | null
          created_at: string
          id: string
          original_items_count: number
          original_member_id: string | null
          original_order_id: string
          original_order_number: string
          original_payment_method: string
          original_total_amount: number
          reason: string | null
          stock_restored: boolean
        }
        Insert: {
          cancelled_at?: string
          cancelled_by?: string | null
          created_at?: string
          id?: string
          original_items_count?: number
          original_member_id?: string | null
          original_order_id: string
          original_order_number: string
          original_payment_method?: string
          original_total_amount?: number
          reason?: string | null
          stock_restored?: boolean
        }
        Update: {
          cancelled_at?: string
          cancelled_by?: string | null
          created_at?: string
          id?: string
          original_items_count?: number
          original_member_id?: string | null
          original_order_id?: string
          original_order_number?: string
          original_payment_method?: string
          original_total_amount?: number
          reason?: string | null
          stock_restored?: boolean
        }
        Relationships: []
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
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_purchase: number | null
          name: string
          start_date: string
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          name: string
          start_date: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_purchase?: number | null
          name?: string
          start_date?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      customer_coupons: {
        Row: {
          coupon_id: string | null
          customer_id: string | null
          id: string
          is_used: boolean | null
          received_at: string | null
          used_at: string | null
        }
        Insert: {
          coupon_id?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          received_at?: string | null
          used_at?: string | null
        }
        Update: {
          coupon_id?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          received_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_coupons_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_gifts: {
        Row: {
          created_at: string
          customer_id: string
          expires_at: string | null
          gift_code: string | null
          gift_description: string | null
          gift_id: string
          gift_name: string
          gift_type: string
          gift_value: number | null
          id: string
          is_used: boolean
          message: string | null
          sent_by: string | null
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          expires_at?: string | null
          gift_code?: string | null
          gift_description?: string | null
          gift_id: string
          gift_name: string
          gift_type: string
          gift_value?: number | null
          id?: string
          is_used?: boolean
          message?: string | null
          sent_by?: string | null
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          expires_at?: string | null
          gift_code?: string | null
          gift_description?: string | null
          gift_id?: string
          gift_name?: string
          gift_type?: string
          gift_value?: number | null
          id?: string
          is_used?: boolean
          message?: string | null
          sent_by?: string | null
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_gifts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_gifts_menu_item"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_mobile_sessions: {
        Row: {
          created_at: string | null
          customer_id: string
          device_id: string
          device_type: string | null
          expires_at: string | null
          id: string
          last_active: string | null
          session_token: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          device_id: string
          device_type?: string | null
          expires_at?: string | null
          id?: string
          last_active?: string | null
          session_token: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          device_id?: string
          device_type?: string | null
          expires_at?: string | null
          id?: string
          last_active?: string | null
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_mobile_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_address: string | null
          delivery_type: string | null
          discount_amount: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          subtotal: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_address?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_address?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          birth_date: string | null
          created_at: string | null
          full_name: string
          gender: string | null
          id: string
          phone: string
          points: number | null
          reward_points: number | null
          tier: string | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          full_name: string
          gender?: string | null
          id?: string
          phone: string
          points?: number | null
          reward_points?: number | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string
          points?: number | null
          reward_points?: number | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_promotion_claims: {
        Row: {
          claimed_at: string | null
          customer_id: string
          id: string
          is_used: boolean | null
          order_id: string | null
          promotion_id: string | null
          used_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          customer_id: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          promotion_id?: string | null
          used_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          customer_id?: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          promotion_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_promotion_claims_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "limited_promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_rewards: {
        Row: {
          customer_id: string | null
          id: string
          is_used: boolean | null
          redeemed_at: string | null
          reward_id: string | null
          used_at: string | null
        }
        Insert: {
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          redeemed_at?: string | null
          reward_id?: string | null
          used_at?: string | null
        }
        Update: {
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          redeemed_at?: string | null
          reward_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_rewards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_transactions: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          order_id: string | null
          payment_method: string | null
          points_change: number | null
          reference_number: string | null
          transaction_status: string | null
          transaction_type: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string | null
          points_change?: number | null
          reference_number?: string | null
          transaction_status?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string | null
          points_change?: number | null
          reference_number?: string | null
          transaction_status?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          error_message: string
          error_type: string
          id: string
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gift_usage_history: {
        Row: {
          customer_gift_id: string
          customer_id: string
          id: string
          notes: string | null
          order_id: string | null
          used_amount: number | null
          used_at: string
        }
        Insert: {
          customer_gift_id: string
          customer_id: string
          id?: string
          notes?: string | null
          order_id?: string | null
          used_amount?: number | null
          used_at?: string
        }
        Update: {
          customer_gift_id?: string
          customer_id?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          used_amount?: number | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_usage_history_customer_gift_id_fkey"
            columns: ["customer_gift_id"]
            isOneToOne: false
            referencedRelation: "customer_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_usage_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
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
      limited_promotions: {
        Row: {
          created_at: string | null
          current_claims: number
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_claims: number
          min_purchase: number | null
          promo_code: string | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_claims?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_claims?: number
          min_purchase?: number | null
          promo_code?: string | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_claims?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_claims?: number
          min_purchase?: number | null
          promo_code?: string | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      limited_reward_claims: {
        Row: {
          claimed_at: string | null
          customer_id: string | null
          id: string
          is_used: boolean | null
          limited_reward_id: string | null
          used_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          limited_reward_id?: string | null
          used_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          limited_reward_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "limited_reward_claims_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "limited_reward_claims_limited_reward_id_fkey"
            columns: ["limited_reward_id"]
            isOneToOne: false
            referencedRelation: "limited_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      limited_rewards: {
        Row: {
          created_at: string | null
          current_claims: number | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string
          id: string
          is_active: boolean | null
          max_claims: number
          name: string
          reward_code: string | null
          reward_type: string
          start_date: string
          target_month: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_claims?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_claims?: number
          name: string
          reward_code?: string | null
          reward_type?: string
          start_date: string
          target_month?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_claims?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_claims?: number
          name?: string
          reward_code?: string | null
          reward_type?: string
          start_date?: string
          target_month?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lottery: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          selected_count: number
          selected_numbers: number[]
          session_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          selected_count?: number
          selected_numbers?: number[]
          session_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          selected_count?: number
          selected_numbers?: number[]
          session_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          gender: string | null
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
          birth_date?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
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
          birth_date?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
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
      notification_settings: {
        Row: {
          created_at: string | null
          duration: number | null
          id: string
          selected_sound_id: string | null
          sound_enabled: boolean | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          id?: string
          selected_sound_id?: string | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          id?: string
          selected_sound_id?: string | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_selected_sound_id_fkey"
            columns: ["selected_sound_id"]
            isOneToOne: false
            referencedRelation: "notification_sounds"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_sounds: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      offline_sync_queue: {
        Row: {
          action_type: string
          created_at: string
          data: Json
          device_id: string
          id: string
          is_synced: boolean
          synced_at: string | null
          table_name: string
        }
        Insert: {
          action_type: string
          created_at?: string
          data: Json
          device_id: string
          id?: string
          is_synced?: boolean
          synced_at?: string | null
          table_name: string
        }
        Update: {
          action_type?: string
          created_at?: string
          data?: Json
          device_id?: string
          id?: string
          is_synced?: boolean
          synced_at?: string | null
          table_name?: string
        }
        Relationships: []
      }
      online_orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          delivery_address: string | null
          delivery_type: string | null
          discount_amount: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          subtotal: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal: number
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "online_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_addons: {
        Row: {
          addon_id: string
          addon_name: string
          created_at: string
          id: string
          order_id: string
          order_item_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          addon_id: string
          addon_name: string
          created_at?: string
          id?: string
          order_id: string
          order_item_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          addon_id?: string
          addon_name?: string
          created_at?: string
          id?: string
          order_id?: string
          order_item_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_addons_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_addons_order_item_id"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
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
          customer_notes: string | null
          id: string
          items_count: number
          member_id: string | null
          order_number: string
          order_source: string | null
          payment_method: string
          pickup_time: string | null
          receipt_image_url: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          bill_discount?: number | null
          bill_discount_type?: string | null
          created_at?: string
          customer_notes?: string | null
          id?: string
          items_count?: number
          member_id?: string | null
          order_number: string
          order_source?: string | null
          payment_method?: string
          pickup_time?: string | null
          receipt_image_url?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          bill_discount?: number | null
          bill_discount_type?: string | null
          created_at?: string
          customer_notes?: string | null
          id?: string
          items_count?: number
          member_id?: string | null
          order_number?: string
          order_source?: string | null
          payment_method?: string
          pickup_time?: string | null
          receipt_image_url?: string | null
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
      promotion_categories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          promotion_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          promotion_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          promotion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_categories_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
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
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_required: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_required: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
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
      staff: {
        Row: {
          created_at: string
          email: string | null
          hire_date: string
          id: string
          name: string
          phone: string
          position: string
          role: string
          salary: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          hire_date?: string
          id?: string
          name: string
          phone: string
          position: string
          role?: string
          salary?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          hire_date?: string
          id?: string
          name?: string
          phone?: string
          position?: string
          role?: string
          salary?: number
          status?: string
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
      time_attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          staff_id: string
          status: string
          updated_at: string
          work_hours: number | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          staff_id: string
          status?: string
          updated_at?: string
          work_hours?: number | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "time_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
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
      check_rate_limit: {
        Args: {
          identifier: string
          max_requests?: number
          time_window_minutes?: number
        }
        Returns: boolean
      }
      claim_limited_promotion: {
        Args: { promotion_id_param: string; customer_id_param: string }
        Returns: Json
      }
      claim_limited_reward: {
        Args: { reward_id: string; user_id: string }
        Returns: Json
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_promotions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          discount_type: string
          discount_value: number
          apply_to: string
          menu_item_ids: string[]
          category_ids: string[]
        }[]
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
      restore_stock_for_cancelled_order: {
        Args: { order_id_param: string }
        Returns: Json
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
      validate_input: {
        Args: { input_text: string; input_type?: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
