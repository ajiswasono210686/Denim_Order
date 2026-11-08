export type MeasurementCategory = 'Celana_Jeans' | 'Kemeja_Atasan' | 'Rok_Gaun' | 'Aksesori_Lainnya';
export type OrderStatus = 'Received' | 'In Progress' | 'Completed' | 'Picked Up';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';
export type PaymentMethod = 'Cash' | 'QRIS' | 'Transfer';
export type Currency = 'IDR' | 'USD' | 'SGD' | 'MYR';

export interface Customer {
  id: string; name: string; phone: string; normalized_phone: string; address: string; notes: string;
  created_at: string; updated_at: string;
}
export interface CustomerMeasurement {
  id: string; customer_id: string; profile_label: string; category: MeasurementCategory; unit: 'cm' | 'inch';
  metrics: Record<string, number | string>; fitting_notes: string; updated_at: string;
}
export interface OrderItem {
  id: string; service_type: 'Custom' | 'Repair'; category: string; measurement_id: string | null; item_name: string;
  specifications: string; qty: number; unit_price: number; subtotal: number; workload_points: number; total_points: number;
}
export interface Order {
  id: string; customer_id: string; customer_name_snapshot: string; customer_phone_snapshot: string; order_date: string;
  deadline_date: string; status: OrderStatus; items: OrderItem[]; total_workload_points: number; subtotal_amount: number;
  discount_amount: number; total_amount: number; dp_amount: number; paid_amount: number; remaining_balance: number;
  payment_status: PaymentStatus; payment_method: PaymentMethod; cash_received: number; cash_change: number; notes: string;
  created_at: string; updated_at: string;
}
export interface CashflowTransaction {
  id: string; transaction_date: string; type: 'Income' | 'Expense'; category: string; amount: number;
  payment_method: PaymentMethod; reference_order_id: string | null; transaction_tag: 'DP' | 'SETTLEMENT' | 'MANUAL';
  description: string; created_at: string;
}
export interface AppConfig {
  workshop_name: string; workshop_tagline: string; workshop_phone: string; workshop_address: string;
  logo_url_or_base64: string; currency: Currency; measurement_unit: 'cm' | 'inch'; daily_workload_capacity: number;
  auto_settle_on_completed: boolean; receipt_format: 'Thermal_58mm' | 'Thermal_80mm' | 'A5' | 'A4';
  receipt_footer_note: string; google_script_url: string; last_sync_at: string | null;
}
export interface WorkshopStore {
  customers: Customer[]; measurements: CustomerMeasurement[]; orders: Order[];
  cashflow: CashflowTransaction[]; config: AppConfig;
}
