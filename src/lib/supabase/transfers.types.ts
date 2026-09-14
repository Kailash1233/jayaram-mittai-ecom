import type { Database } from './database.types';
import type { JmLocation } from './hr.types';
import type { JmInventoryItem } from './inventory.types';

export type JmFlowType = Database['public']['Enums']['jm_flow_type'];
export type JmTransferStatus = Database['public']['Enums']['jm_transfer_status'];

export type JmFinishedGood = Database['public']['Tables']['jm_finished_goods_items']['Row'];
export type JmFinishedGoodInsert = Database['public']['Tables']['jm_finished_goods_items']['Insert'];
export type JmFinishedGoodUpdate = Database['public']['Tables']['jm_finished_goods_items']['Update'];

export type JmTransferBatch = Database['public']['Tables']['jm_transfer_batches']['Row'];
export type JmTransferBatchInsert = Database['public']['Tables']['jm_transfer_batches']['Insert'];
export type JmTransferBatchUpdate = Database['public']['Tables']['jm_transfer_batches']['Update'];

export type JmTransferItem = Database['public']['Tables']['jm_transfer_items']['Row'];
export type JmTransferItemInsert = Database['public']['Tables']['jm_transfer_items']['Insert'];
export type JmTransferItemUpdate = Database['public']['Tables']['jm_transfer_items']['Update'];

export type JmTransferItemWithDetails = JmTransferItem & {
  finished_good?: JmFinishedGood | null;
  raw_material?: JmInventoryItem | null;
};

export type JmTransferBatchWithDetails = JmTransferBatch & {
  origin?: JmLocation | null;
  destination?: JmLocation | null;
  items?: JmTransferItemWithDetails[];
};
