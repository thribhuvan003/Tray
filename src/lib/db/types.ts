export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          id: string;
          meta: Json | null;
          target_id: string | null;
          target_type: string | null;
          tenant_id: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          meta?: Json | null;
          target_id?: string | null;
          target_type?: string | null;
          tenant_id?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          meta?: Json | null;
          target_id?: string | null;
          target_type?: string | null;
          tenant_id?: string | null;
        };
        Relationships: [];
      };
      menu_categories: {
        Row: { created_at: string; id: string; name: string; sort_order: number; tenant_id: string };
        Insert: { created_at?: string; id?: string; name: string; sort_order?: number; tenant_id: string };
        Update: { created_at?: string; id?: string; name?: string; sort_order?: number; tenant_id?: string };
        Relationships: [];
      };
      menu_items: {
        Row: {
          category_id: string | null;
          created_at: string;
          description: string | null;
          diet: Database["public"]["Enums"]["diet"];
          id: string;
          image_url: string | null;
          in_stock: boolean;
          name: string;
          prep_target_seconds: number;
          price_paise: number;
          sort_order: number;
          status: Database["public"]["Enums"]["menu_item_status"];
          stock_qty: number | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          diet?: Database["public"]["Enums"]["diet"];
          id?: string;
          image_url?: string | null;
          in_stock?: boolean;
          name: string;
          prep_target_seconds?: number;
          price_paise: number;
          sort_order?: number;
          status?: Database["public"]["Enums"]["menu_item_status"];
          stock_qty?: number | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          diet?: Database["public"]["Enums"]["diet"];
          id?: string;
          image_url?: string | null;
          in_stock?: boolean;
          name?: string;
          prep_target_seconds?: number;
          price_paise?: number;
          sort_order?: number;
          status?: Database["public"]["Enums"]["menu_item_status"];
          stock_qty?: number | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          diet_snapshot: Database["public"]["Enums"]["diet"];
          id: string;
          menu_item_id: string | null;
          name_snapshot: string;
          order_id: string;
          price_paise_snapshot: number;
          qty: number;
          tenant_id: string;
        };
        Insert: {
          diet_snapshot: Database["public"]["Enums"]["diet"];
          id?: string;
          menu_item_id?: string | null;
          name_snapshot: string;
          order_id: string;
          price_paise_snapshot: number;
          qty: number;
          tenant_id: string;
        };
        Update: {
          diet_snapshot?: Database["public"]["Enums"]["diet"];
          id?: string;
          menu_item_id?: string | null;
          name_snapshot?: string;
          order_id?: string;
          price_paise_snapshot?: number;
          qty?: number;
          tenant_id?: string;
        };
        Relationships: [];
      };
      order_status_logs: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          from_status: Database["public"]["Enums"]["order_status"] | null;
          id: string;
          note: string | null;
          order_id: string;
          tenant_id: string;
          to_status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["order_status"] | null;
          id?: string;
          note?: string | null;
          order_id: string;
          tenant_id: string;
          to_status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["order_status"] | null;
          id?: string;
          note?: string | null;
          order_id?: string;
          tenant_id?: string;
          to_status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [];
      };
      orders: {
        Row: {
          collected_at: string | null;
          created_at: string;
          customer_name: string | null;
          customer_phone: string | null;
          id: string;
          notes: string | null;
          order_type: Database["public"]["Enums"]["order_type"];
          otp_attempts: number;
          otp_hash: string | null;
          payment_expires_at: string | null;
          placed_at: string;
          ready_at: string | null;
          short_code: string;
          status: Database["public"]["Enums"]["order_status"];
          table_label: string | null;
          tenant_id: string;
          total_paise: number;
          user_id: string | null;
        };
        Insert: {
          collected_at?: string | null;
          created_at?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          id?: string;
          notes?: string | null;
          order_type?: Database["public"]["Enums"]["order_type"];
          otp_attempts?: number;
          otp_hash?: string | null;
          payment_expires_at?: string | null;
          placed_at?: string;
          ready_at?: string | null;
          short_code: string;
          status?: Database["public"]["Enums"]["order_status"];
          table_label?: string | null;
          tenant_id: string;
          total_paise: number;
          user_id?: string | null;
        };
        Update: {
          collected_at?: string | null;
          created_at?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          id?: string;
          notes?: string | null;
          order_type?: Database["public"]["Enums"]["order_type"];
          otp_attempts?: number;
          otp_hash?: string | null;
          payment_expires_at?: string | null;
          placed_at?: string;
          ready_at?: string | null;
          short_code?: string;
          status?: Database["public"]["Enums"]["order_status"];
          table_label?: string | null;
          tenant_id?: string;
          total_paise?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_paise: number;
          created_at: string;
          id: string;
          order_id: string;
          raw_event_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          tenant_id: string;
        };
        Insert: {
          amount_paise: number;
          created_at?: string;
          id?: string;
          order_id: string;
          raw_event_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          tenant_id: string;
        };
        Update: {
          amount_paise?: number;
          created_at?: string;
          id?: string;
          order_id?: string;
          raw_event_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          tenant_id?: string;
        };
        Relationships: [];
      };
      staff_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          role: Database["public"]["Enums"]["member_role"];
          tenant_id: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invited_by?: string | null;
          role: Database["public"]["Enums"]["member_role"];
          tenant_id: string;
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          role?: Database["public"]["Enums"]["member_role"];
          tenant_id?: string;
          token?: string;
        };
        Relationships: [];
      };
      tenant_memberships: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["member_role"];
          tenant_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_active?: boolean;
          role: Database["public"]["Enums"]["member_role"];
          tenant_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["member_role"];
          tenant_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          allowed_domain: string | null;
          college_name: string;
          created_at: string;
          hero_tagline: string | null;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          razorpay_key_id_enc: string | null;
          razorpay_key_secret_enc: string | null;
          slug: string;
          upi_vpa: string | null;
        };
        Insert: {
          allowed_domain?: string | null;
          college_name: string;
          created_at?: string;
          hero_tagline?: string | null;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name: string;
          razorpay_key_id_enc?: string | null;
          razorpay_key_secret_enc?: string | null;
          slug: string;
          upi_vpa?: string | null;
        };
        Update: {
          allowed_domain?: string | null;
          college_name?: string;
          created_at?: string;
          hero_tagline?: string | null;
          id?: string;
          is_active?: boolean;
          logo_url?: string | null;
          name?: string;
          razorpay_key_id_enc?: string | null;
          razorpay_key_secret_enc?: string | null;
          slug?: string;
          upi_vpa?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_tenant_id: { Args: Record<string, never>; Returns: string };
      next_order_short_code: { Args: { p_tenant: string }; Returns: string };
      pre_request_set_tenant: { Args: Record<string, never>; Returns: undefined };
      resolve_tenant: {
        Args: { p_slug: string };
        Returns: {
          allowed_domain: string | null;
          college_name: string;
          hero_tagline: string | null;
          id: string;
          is_active: boolean;
          logo_url: string | null;
          name: string;
          slug: string;
        }[];
      };
    };
    Enums: {
      diet: "veg" | "nonveg" | "egg";
      member_role: "student" | "kitchen_staff" | "canteen_admin" | "super_admin";
      menu_item_status: "draft" | "live" | "archived";
      order_status:
        | "pending_payment"
        | "placed"
        | "preparing"
        | "ready"
        | "collected"
        | "rejected"
        | "expired";
      order_type: "takeaway" | "dine_in";
      payment_status: "initiated" | "captured" | "failed" | "refunded";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database["public"];

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"];
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T];

export type Tenant = Tables<"tenants">;
export type MenuItem = Tables<"menu_items">;
export type MenuCategory = Tables<"menu_categories">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type OrderStatus = Enums<"order_status">;
export type OrderType = Enums<"order_type">;
export type Diet = Enums<"diet">;
export type MemberRole = Enums<"member_role">;
