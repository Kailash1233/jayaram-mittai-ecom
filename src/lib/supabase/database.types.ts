export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JmLocationType = 'outlet' | 'kitchen';
export type JmEmployeeStatus = 'active' | 'inactive';
export type JmAttendanceStatus = 'present' | 'absent' | 'half-day' | 'late' | 'on leave';
export type JmPerformanceType = 'hike' | 'good' | 'average' | 'bad';
export type JmUnitType = 'Litres' | 'Kg' | 'Grams' | 'Units';
export type JmFlowType = 'finished_goods' | 'raw_materials';
export type JmTransferStatus = 'dispatched' | 'received' | 'returned' | 'return_confirmed';
export type JmUserRole = 'manager' | 'outlet_staff' | 'kitchen_staff';
export type JmInventoryLogType = 'procured' | 'used' | 'disposed';
export type JmOrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Database {
  public: {
    Tables: {
      j_locations: {
        Row: {
          id: string;
          code: string;
          name: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      j_halls: {
        Row: {
          id: string;
          location_id: string;
          name: string;
          capacity: number | null;
          full_day_price: number;
          half_day_price: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          name: string;
          capacity?: number | null;
          full_day_price: number;
          half_day_price: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          name?: string;
          capacity?: number | null;
          full_day_price?: number;
          half_day_price?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      j_bookings: {
        Row: {
          id: string;
          booking_code: string;
          hall_id: string;
          event_date: string;
          slot_type: 'Full Day' | 'Half Day';
          half_period: 'Morning' | 'Evening' | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          amount: number;
          status: 'Confirmed' | 'Blocked' | 'Cancelled';
          booking_type: 'online' | 'offline';
          reason: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          hall_id: string;
          event_date: string;
          slot_type: 'Full Day' | 'Half Day';
          half_period?: 'Morning' | 'Evening' | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          amount?: number;
          status?: 'Confirmed' | 'Blocked' | 'Cancelled';
          booking_type?: 'online' | 'offline';
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string;
          hall_id?: string;
          event_date?: string;
          slot_type?: 'Full Day' | 'Half Day';
          half_period?: 'Morning' | 'Evening' | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          amount?: number;
          status?: 'Confirmed' | 'Blocked' | 'Cancelled';
          booking_type?: 'online' | 'offline';
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      j_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: 'manager' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'manager' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'manager' | 'admin';
          created_at?: string;
        };
        Relationships: [];
      };

      jm_locations: {
        Row: {
          id: string;
          name: string;
          type: JmLocationType;
          address: string | null;
          phone: string | null;
          incharge_person: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: JmLocationType;
          address?: string | null;
          phone?: string | null;
          incharge_person?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: JmLocationType;
          address?: string | null;
          phone?: string | null;
          incharge_person?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      jm_profiles: {
        Row: {
          id: string;
          role: JmUserRole;
          location_id: string;
          full_name: string | null;
          can_view_salary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: JmUserRole;
          location_id: string;
          full_name?: string | null;
          can_view_salary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: JmUserRole;
          location_id?: string;
          full_name?: string | null;
          can_view_salary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jm_employee_profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          emp_code: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          residential_address: string | null;
          designation: string;
          location_id: string;
          join_date: string;
          status: JmEmployeeStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          emp_code: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          email?: string | null;
          residential_address?: string | null;
          designation: string;
          location_id: string;
          join_date: string;
          status?: JmEmployeeStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          emp_code?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          email?: string | null;
          residential_address?: string | null;
          designation?: string;
          location_id?: string;
          join_date?: string;
          status?: JmEmployeeStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jm_employee_attendance: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          status: JmAttendanceStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          status: JmAttendanceStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          status?: JmAttendanceStatus;
          created_at?: string;
        };
        Relationships: [];
      };

      jm_employee_performance_notes: {
        Row: {
          id: string;
          employee_id: string;
          month_year: string;
          type: JmPerformanceType;
          comments: string;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          month_year: string;
          type: JmPerformanceType;
          comments: string;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          month_year?: string;
          type?: JmPerformanceType;
          comments?: string;
          score?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };

      jm_employee_salaries: {
        Row: {
          id: string;
          employee_id: string;
          month_year: string;
          base_pay: number | null;
          deductions: number | null;
          bonus: number | null;
          amount_paid: number | null;
          paid_on: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          month_year: string;
          base_pay?: number | null;
          deductions?: number | null;
          bonus?: number | null;
          amount_paid?: number | null;
          paid_on?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          month_year?: string;
          base_pay?: number | null;
          deductions?: number | null;
          bonus?: number | null;
          amount_paid?: number | null;
          paid_on?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      jm_inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          unit_of_measure: JmUnitType;
          low_stock_threshold: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          unit_of_measure: JmUnitType;
          low_stock_threshold?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          unit_of_measure?: JmUnitType;
          low_stock_threshold?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jm_inventory_logs: {
        Row: {
          id: string;
          item_id: string;
          quantity: number;
          price: number | null;
          vendor_name: string | null;
          mfg_date: string | null;
          expiry_date: string | null;
          comments: string | null;
          log_type: JmInventoryLogType;
          is_voided: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          quantity: number;
          price?: number | null;
          vendor_name?: string | null;
          mfg_date?: string | null;
          expiry_date?: string | null;
          comments?: string | null;
          log_type?: JmInventoryLogType;
          is_voided?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          quantity?: number;
          price?: number | null;
          vendor_name?: string | null;
          mfg_date?: string | null;
          expiry_date?: string | null;
          comments?: string | null;
          log_type?: JmInventoryLogType;
          is_voided?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      jm_finished_goods_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          unit_of_measure: JmUnitType;
          price: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          unit_of_measure: JmUnitType;
          price: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          unit_of_measure?: JmUnitType;
          price?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jm_transfer_batches: {
        Row: {
          id: string;
          flow_type: JmFlowType;
          origin_location_id: string;
          destination_location_id: string;
          status: JmTransferStatus;
          dispatched_by: string | null;
          dispatched_at: string;
          received_by: string | null;
          received_at: string | null;
          returned_by: string | null;
          returned_at: string | null;
          return_confirmed_by: string | null;
          return_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flow_type: JmFlowType;
          origin_location_id: string;
          destination_location_id: string;
          status?: JmTransferStatus;
          dispatched_by?: string | null;
          dispatched_at?: string;
          received_by?: string | null;
          received_at?: string | null;
          returned_by?: string | null;
          returned_at?: string | null;
          return_confirmed_by?: string | null;
          return_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          flow_type?: JmFlowType;
          origin_location_id?: string;
          destination_location_id?: string;
          status?: JmTransferStatus;
          dispatched_by?: string | null;
          dispatched_at?: string;
          received_by?: string | null;
          received_at?: string | null;
          returned_by?: string | null;
          returned_at?: string | null;
          return_confirmed_by?: string | null;
          return_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jm_transfer_items: {
        Row: {
          id: string;
          batch_id: string;
          finished_good_id: string | null;
          raw_material_id: string | null;
          qty_dispatched: number;
          qty_received: number | null;
          discrepancy_note: string | null;
          return_qty: number | null;
          return_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          finished_good_id?: string | null;
          raw_material_id?: string | null;
          qty_dispatched: number;
          qty_received?: number | null;
          discrepancy_note?: string | null;
          return_qty?: number | null;
          return_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          finished_good_id?: string | null;
          raw_material_id?: string | null;
          qty_dispatched?: number;
          qty_received?: number | null;
          discrepancy_note?: string | null;
          return_qty?: number | null;
          return_reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      jm_orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          shipping_address: string;
          status: JmOrderStatus;
          subtotal: number;
          discount: number;
          total: number;
          payment_gateway: string | null;
          payment_id: string | null;
          payment_status: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          shipping_address: string;
          status?: JmOrderStatus;
          subtotal: number;
          discount?: number;
          total: number;
          payment_gateway?: string | null;
          payment_id?: string | null;
          payment_status?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          shipping_address?: string;
          status?: JmOrderStatus;
          subtotal?: number;
          discount?: number;
          total?: number;
          payment_gateway?: string | null;
          payment_id?: string | null;
          payment_status?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jm_order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // ─── Shared Cross-Tenant Tables ────────────────────────────────────────

      shared_dish_image_library: {
        Row: {
          id: string;
          dish_name_normalized: string;
          image_url: string;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dish_name_normalized: string;
          image_url: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dish_name_normalized?: string;
          image_url?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── Jayaram Mittai Ecommerce Tables ───────────────────────────────────

      jayaram_mittai_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_addresses: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          line1: string;
          line2: string | null;
          city: string;
          pincode: string;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          label?: string;
          line1: string;
          line2?: string | null;
          city?: string;
          pincode: string;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          label?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          pincode?: string;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          unit: string;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          unit?: string;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          unit?: string;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_product_availability: {
        Row: {
          id: string;
          product_id: string;
          is_available: boolean;
          available_start_time: string | null;
          available_end_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          is_available?: boolean;
          available_start_time?: string | null;
          available_end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          is_available?: boolean;
          available_start_time?: string | null;
          available_end_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_product_out_of_stock: {
        Row: {
          id: string;
          product_id: string;
          is_out_of_stock: boolean;
          out_of_stock_until: string | null;
          custom_message: string | null;
          set_by_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          is_out_of_stock?: boolean;
          out_of_stock_until?: string | null;
          custom_message?: string | null;
          set_by_admin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          is_out_of_stock?: boolean;
          out_of_stock_until?: string | null;
          custom_message?: string | null;
          set_by_admin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_delivery_zones: {
        Row: {
          id: string;
          name: string;
          center_lat: number;
          center_lng: number;
          radius_km: number;
          is_enabled: boolean;
          delivery_charge_override: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          center_lat: number;
          center_lng: number;
          radius_km: number;
          is_enabled?: boolean;
          delivery_charge_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          center_lat?: number;
          center_lng?: number;
          radius_km?: number;
          is_enabled?: boolean;
          delivery_charge_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_delivery_rules: {
        Row: {
          id: string;
          max_distance_km: number;
          delivery_charge: number;
          estimated_hours: number;
          free_delivery_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          max_distance_km: number;
          delivery_charge: number;
          estimated_hours: number;
          free_delivery_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          max_distance_km?: number;
          delivery_charge?: number;
          estimated_hours?: number;
          free_delivery_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_operational_hours: {
        Row: {
          id: string;
          day_of_week: number | null;
          open_time: string;
          close_time: string;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week?: number | null;
          open_time?: string;
          close_time?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number | null;
          open_time?: string;
          close_time?: string;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          address_id: string | null;
          status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal: number;
          delivery_charge: number;
          total: number;
          payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
          payment_method: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo' | null;
          idempotency_key: string;
          customer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_id: string;
          address_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal: number;
          delivery_charge?: number;
          total: number;
          payment_status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
          payment_method?: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo' | null;
          idempotency_key: string;
          customer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string;
          address_id?: string | null;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal?: number;
          delivery_charge?: number;
          total?: number;
          payment_status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
          payment_method?: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo' | null;
          idempotency_key?: string;
          customer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          line_total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name_snapshot?: string;
          unit_price_snapshot?: number;
          quantity?: number;
          line_total?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_reference: string | null;
          status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
          amount: number;
          payment_method: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo' | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider: string;
          provider_reference?: string | null;
          status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
          amount: number;
          payment_method?: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo' | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          provider_reference?: string | null;
          status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
          amount?: number;
          payment_method?: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo' | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_notifications: {
        Row: {
          id: string;
          customer_id: string | null;
          type: string;
          title: string | null;
          message: string;
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          type?: string;
          title?: string | null;
          message: string;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          type?: string;
          title?: string | null;
          message?: string;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      jayaram_mittai_audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      jm_location_type: JmLocationType;
      jm_employee_status: JmEmployeeStatus;
      jm_attendance_status: JmAttendanceStatus;
      jm_performance_type: JmPerformanceType;
      jm_unit_type: JmUnitType;
      jm_flow_type: JmFlowType;
      jm_transfer_status: JmTransferStatus;
      jm_user_role: JmUserRole;
      jm_inventory_log_type: JmInventoryLogType;
      jm_order_status: JmOrderStatus;
      jayaram_mittai_user_role: 'customer' | 'admin';
      jayaram_mittai_order_status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
      jayaram_mittai_payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
      jayaram_mittai_payment_method: 'debit_card' | 'credit_card' | 'upi' | 'net_banking' | 'sodexo';
    };
  };
}
