export type UserRole = 'owner' | 'admin' | 'cashier' | 'kitchen' | 'waiter';

export type FulfillmentStatus = 
  | 'pending'     // Pesanan baru masuk
  | 'confirmed'   // Dikonfirmasi kasir
  | 'preparing'   // Sedang dibuat dapur
  | 'ready'       // Siap disajikan
  | 'served'      // Sudah diantar ke meja
  | 'completed'   // Selesai (sudah bayar & disajikan)
  | 'cancelled';  // Dibatalkan

export type PaymentStatus = 
  | 'unpaid' 
  | 'pending' 
  | 'paid' 
  | 'refunded';

export type TableStatus = 'available' | 'occupied' | 'cleaning' | 'reserved';

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address: string;
  phone: string;
  currency: string;
  tax_rate: number;      // e.g. 11%
  service_rate: number;  // e.g. 5%
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export interface Profile {
  id: string;
  business_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface TableItem {
  id: string;
  business_id: string;
  table_number: string;
  table_label: string;
  capacity: number;
  qr_token: string;
  status: TableStatus;
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
  fulfillment_status: FulfillmentStatus;
  payment_status: PaymentStatus;
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
  payment_method: 'cash' | 'qris' | 'transfer' | 'card';
  total_bill: number;
  amount_received: number;
  change_given: number;
  payment_reference?: string;
  cashier_name: string;
  created_at: string;
}

export interface ShiftRecord {
  id: string;
  business_id: string;
  cashier_id: string;
  cashier_name: string;
  start_cash: number;
  expected_cash: number;
  actual_cash?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
  opened_at: string;
  closed_at?: string;
}
