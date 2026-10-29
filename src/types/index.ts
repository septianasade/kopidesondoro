// POS & QR Table Ordering Industry Standard Schema

export type StaffRole = 'ADMIN' | 'CASHIER' | 'KITCHEN';
export type UserRole = StaffRole | 'admin' | 'cashier' | 'kitchen' | 'owner';

export type OrderFulfillmentStatus = 
  | 'PENDING_PAYMENT' 
  | 'IN_KITCHEN' 
  | 'READY' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type FulfillmentStatus = 
  | OrderFulfillmentStatus 
  | 'pending' 
  | 'confirmed'
  | 'preparing' 
  | 'ready' 
  | 'served' 
  | 'completed'
  | 'cancelled';

export type OrderPaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'unpaid' | 'paid';

export type TableOperationalStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'available' | 'occupied' | 'reserved';

export type ShiftStatus = 'OPEN' | 'CLOSED' | 'open' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string | null;            // Nullable for PIN-only staff
  password_hash: string | null;    // Nullable for PIN-only staff
  pin_code: string;                // 6-digit unique PIN
  role: StaffRole;
  is_active: boolean;
  created_at?: string;
}

export interface Shift {
  id: string;
  business_id?: string;
  cashier_id: string;
  cashier_name: string;
  start_time?: string;
  opened_at?: string;
  end_time?: string | null;
  closed_at?: string | null;
  starting_cash?: number;
  start_cash?: number;
  ending_cash?: number | null;
  actual_cash?: number | null;
  expected_cash: number;
  difference?: number | null;
  status: ShiftStatus;
  notes?: string;
}

export type ShiftRecord = Shift;

export interface TableItem {
  id: string;
  business_id: string;
  table_number: string;
  table_label: string;
  capacity: number;
  qr_token: string;
  status: TableOperationalStatus;
  is_active: boolean;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean;
}

export interface ProductAddon {
  id: string;
  product_id: string;
  name: string;
  price: number;
  max_quantity: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  image_url: string;
  is_popular: boolean;
  is_available: boolean;
  is_active: boolean;
  variants: ProductVariant[];
  addons: ProductAddon[];
}

export interface CartItemAddon {
  addon_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  cart_item_id: string;
  product: Product;
  selected_variant?: ProductVariant;
  selected_addons: CartItemAddon[];
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string;
}

export interface OrderItemAddonSnapshot {
  id: string;
  addon_name: string;
  price: number;
  quantity: number;
}

export interface OrderItemSnapshot {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_name?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  addons: OrderItemAddonSnapshot[];
}

export interface Order {
  id: string;
  business_id: string;
  table_id: string;
  table_number: string;
  order_number: string;
  access_token: string;
  customer_name: string;
  customer_notes?: string;
  cashier_id?: string | null;
  cashier_name?: string | null;
  status?: OrderFulfillmentStatus;
  fulfillment_status?: FulfillmentStatus;
  payment_status: OrderPaymentStatus;
  payment_method?: 'CASH' | 'QRIS' | 'TRANSFER' | 'CARD' | 'cash' | 'qris' | 'transfer' | 'card';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_amount: number;
  total_amount: number;
  items: OrderItemSnapshot[];
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  business_id: string;
  order_id: string;
  payment_method: 'CASH' | 'QRIS' | 'TRANSFER' | 'CARD' | 'cash' | 'qris' | 'transfer' | 'card';
  total_bill: number;
  amount_received: number;
  change_given: number;
  payment_reference?: string;
  cashier_name: string;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address: string;
  phone: string;
  currency: string;
  tax_rate: number;
  service_rate: number;
  open_time: string;
  close_time: string;
  is_active: boolean;
}
