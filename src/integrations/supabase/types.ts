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
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          shop_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          shop_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          shop_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_logs_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      addon_groups: {
        Row: {
          allow_multiple: boolean
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_required: boolean
          media_type: string
          name: string
          shop_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          allow_multiple?: boolean
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_required?: boolean
          media_type?: string
          name: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          allow_multiple?: boolean
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_required?: boolean
          media_type?: string
          name?: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_groups_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          addon_group_id: string | null
          created_at: string
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean
          media_type: string
          name: string
          price: number
          shop_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          addon_group_id?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          media_type?: string
          name: string
          price?: number
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          addon_group_id?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          media_type?: string
          name?: string
          price?: number
          shop_id?: string | null
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
            foreignKeyName: "addons_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
      api_integrations: {
        Row: {
          api_key: string | null
          api_secret: string | null
          config: Json | null
          created_at: string | null
          endpoint_url: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          shop_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          config?: Json | null
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          shop_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          config?: Json | null
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          shop_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_api_integrations_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          shop_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_areas_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_discounts: {
        Row: {
          created_at: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          menu_item_id: string | null
          min_quantity: number
          shop_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          menu_item_id?: string | null
          min_quantity: number
          shop_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          menu_item_id?: string | null
          min_quantity?: number
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_discounts_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bulk_discounts_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          business_description: string | null
          business_hours: string | null
          business_name: string | null
          business_registration: string | null
          business_type: string | null
          contact_address: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          employee_count: number | null
          established_date: string | null
          facebook: string | null
          fiscal_year: string | null
          id: string
          language: string | null
          line_id: string | null
          mobile: string | null
          phone: string | null
          registered_address: string | null
          shop_id: string | null
          social_security: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          vat_registration: string | null
          website: string | null
        }
        Insert: {
          business_description?: string | null
          business_hours?: string | null
          business_name?: string | null
          business_registration?: string | null
          business_type?: string | null
          contact_address?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          employee_count?: number | null
          established_date?: string | null
          facebook?: string | null
          fiscal_year?: string | null
          id?: string
          language?: string | null
          line_id?: string | null
          mobile?: string | null
          phone?: string | null
          registered_address?: string | null
          shop_id?: string | null
          social_security?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          vat_registration?: string | null
          website?: string | null
        }
        Update: {
          business_description?: string | null
          business_hours?: string | null
          business_name?: string | null
          business_registration?: string | null
          business_type?: string | null
          contact_address?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          employee_count?: number | null
          established_date?: string | null
          facebook?: string | null
          fiscal_year?: string | null
          id?: string
          language?: string | null
          line_id?: string | null
          mobile?: string | null
          phone?: string | null
          registered_address?: string | null
          shop_id?: string | null
          social_security?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          vat_registration?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_business_settings_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          stock_restored?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cancelled_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_display_sync: {
        Row: {
          cart_data: Json
          created_at: string
          id: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          cart_data?: Json
          created_at?: string
          id?: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          cart_data?: Json
          created_at?: string
          id?: string
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cart_display_sync_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      category_addon_groups: {
        Row: {
          addon_group_id: string | null
          category_id: string | null
          created_at: string
          id: string
          shop_id: string | null
        }
        Insert: {
          addon_group_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          shop_id?: string | null
        }
        Update: {
          addon_group_id?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_category_addon_groups_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          order_id: string | null
          shop_id: string | null
          used_at: string | null
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Update: {
          coupon_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_coupon_usage_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          start_date?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_customers: {
        Row: {
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          member_id: string | null
          payment_terms: number | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          member_id?: string | null
          payment_terms?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          member_id?: string | null
          payment_terms?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_customers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_credit_customers_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_sales: {
        Row: {
          amount: number
          created_at: string | null
          credit_customer_id: string | null
          due_date: string
          id: string
          notes: string | null
          order_id: string | null
          paid_amount: number | null
          paid_date: string | null
          shop_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          credit_customer_id?: string | null
          due_date: string
          id?: string
          notes?: string | null
          order_id?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          credit_customer_id?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_sales_credit_customer_id_fkey"
            columns: ["credit_customer_id"]
            isOneToOne: false
            referencedRelation: "credit_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_credit_sales_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_coupons: {
        Row: {
          coupon_id: string | null
          customer_id: string | null
          id: string
          is_used: boolean | null
          received_at: string | null
          shop_id: string | null
          used_at: string | null
        }
        Insert: {
          coupon_id?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          received_at?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Update: {
          coupon_id?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          received_at?: string | null
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_customer_coupons_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_customer_gifts_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_mobile_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_mobile_sessions_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_customer_orders_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_prize_claims: {
        Row: {
          advent_day: number | null
          claim_code: string | null
          claimed_at: string
          created_at: string
          customer_id: string
          festival_event_id: string
          festival_prize_id: string
          id: string
          is_used: boolean
          prize_name: string
          prize_type: string
          prize_value: number
          reward_expires_at: string | null
          shop_id: string | null
          used_at: string | null
        }
        Insert: {
          advent_day?: number | null
          claim_code?: string | null
          claimed_at?: string
          created_at?: string
          customer_id: string
          festival_event_id: string
          festival_prize_id: string
          id?: string
          is_used?: boolean
          prize_name: string
          prize_type: string
          prize_value?: number
          reward_expires_at?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Update: {
          advent_day?: number | null
          claim_code?: string | null
          claimed_at?: string
          created_at?: string
          customer_id?: string
          festival_event_id?: string
          festival_prize_id?: string
          id?: string
          is_used?: boolean
          prize_name?: string
          prize_type?: string
          prize_value?: number
          reward_expires_at?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_prize_claims_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_prize_claims_festival_event_id_fkey"
            columns: ["festival_event_id"]
            isOneToOne: false
            referencedRelation: "festival_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_prize_claims_festival_prize_id_fkey"
            columns: ["festival_prize_id"]
            isOneToOne: false
            referencedRelation: "festival_prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_prize_claims_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          tier?: string | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_profiles_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_promotion_claims: {
        Row: {
          claimed_at: string | null
          customer_id: string
          id: string
          is_used: boolean | null
          order_id: string | null
          promotion_id: string | null
          shop_id: string | null
          used_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          customer_id: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          promotion_id?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          customer_id?: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          promotion_id?: string | null
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_customer_promotion_claims_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
          used_at: string | null
        }
        Insert: {
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          redeemed_at?: string | null
          reward_id?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Update: {
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          redeemed_at?: string | null
          reward_id?: string | null
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_customer_rewards_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_stamp_cards: {
        Row: {
          completed_at: string | null
          created_at: string
          current_stamps: number
          customer_id: string
          id: string
          is_completed: boolean
          shop_id: string | null
          stamp_card_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_stamps?: number
          customer_id: string
          id?: string
          is_completed?: boolean
          shop_id?: string | null
          stamp_card_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_stamps?: number
          customer_id?: string
          id?: string
          is_completed?: boolean
          shop_id?: string | null
          stamp_card_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_stamp_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_stamp_cards_stamp_card_id_fkey"
            columns: ["stamp_card_id"]
            isOneToOne: false
            referencedRelation: "stamp_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_stamp_cards_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_stamps: {
        Row: {
          customer_stamp_card_id: string
          id: string
          order_amount: number
          order_id: string | null
          shop_id: string | null
          stamp_number: number
          stamped_at: string
        }
        Insert: {
          customer_stamp_card_id: string
          id?: string
          order_amount?: number
          order_id?: string | null
          shop_id?: string | null
          stamp_number: number
          stamped_at?: string
        }
        Update: {
          customer_stamp_card_id?: string
          id?: string
          order_amount?: number
          order_id?: string | null
          shop_id?: string | null
          stamp_number?: number
          stamped_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_stamps_customer_stamp_card_id_fkey"
            columns: ["customer_stamp_card_id"]
            isOneToOne: false
            referencedRelation: "customer_stamp_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_stamps_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_customer_transactions_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_assignments: {
        Row: {
          created_at: string | null
          delivery_address: string
          delivery_fee: number | null
          delivery_time: string | null
          driver_id: string | null
          estimated_delivery_time: string | null
          id: string
          notes: string | null
          order_id: string | null
          pickup_time: string | null
          shop_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address: string
          delivery_fee?: number | null
          delivery_time?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          pickup_time?: string | null
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          pickup_time?: string | null
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "delivery_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_delivery_assignments_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_drivers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          license_number: string | null
          name: string
          phone: string
          shop_id: string | null
          status: string | null
          updated_at: string | null
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name: string
          phone: string
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_delivery_drivers_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_integrations: {
        Row: {
          api_key: string | null
          auto_notification_enabled: boolean | null
          auto_sync_enabled: boolean | null
          connection_status: string | null
          created_at: string
          id: string
          is_connected: boolean | null
          is_enabled: boolean | null
          last_sync_at: string | null
          platform_name: string
          shop_id: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          auto_notification_enabled?: boolean | null
          auto_sync_enabled?: boolean | null
          connection_status?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          is_enabled?: boolean | null
          last_sync_at?: string | null
          platform_name: string
          shop_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          auto_notification_enabled?: boolean | null
          auto_sync_enabled?: boolean | null
          connection_status?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          is_enabled?: boolean | null
          last_sync_at?: string | null
          platform_name?: string
          shop_id?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_delivery_integrations_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_fee: number | null
          id: string
          order_data: Json
          order_date: string | null
          order_status: string | null
          platform_name: string
          platform_order_id: string
          shop_id: string | null
          synced_at: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          id?: string
          order_data: Json
          order_date?: string | null
          order_status?: string | null
          platform_name: string
          platform_order_id: string
          shop_id?: string | null
          synced_at?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          id?: string
          order_data?: Json
          order_date?: string | null
          order_status?: string | null
          platform_name?: string
          platform_order_id?: string
          shop_id?: string | null
          synced_at?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_delivery_orders_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          orders_synced: number | null
          platform_name: string
          shop_id: string | null
          status: string
          sync_duration_ms: number | null
          sync_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          orders_synced?: number | null
          platform_name: string
          shop_id?: string | null
          status: string
          sync_duration_ms?: number | null
          sync_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          orders_synced?: number | null
          platform_name?: string
          shop_id?: string | null
          status?: string
          sync_duration_ms?: number | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_delivery_sync_logs_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tracking: {
        Row: {
          actual_delivery_time: string | null
          actual_pickup_time: string | null
          actual_prep_end: string | null
          actual_prep_start: string | null
          created_at: string
          customer_feedback: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_rating: number | null
          delivery_address: string | null
          delivery_assignment_id: string | null
          delivery_fee: number | null
          driver_name: string | null
          driver_phone: string | null
          estimated_delivery_time: number | null
          estimated_prep_time: number | null
          id: string
          order_id: string | null
          shop_id: string | null
          status: string
          status_note: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          actual_delivery_time?: string | null
          actual_pickup_time?: string | null
          actual_prep_end?: string | null
          actual_prep_start?: string | null
          created_at?: string
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_rating?: number | null
          delivery_address?: string | null
          delivery_assignment_id?: string | null
          delivery_fee?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          estimated_delivery_time?: number | null
          estimated_prep_time?: number | null
          id?: string
          order_id?: string | null
          shop_id?: string | null
          status?: string
          status_note?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          actual_delivery_time?: string | null
          actual_pickup_time?: string | null
          actual_prep_end?: string | null
          actual_prep_start?: string | null
          created_at?: string
          customer_feedback?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_rating?: number | null
          delivery_address?: string | null
          delivery_assignment_id?: string | null
          delivery_fee?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          estimated_delivery_time?: number | null
          estimated_prep_time?: number | null
          id?: string
          order_id?: string | null
          shop_id?: string | null
          status?: string
          status_note?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_delivery_assignment_id_fkey"
            columns: ["delivery_assignment_id"]
            isOneToOne: false
            referencedRelation: "delivery_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_settings: {
        Row: {
          advent_calendar_enabled: boolean
          created_at: string
          festival_events_enabled: boolean
          festival_themes_enabled: boolean
          gift_box_enabled: boolean
          id: string
          loyalty_mode: string
          push_notifications_enabled: boolean
          shop_id: string | null
          spin_wheel_enabled: boolean
          stamp_card_enabled: boolean
          tier_rewards_enabled: boolean
          updated_at: string
        }
        Insert: {
          advent_calendar_enabled?: boolean
          created_at?: string
          festival_events_enabled?: boolean
          festival_themes_enabled?: boolean
          gift_box_enabled?: boolean
          id?: string
          loyalty_mode?: string
          push_notifications_enabled?: boolean
          shop_id?: string | null
          spin_wheel_enabled?: boolean
          stamp_card_enabled?: boolean
          tier_rewards_enabled?: boolean
          updated_at?: string
        }
        Update: {
          advent_calendar_enabled?: boolean
          created_at?: string
          festival_events_enabled?: boolean
          festival_themes_enabled?: boolean
          gift_box_enabled?: boolean
          id?: string
          loyalty_mode?: string
          push_notifications_enabled?: boolean
          shop_id?: string | null
          spin_wheel_enabled?: boolean
          stamp_card_enabled?: boolean
          tier_rewards_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_engagement_settings_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_error_logs_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          shop_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          id: string
          receipt_url: string | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_events: {
        Row: {
          advent_total_days: number | null
          background_image_url: string | null
          created_at: string
          description: string | null
          end_date: string
          event_type: string
          gift_box_choices: number | null
          id: string
          is_active: boolean
          max_claims_per_customer: number | null
          min_tier: string | null
          name: string
          shop_id: string | null
          start_date: string
          theme_color: string | null
          theme_secondary_color: string | null
          updated_at: string
        }
        Insert: {
          advent_total_days?: number | null
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          event_type?: string
          gift_box_choices?: number | null
          id?: string
          is_active?: boolean
          max_claims_per_customer?: number | null
          min_tier?: string | null
          name: string
          shop_id?: string | null
          start_date: string
          theme_color?: string | null
          theme_secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          advent_total_days?: number | null
          background_image_url?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          event_type?: string
          gift_box_choices?: number | null
          id?: string
          is_active?: boolean
          max_claims_per_customer?: number | null
          min_tier?: string | null
          name?: string
          shop_id?: string | null
          start_date?: string
          theme_color?: string | null
          theme_secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_festival_events_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_prizes: {
        Row: {
          advent_day: number | null
          claimed_quantity: number
          created_at: string
          description: string | null
          festival_event_id: string
          id: string
          is_active: boolean
          min_tier: string | null
          name: string
          prize_menu_item_id: string | null
          prize_type: string
          prize_value: number
          probability_weight: number
          shop_id: string | null
          total_quantity: number | null
          updated_at: string
        }
        Insert: {
          advent_day?: number | null
          claimed_quantity?: number
          created_at?: string
          description?: string | null
          festival_event_id: string
          id?: string
          is_active?: boolean
          min_tier?: string | null
          name: string
          prize_menu_item_id?: string | null
          prize_type?: string
          prize_value?: number
          probability_weight?: number
          shop_id?: string | null
          total_quantity?: number | null
          updated_at?: string
        }
        Update: {
          advent_day?: number | null
          claimed_quantity?: number
          created_at?: string
          description?: string | null
          festival_event_id?: string
          id?: string
          is_active?: boolean
          min_tier?: string | null
          name?: string
          prize_menu_item_id?: string | null
          prize_type?: string
          prize_value?: number
          probability_weight?: number
          shop_id?: string | null
          total_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "festival_prizes_festival_event_id_fkey"
            columns: ["festival_event_id"]
            isOneToOne: false
            referencedRelation: "festival_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festival_prizes_prize_menu_item_id_fkey"
            columns: ["prize_menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_festival_prizes_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_themes: {
        Row: {
          accent_color: string | null
          background_gradient: string | null
          created_at: string
          description: string | null
          end_date: string | null
          icon_set: string | null
          id: string
          is_active: boolean
          name: string
          primary_color: string
          secondary_color: string
          shop_id: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_gradient?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          icon_set?: string | null
          id?: string
          is_active?: boolean
          name: string
          primary_color?: string
          secondary_color?: string
          shop_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_gradient?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          icon_set?: string | null
          id?: string
          is_active?: boolean
          name?: string
          primary_color?: string
          secondary_color?: string
          shop_id?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_festival_themes_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_usage_history: {
        Row: {
          customer_gift_id: string
          customer_id: string
          id: string
          notes: string | null
          order_id: string | null
          shop_id: string | null
          used_amount: number | null
          used_at: string
        }
        Insert: {
          customer_gift_id: string
          customer_id: string
          id?: string
          notes?: string | null
          order_id?: string | null
          shop_id?: string | null
          used_amount?: number | null
          used_at?: string
        }
        Update: {
          customer_gift_id?: string
          customer_id?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          shop_id?: string | null
          used_amount?: number | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_gift_usage_history_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
      ingredient_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          shop_id: string | null
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          shop_id?: string | null
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ingredient_categories_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          batch_number: string | null
          category: string
          cost_per_unit: number
          created_at: string
          expiry_date: string | null
          id: string
          is_active: boolean
          last_ordered_date: string | null
          minimum_stock: number
          name: string
          quantity: number
          reorder_point: number | null
          reorder_quantity: number | null
          shop_id: string | null
          sort_order: number
          supplier: string | null
          supplier_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          category?: string
          cost_per_unit?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          last_ordered_date?: string | null
          minimum_stock?: number
          name: string
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          shop_id?: string | null
          sort_order?: number
          supplier?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          category?: string
          cost_per_unit?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          last_ordered_date?: string | null
          minimum_stock?: number
          name?: string
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          shop_id?: string | null
          sort_order?: number
          supplier?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      language_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          language_code: string
          language_name: string
          shop_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language_code: string
          language_name: string
          shop_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          language_code?: string
          language_name?: string
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_language_settings_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_limited_promotions_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      limited_reward_claims: {
        Row: {
          claimed_at: string | null
          customer_id: string | null
          id: string
          is_used: boolean | null
          limited_reward_id: string | null
          shop_id: string | null
          used_at: string | null
        }
        Insert: {
          claimed_at?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          limited_reward_id?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Update: {
          claimed_at?: string | null
          customer_id?: string | null
          id?: string
          is_used?: boolean | null
          limited_reward_id?: string | null
          shop_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_limited_reward_claims_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
          min_purchase: number | null
          name: string
          reward_code: string | null
          reward_type: string
          shop_id: string | null
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
          min_purchase?: number | null
          name: string
          reward_code?: string | null
          reward_type?: string
          shop_id?: string | null
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
          min_purchase?: number | null
          name?: string
          reward_code?: string | null
          reward_type?: string
          shop_id?: string | null
          start_date?: string
          target_month?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_limited_rewards_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      line_channel_credentials: {
        Row: {
          channel_access_token: string | null
          channel_secret: string | null
          created_at: string
          id: string
          scope: string
          shop_id: string
          updated_at: string
        }
        Insert: {
          channel_access_token?: string | null
          channel_secret?: string | null
          created_at?: string
          id?: string
          scope: string
          shop_id: string
          updated_at?: string
        }
        Update: {
          channel_access_token?: string | null
          channel_secret?: string | null
          created_at?: string
          id?: string
          scope?: string
          shop_id?: string
          updated_at?: string
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
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          selected_count?: number
          selected_numbers?: number[]
          session_name?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          selected_count?: number
          selected_numbers?: number[]
          session_name?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lottery_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          is_favorite: boolean | null
          join_date: string
          name: string
          phone: string
          points: number
          shop_id: string | null
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
          is_favorite?: boolean | null
          join_date?: string
          name: string
          phone: string
          points?: number
          shop_id?: string | null
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
          is_favorite?: boolean | null
          join_date?: string
          name?: string
          phone?: string
          points?: number
          shop_id?: string | null
          tier?: string
          total_spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_membership_settings_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_addon_groups: {
        Row: {
          addon_group_id: string | null
          created_at: string
          id: string
          menu_item_id: string | null
          shop_id: string | null
        }
        Insert: {
          addon_group_id?: string | null
          created_at?: string
          id?: string
          menu_item_id?: string | null
          shop_id?: string | null
        }
        Update: {
          addon_group_id?: string | null
          created_at?: string
          id?: string
          menu_item_id?: string | null
          shop_id?: string | null
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
            foreignKeyName: "fk_menu_addon_groups_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          menu_item_id?: string | null
          quantity_needed?: number
          shop_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          menu_item_id?: string | null
          quantity_needed?: number
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_ingredients_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
          shop_id: string | null
          sort_order: number | null
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
          shop_id?: string | null
          sort_order?: number | null
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
          shop_id?: string | null
          sort_order?: number | null
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
          {
            foreignKeyName: "menu_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          created_at: string
          event_key: string
          id: string
          shop_id: string | null
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          shop_id?: string | null
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_outbox_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_schedules: {
        Row: {
          created_at: string
          daily_enabled: boolean
          daily_time: string
          id: string
          is_active: boolean
          monthly_date: number
          monthly_enabled: boolean
          monthly_time: string
          platform: string
          report_types: string[]
          shop_id: string | null
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          daily_enabled?: boolean
          daily_time?: string
          id?: string
          is_active?: boolean
          monthly_date?: number
          monthly_enabled?: boolean
          monthly_time?: string
          platform?: string
          report_types?: string[]
          shop_id?: string | null
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          daily_enabled?: boolean
          daily_time?: string
          id?: string
          is_active?: boolean
          monthly_date?: number
          monthly_enabled?: boolean
          monthly_time?: string
          platform?: string
          report_types?: string[]
          shop_id?: string | null
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_schedules_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          daily_report_last_sent_date: string | null
          daily_reports: Json | null
          duration: number | null
          id: string
          monthly_report_last_sent_month: string | null
          monthly_reports: Json | null
          online_orders: Json | null
          pos_orders: Json | null
          selected_sound_id: string | null
          shop_id: string | null
          sound_enabled: boolean | null
          sound_popup: Json | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          daily_report_last_sent_date?: string | null
          daily_reports?: Json | null
          duration?: number | null
          id?: string
          monthly_report_last_sent_month?: string | null
          monthly_reports?: Json | null
          online_orders?: Json | null
          pos_orders?: Json | null
          selected_sound_id?: string | null
          shop_id?: string | null
          sound_enabled?: boolean | null
          sound_popup?: Json | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          daily_report_last_sent_date?: string | null
          daily_reports?: Json | null
          duration?: number | null
          id?: string
          monthly_report_last_sent_month?: string | null
          monthly_reports?: Json | null
          online_orders?: Json | null
          pos_orders?: Json | null
          selected_sound_id?: string | null
          shop_id?: string | null
          sound_enabled?: boolean | null
          sound_popup?: Json | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          name: string
          shop_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_sounds_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync_queue: {
        Row: {
          action_type: string
          created_at: string
          data: Json
          device_id: string
          id: string
          is_synced: boolean
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          synced_at?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_offline_sync_queue_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
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
          {
            foreignKeyName: "online_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
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
          {
            foreignKeyName: "fk_order_addons_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
          order_type: string
          payment_method: string
          pickup_time: string | null
          receipt_image_url: string | null
          shop_id: string | null
          side_effects_done: boolean
          status: string | null
          total_amount: number
          updated_at: string
          wifi_voucher_id: string | null
          wifi_voucher_password: string | null
          wifi_voucher_username: string | null
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
          order_type?: string
          payment_method?: string
          pickup_time?: string | null
          receipt_image_url?: string | null
          shop_id?: string | null
          side_effects_done?: boolean
          status?: string | null
          total_amount?: number
          updated_at?: string
          wifi_voucher_id?: string | null
          wifi_voucher_password?: string | null
          wifi_voucher_username?: string | null
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
          order_type?: string
          payment_method?: string
          pickup_time?: string | null
          receipt_image_url?: string | null
          shop_id?: string | null
          side_effects_done?: boolean
          status?: string | null
          total_amount?: number
          updated_at?: string
          wifi_voucher_id?: string | null
          wifi_voucher_password?: string | null
          wifi_voucher_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_wifi_voucher_id_fkey"
            columns: ["wifi_voucher_id"]
            isOneToOne: false
            referencedRelation: "wifi_vouchers"
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
          shop_id: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          member_id: string
          order_id?: string | null
          points_change: number
          shop_id?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          member_id?: string
          order_id?: string | null
          points_change?: number
          shop_id?: string | null
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
          {
            foreignKeyName: "point_transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      price_schedules: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          description: string | null
          discount_percentage: number | null
          end_time: string
          id: string
          is_active: boolean | null
          name: string
          shop_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          discount_percentage?: number | null
          end_time: string
          id?: string
          is_active?: boolean | null
          name: string
          shop_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          discount_percentage?: number | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          name?: string
          shop_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_price_schedules_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reservations: {
        Row: {
          created_at: string | null
          customer_id: string | null
          deposit_amount: number | null
          id: string
          menu_item_id: string | null
          notes: string | null
          pickup_time: string | null
          quantity: number
          reservation_date: string
          shop_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          pickup_time?: string | null
          quantity: number
          reservation_date: string
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          id?: string
          menu_item_id?: string | null
          notes?: string | null
          pickup_time?: string | null
          quantity?: number
          reservation_date?: string
          shop_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_reservations_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reservations_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
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
          shop_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          promotion_id?: string | null
          shop_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          promotion_id?: string | null
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_promotion_categories_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
          shop_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          promotion_id?: string | null
          shop_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          promotion_id?: string | null
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_promotion_menu_items_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
          discount_apply_type: string | null
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          min_purchase: number | null
          name: string
          shop_id: string | null
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
          discount_apply_type?: string | null
          discount_value?: number
          end_date: string
          id?: string
          is_active?: boolean
          min_purchase?: number | null
          name: string
          shop_id?: string | null
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
          discount_apply_type?: string | null
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          min_purchase?: number | null
          name?: string
          shop_id?: string | null
          start_date?: string
          target_group?: string
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          ingredient_id: string | null
          purchase_order_id: string | null
          quantity_ordered: number
          quantity_received: number | null
          shop_id: string | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          ingredient_id?: string | null
          purchase_order_id?: string | null
          quantity_ordered: number
          quantity_received?: number | null
          shop_id?: string | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          ingredient_id?: string | null
          purchase_order_id?: string | null
          quantity_ordered?: number
          quantity_received?: number | null
          shop_id?: string | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_order_items_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          shop_id: string | null
          status: string | null
          supplier_id: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date: string
          order_number: string
          shop_id?: string | null
          status?: string | null
          supplier_id: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          shop_id?: string | null
          status?: string | null
          supplier_id?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_orders_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_tickets: {
        Row: {
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          order_id: string | null
          party_size: number | null
          queue_number: number
          seated_at: string | null
          shop_id: string | null
          status: string
          table_id: string | null
          updated_at: string
        }
        Insert: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          party_size?: number | null
          queue_number: number
          seated_at?: string | null
          shop_id?: string | null
          status?: string
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          party_size?: number | null
          queue_number?: number
          seated_at?: string | null
          shop_id?: string | null
          status?: string
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_queue_table"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_settings: {
        Row: {
          created_at: string
          footer_message: string | null
          id: string
          shop_id: string | null
          show_customer_info: boolean
          show_date_time: boolean
          show_item_details: boolean
          show_logo: boolean
          show_order_number: boolean
          show_payment_method: boolean
          show_queue_number: boolean | null
          show_queue_qr: boolean | null
          show_shop_address: boolean
          show_shop_info: boolean
          show_shop_name: boolean
          show_shop_phone: boolean
          show_tax: boolean | null
          show_tax_id: boolean
          show_total: boolean
          show_wifi_qr: boolean | null
          show_wifi_voucher: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          footer_message?: string | null
          id?: string
          shop_id?: string | null
          show_customer_info?: boolean
          show_date_time?: boolean
          show_item_details?: boolean
          show_logo?: boolean
          show_order_number?: boolean
          show_payment_method?: boolean
          show_queue_number?: boolean | null
          show_queue_qr?: boolean | null
          show_shop_address?: boolean
          show_shop_info?: boolean
          show_shop_name?: boolean
          show_shop_phone?: boolean
          show_tax?: boolean | null
          show_tax_id?: boolean
          show_total?: boolean
          show_wifi_qr?: boolean | null
          show_wifi_voucher?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          footer_message?: string | null
          id?: string
          shop_id?: string | null
          show_customer_info?: boolean
          show_date_time?: boolean
          show_item_details?: boolean
          show_logo?: boolean
          show_order_number?: boolean
          show_payment_method?: boolean
          show_queue_number?: boolean | null
          show_queue_qr?: boolean | null
          show_shop_address?: boolean
          show_shop_info?: boolean
          show_shop_name?: boolean
          show_shop_phone?: boolean
          show_tax?: boolean | null
          show_tax_id?: boolean
          show_total?: boolean
          show_wifi_qr?: boolean | null
          show_wifi_voucher?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          area_id: string | null
          capacity: number
          created_at: string
          current_order_id: string | null
          current_queue_id: string | null
          id: string
          is_active: boolean | null
          pos_x: number | null
          pos_y: number | null
          position_x: number | null
          position_y: number | null
          shape: string | null
          shop_id: string | null
          status: string
          table_name: string | null
          table_number: string
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          capacity?: number
          created_at?: string
          current_order_id?: string | null
          current_queue_id?: string | null
          id?: string
          is_active?: boolean | null
          pos_x?: number | null
          pos_y?: number | null
          position_x?: number | null
          position_y?: number | null
          shape?: string | null
          shop_id?: string | null
          status?: string
          table_name?: string | null
          table_number: string
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          capacity?: number
          created_at?: string
          current_order_id?: string | null
          current_queue_id?: string | null
          id?: string
          is_active?: boolean | null
          pos_x?: number | null
          pos_y?: number | null
          position_x?: number | null
          position_y?: number | null
          shape?: string | null
          shop_id?: string | null
          status?: string
          table_name?: string | null
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          is_public: boolean | null
          menu_items: Json | null
          order_id: string | null
          rating: number
          response: string | null
          response_at: string | null
          response_by: string | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_public?: boolean | null
          menu_items?: Json | null
          order_id?: string | null
          rating: number
          response?: string | null
          response_at?: string | null
          response_by?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_public?: boolean | null
          menu_items?: Json | null
          order_id?: string | null
          rating?: number
          response?: string | null
          response_at?: string | null
          response_by?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
          shop_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_required: number
          shop_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_required?: number
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rewards_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          shop_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          shop_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          shop_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_security_logs_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          cash_difference: number | null
          closing_cash: number | null
          created_at: string | null
          expected_cash: number | null
          id: string
          notes: string | null
          opening_cash: number | null
          shift_end: string | null
          shift_start: string
          shop_id: string | null
          staff_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cash_difference?: number | null
          closing_cash?: number | null
          created_at?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opening_cash?: number | null
          shift_end?: string | null
          shift_start: string
          shop_id?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cash_difference?: number | null
          closing_cash?: number | null
          created_at?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opening_cash?: number | null
          shift_end?: string | null
          shift_start?: string
          shop_id?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          service_charge_enabled: boolean | null
          service_charge_rate: number | null
          shop_id: string | null
          shop_name: string
          tax_id: string | null
          updated_at: string
          vat_enabled: boolean | null
          vat_included: boolean | null
          vat_rate: number | null
          wifi_footer_text: string | null
          wifi_header_text: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          service_charge_enabled?: boolean | null
          service_charge_rate?: number | null
          shop_id?: string | null
          shop_name?: string
          tax_id?: string | null
          updated_at?: string
          vat_enabled?: boolean | null
          vat_included?: boolean | null
          vat_rate?: number | null
          wifi_footer_text?: string | null
          wifi_header_text?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          service_charge_enabled?: boolean | null
          service_charge_rate?: number | null
          shop_id?: string | null
          shop_name?: string
          tax_id?: string | null
          updated_at?: string
          vat_enabled?: boolean | null
          vat_included?: boolean | null
          vat_rate?: number | null
          wifi_footer_text?: string | null
          wifi_header_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          branch_code: string | null
          branch_name: string | null
          created_at: string
          database_mode: string
          id: string
          is_active: boolean
          phone: string | null
          shop_name: string
          supabase_project_key: string | null
          supabase_project_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_code?: string | null
          branch_name?: string | null
          created_at?: string
          database_mode?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          shop_name: string
          supabase_project_key?: string | null
          supabase_project_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_code?: string | null
          branch_name?: string | null
          created_at?: string
          database_mode?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          shop_name?: string
          supabase_project_key?: string | null
          supabase_project_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          recipient_phone: string
          sent_at: string | null
          shop_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          recipient_phone: string
          sent_at?: string | null
          shop_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          recipient_phone?: string
          sent_at?: string | null
          shop_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sms_logs_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          sender_name: string | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          sender_name?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          sender_name?: string | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sms_settings_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          department: string
          email: string | null
          hire_date: string
          id: string
          is_active: boolean
          name: string
          phone: string
          position: string
          role: string
          salary: number
          shop_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          email?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean
          name: string
          phone: string
          position: string
          role?: string
          salary?: number
          shop_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          position?: string
          role?: string
          salary?: number
          shop_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_card_milestones: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          reward_description: string | null
          reward_menu_item_id: string | null
          reward_type: string
          reward_value: number
          shop_id: string | null
          stamp_card_id: string
          stamp_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          reward_description?: string | null
          reward_menu_item_id?: string | null
          reward_type?: string
          reward_value?: number
          shop_id?: string | null
          stamp_card_id: string
          stamp_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          reward_description?: string | null
          reward_menu_item_id?: string | null
          reward_type?: string
          reward_value?: number
          shop_id?: string | null
          stamp_card_id?: string
          stamp_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stamp_card_milestones_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_card_milestones_reward_menu_item_id_fkey"
            columns: ["reward_menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_card_milestones_stamp_card_id_fkey"
            columns: ["stamp_card_id"]
            isOneToOne: false
            referencedRelation: "stamp_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_cards: {
        Row: {
          allow_multiple_cards: boolean
          auto_reset_on_complete: boolean
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          min_purchase_per_stamp: number
          name: string
          shop_id: string | null
          start_date: string | null
          total_stamps: number
          updated_at: string
        }
        Insert: {
          allow_multiple_cards?: boolean
          auto_reset_on_complete?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_purchase_per_stamp?: number
          name: string
          shop_id?: string | null
          start_date?: string | null
          total_stamps?: number
          updated_at?: string
        }
        Update: {
          allow_multiple_cards?: boolean
          auto_reset_on_complete?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_purchase_per_stamp?: number
          name?: string
          shop_id?: string | null
          start_date?: string | null
          total_stamps?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stamp_cards_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          credit_limit: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: number | null
          phone: string | null
          shop_id: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          shop_id?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          shop_id?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          records_processed: number | null
          shop_id: string | null
          status: string | null
          sync_data: Json | null
          sync_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          records_processed?: number | null
          shop_id?: string | null
          status?: string | null
          sync_data?: Json | null
          sync_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          records_processed?: number | null
          shop_id?: string | null
          status?: string | null
          sync_data?: Json | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sync_logs_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "api_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      table_areas: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          shop_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          shop_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_table_areas_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      table_orders: {
        Row: {
          bill_discount: number
          bill_discount_type: string
          cart_items: Json
          created_at: string
          id: string
          member_id: string | null
          round_number: number
          shop_id: string | null
          status: string
          table_id: string
          table_number: string
          updated_at: string
        }
        Insert: {
          bill_discount?: number
          bill_discount_type?: string
          cart_items?: Json
          created_at?: string
          id?: string
          member_id?: string | null
          round_number?: number
          shop_id?: string | null
          status?: string
          table_id: string
          table_number: string
          updated_at?: string
        }
        Update: {
          bill_discount?: number
          bill_discount_type?: string
          cart_items?: Json
          created_at?: string
          id?: string
          member_id?: string | null
          round_number?: number
          shop_id?: string | null
          status?: string
          table_id?: string
          table_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_table_orders_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      table_reservations: {
        Row: {
          created_at: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          shop_id: string | null
          status: string | null
          table_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          shop_id?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          shop_id?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_table_reservations_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          area_id: string | null
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          position_x: number | null
          position_y: number | null
          shop_id: string | null
          status: string | null
          table_number: string
          updated_at: string | null
        }
        Insert: {
          area_id?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position_x?: number | null
          position_y?: number | null
          shop_id?: string | null
          status?: string | null
          table_number: string
          updated_at?: string | null
        }
        Update: {
          area_id?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position_x?: number | null
          position_y?: number | null
          shop_id?: string | null
          status?: string | null
          table_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tables_area_id"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tables_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tables_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "table_areas"
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
          shop_id: string | null
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
          shop_id?: string | null
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
          shop_id?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
          work_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "time_attendance_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          language_code: string
          shop_id: string | null
          translation_key: string
          translation_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_code: string
          shop_id?: string | null
          translation_key: string
          translation_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language_code?: string
          shop_id?: string | null
          translation_key?: string
          translation_value?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_translations_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          is_granted: boolean
          max_discount_percent: number | null
          permission_key: string
          shop_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          is_granted?: boolean
          max_discount_percent?: number | null
          permission_key: string
          shop_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          is_granted?: boolean
          max_discount_percent?: number | null
          permission_key?: string
          shop_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_permissions_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_shop_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_primary: boolean
          shop_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_primary?: boolean
          shop_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_primary?: boolean
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_shop_assignments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_shop_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          failed_login_attempts: number | null
          full_name: string | null
          id: string
          is_active: boolean
          last_login: string | null
          locked_until: string | null
          password_hash: string
          password_salt: string | null
          role: string
          shop_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          failed_login_attempts?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          password_hash: string
          password_salt?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          failed_login_attempts?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          password_hash?: string
          password_salt?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_price_tiers: {
        Row: {
          created_at: string
          duration_hours: number
          id: string
          is_active: boolean
          max_amount: number
          min_amount: number
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_hours: number
          id?: string
          is_active?: boolean
          max_amount: number
          min_amount?: number
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_hours?: number
          id?: string
          is_active?: boolean
          max_amount?: number
          min_amount?: number
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wifi_price_tiers_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_reset_schedule: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_reset_at: string | null
          reset_days: string[] | null
          reset_time: string
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_reset_at?: string | null
          reset_days?: string[] | null
          reset_time?: string
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_reset_at?: string | null
          reset_days?: string[] | null
          reset_time?: string
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_wifi_reset_schedule_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_vouchers: {
        Row: {
          created_at: string | null
          duration_hours: number | null
          id: string
          is_used: boolean | null
          order_id: string | null
          password: string
          qr_code_url: string | null
          shop_id: string | null
          updated_at: string | null
          used_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          password: string
          qr_code_url?: string | null
          shop_id?: string | null
          updated_at?: string | null
          used_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          password?: string
          qr_code_url?: string | null
          shop_id?: string | null
          updated_at?: string | null
          used_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wifi_vouchers_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_user: {
        Args: { password_input: string; username_input: string }
        Returns: Json
      }
      authenticated_user_role: { Args: never; Returns: string }
      calculate_menu_cost: { Args: { menu_id: string }; Returns: number }
      check_rate_limit: {
        Args: {
          identifier: string
          max_requests?: number
          time_window_minutes?: number
        }
        Returns: boolean
      }
      claim_limited_promotion: {
        Args: { customer_id_param: string; promotion_id_param: string }
        Returns: Json
      }
      claim_limited_reward: {
        Args: { reward_id: string; user_id: string }
        Returns: Json
      }
      current_shop_id_from_header: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      get_active_promotions: {
        Args: never
        Returns: {
          apply_to: string
          category_ids: string[]
          description: string
          discount_type: string
          discount_value: number
          id: string
          menu_item_ids: string[]
          name: string
        }[]
      }
      get_and_mark_wifi_voucher: {
        Args: { p_order_id: string }
        Returns: {
          id: string
          password: string
          qr_code_url: string
          username: string
        }[]
      }
      get_low_stock_ingredients: {
        Args: never
        Returns: {
          category: string
          id: string
          minimum_stock: number
          name: string
          quantity: number
          shortage: number
          unit: string
        }[]
      }
      get_shop_benchmark: {
        Args: { p_start: string }
        Returns: {
          branch_name: string
          shop_id: string
          shop_name: string
          top_items: Json
          total_members: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_user_shop_id: { Args: { p_user_id: string }; Returns: string }
      has_verified_shop_access: { Args: { _shop_id: string }; Returns: boolean }
      hash_password: { Args: { password: string }; Returns: Json }
      header_user_id: { Args: never; Returns: string }
      header_user_shop_ids: { Args: never; Returns: string[] }
      is_admin_header: { Args: never; Returns: boolean }
      restore_stock_for_cancelled_order: {
        Args: { order_id_param: string }
        Returns: Json
      }
      test_order_number_generation: {
        Args: { test_count?: number }
        Returns: {
          error_message: string
          order_number: string
          success: boolean
          test_num: number
        }[]
      }
      toggle_menu_availability: {
        Args: { menu_item_id: string; new_status: boolean }
        Returns: boolean
      }
      validate_input: {
        Args: { input_text: string; input_type?: string }
        Returns: boolean
      }
      validate_input_secure: {
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
    Enums: {},
  },
} as const
