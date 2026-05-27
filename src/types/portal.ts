export type Status = "placed" | "preparing" | "ready" | "collected";

export interface OrderRow {
  id: string;
  short_code: string;
  status: Status | "pending_payment" | "rejected" | "expired" | "cancelled_by_kitchen" | "partially_ready" | "refunded";
  total_paise: number;
  placed_at: string;
  ready_at: string | null;
  collected_at: string | null;
  customer_name: string | null;
  order_type: "takeaway" | "dine_in";
  table_label: string | null;
  user_id?: string | null;
}

export interface LineRow {
  id: string;
  order_id: string;
  name_snapshot: string;
  qty: number;
  diet_snapshot: "veg" | "nonveg" | "egg";
}
