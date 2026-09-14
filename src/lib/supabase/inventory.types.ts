import type { Database } from './database.types';

export type JmInventoryItem = Database['public']['Tables']['jm_inventory_items']['Row'];
export type JmInventoryItemInsert = Database['public']['Tables']['jm_inventory_items']['Insert'];
export type JmInventoryItemUpdate = Database['public']['Tables']['jm_inventory_items']['Update'];

export type JmInventoryLog = Database['public']['Tables']['jm_inventory_logs']['Row'];
export type JmInventoryLogInsert = Database['public']['Tables']['jm_inventory_logs']['Insert'];
export type JmInventoryLogUpdate = Database['public']['Tables']['jm_inventory_logs']['Update'];

export type JmUnitType = Database['public']['Enums']['jm_unit_type'];
export type JmInventoryLogType = Database['public']['Enums']['jm_inventory_log_type'];

export type JmInventoryLogWithItem = JmInventoryLog & {
  item?: JmInventoryItem | null;
};

export interface InventoryItemStockSummary extends JmInventoryItem {
  total_procured: number;
  total_used: number;
  total_disposed: number;
  current_stock: number;
  is_low_stock: boolean;
}
