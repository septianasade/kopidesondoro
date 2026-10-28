import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Business, 
  TableItem, 
  Category, 
  Product, 
  Order, 
  FulfillmentStatus, 
  CartItem, 
  PaymentRecord, 
  ShiftRecord,
  UserRole
} from '../types';
import { soundNotifier } from '../utils/audio';

const STORAGE_KEY = 'kopidesondoro_pos_state_v1';

// Initial Seed Data
const initialBusiness: Business = {
  id: 'biz_sondoro_01',
  name: 'Kopi De Sondoro',
  slug: 'kopidesondoro',
  logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&q=80',
  address: 'Jl. Sondoro Raya No. 42, Sleman, D.I. Yogyakarta',
  phone: '+62 812-3456-7890',
  currency: 'Rp',
  tax_rate: 10,       // 10%
  service_rate: 5,    // 5%
  open_time: '08:00',
  close_time: '23:00',
  is_active: true,
};

const initialTables: TableItem[] = [
  { id: 'tbl_1', business_id: 'biz_sondoro_01', table_number: '01', table_label: 'Meja 01 (Indoor)', capacity: 2, qr_token: 'sndr-m01-a8f2', status: 'occupied', is_active: true },
  { id: 'tbl_2', business_id: 'biz_sondoro_01', table_number: '02', table_label: 'Meja 02 (Indoor Window)', capacity: 4, qr_token: 'sndr-m02-c9d3', status: 'occupied', is_active: true },
  { id: 'tbl_3', business_id: 'biz_sondoro_01', table_number: '03', table_label: 'Meja 03 (Sofa Corner)', capacity: 4, qr_token: 'sndr-m03-b7e1', status: 'occupied', is_active: true },
  { id: 'tbl_4', business_id: 'biz_sondoro_01', table_number: '04', table_label: 'Meja 04 (Indoor Large)', capacity: 6, qr_token: 'sndr-m04-k4j9', status: 'available', is_active: true },
  { id: 'tbl_5', business_id: 'biz_sondoro_01', table_number: '05', table_label: 'Meja 05 (Outdoor Garden)', capacity: 4, qr_token: 'sndr-m05-p2w8', status: 'available', is_active: true },
  { id: 'tbl_6', business_id: 'biz_sondoro_01', table_number: '06', table_label: 'Meja 06 (Outdoor Gazebo)', capacity: 8, qr_token: 'sndr-m06-x7q5', status: 'available', is_active: true },
];

const initialCategories: Category[] = [
  { id: 'cat_coffee', business_id: 'biz_sondoro_01', name: 'Kopi Signature', slug: 'kopi-signature', icon: 'Coffee', sort_order: 1, is_active: true },
  { id: 'cat_manual', business_id: 'biz_sondoro_01', name: 'Manual Brew', slug: 'manual-brew', icon: 'Flame', sort_order: 2, is_active: true },
  { id: 'cat_noncoffee', business_id: 'biz_sondoro_01', name: 'Non-Kopi & Teh', slug: 'non-kopi', icon: 'CupSoda', sort_order: 3, is_active: true },
  { id: 'cat_food', business_id: 'biz_sondoro_01', name: 'Makanan Utama', slug: 'makanan-utama', icon: 'Utensils', sort_order: 4, is_active: true },
  { id: 'cat_snack', business_id: 'biz_sondoro_01', name: 'Camilan & Roti', slug: 'camilan', icon: 'Cookie', sort_order: 5, is_active: true },
];

const initialProducts: Product[] = [
  {
    id: 'prod_1',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_coffee',
    name: 'Es Kopi Susu Sondoro',
    slug: 'es-kopi-susu-sondoro',
    description: 'Espresso blend khas Sondoro dengan susu segar kental dan gula aren organik resep rahasia.',
    base_price: 22000,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=80',
    is_popular: true,
    is_available: true,
    is_active: true,
    variants: [
      { id: 'v_1_reg', product_id: 'prod_1', name: 'Regular (Cup)', price_adjustment: 0, is_default: true },
      { id: 'v_1_dbl', product_id: 'prod_1', name: 'Double Shot Espresso', price_adjustment: 4000, is_default: false },
      { id: 'v_1_lit', product_id: 'prod_1', name: 'Kemasan Botol 1 Liter', price_adjustment: 55000, is_default: false },
    ],
    addons: [
      { id: 'a_1_grass', product_id: 'prod_1', name: 'Grass Jelly (Cincau Hitam)', price: 3000, max_quantity: 3, is_active: true },
      { id: 'a_1_oat', product_id: 'prod_1', name: 'Upgrade Oat Milk', price: 6000, max_quantity: 1, is_active: true },
      { id: 'a_1_shot', product_id: 'prod_1', name: 'Extra Shot Espresso', price: 5000, max_quantity: 3, is_active: true },
    ],
  },
  {
    id: 'prod_2',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_coffee',
    name: 'Spanish Latte Caramel',
    slug: 'spanish-latte-caramel',
    description: 'Espresso lembut berpadu susu kental manis karamel premium dengan foam halus creamy.',
    base_price: 26000,
    image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&q=80',
    is_popular: true,
    is_available: true,
    is_active: true,
    variants: [
      { id: 'v_2_iced', product_id: 'prod_2', name: 'Iced Dingin', price_adjustment: 0, is_default: true },
      { id: 'v_2_hot', product_id: 'prod_2', name: 'Hot Hangat', price_adjustment: 0, is_default: false },
    ],
    addons: [
      { id: 'a_2_whipped', product_id: 'prod_2', name: 'Whipped Cream', price: 4000, max_quantity: 2, is_active: true },
    ],
  },
  {
    id: 'prod_3',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_manual',
    name: 'V60 Japanese Iced Drip',
    slug: 'v60-japanese-iced',
    description: 'Seduhan manual V60 langsung menetes di atas es batu. Rasa floral, fruity, dan segar maksimal.',
    base_price: 28000,
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80',
    is_popular: false,
    is_available: true,
    is_active: true,
    variants: [
      { id: 'v_3_bajawa', product_id: 'prod_3', name: 'Beans Flores Bajawa', price_adjustment: 0, is_default: true },
      { id: 'v_3_gayo', product_id: 'prod_3', name: 'Beans Gayo Wine Anaerobic', price_adjustment: 6000, is_default: false },
    ],
    addons: [],
  },
  {
    id: 'prod_4',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_noncoffee',
    name: 'Matcha Uji Latte Artisanal',
    slug: 'matcha-uji-latte',
    description: 'Bubuk murni Matcha Uji Jepang kualitas ceremonial grade dikocok dengan susu dan gula tebu.',
    base_price: 27000,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&q=80',
    is_popular: true,
    is_available: true,
    is_active: true,
    variants: [
      { id: 'v_4_iced', product_id: 'prod_4', name: 'Iced Dingin', price_adjustment: 0, is_default: true },
      { id: 'v_4_hot', product_id: 'prod_4', name: 'Hot Hangat', price_adjustment: 0, is_default: false },
    ],
    addons: [
      { id: 'a_4_oat', product_id: 'prod_4', name: 'Upgrade Oat Milk', price: 6000, max_quantity: 1, is_active: true },
    ],
  },
  {
    id: 'prod_5',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_food',
    name: 'Nasi Goreng Kecombrang Sondoro',
    slug: 'nasi-goreng-kecombrang',
    description: 'Nasi goreng harum aroma bunga kecombrang segar dengan suwiran ayam gurih, acar, dan kerupuk.',
    base_price: 34000,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
    is_popular: true,
    is_available: true,
    is_active: true,
    variants: [
      { id: 'v_5_med', product_id: 'prod_5', name: 'Pedas Sedang', price_adjustment: 0, is_default: true },
      { id: 'v_5_hot', product_id: 'prod_5', name: 'Pedas Nendang', price_adjustment: 1000, is_default: false },
      { id: 'v_5_mild', product_id: 'prod_5', name: 'Tidak Pedas', price_adjustment: 0, is_default: false },
    ],
    addons: [
      { id: 'a_5_egg', product_id: 'prod_5', name: 'Telur Ceplok Setengah Matang', price: 5000, max_quantity: 2, is_active: true },
      { id: 'a_5_ayam', product_id: 'prod_5', name: 'Ekstra Suwiran Ayam', price: 8000, max_quantity: 2, is_active: true },
    ],
  },
  {
    id: 'prod_6',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_food',
    name: 'Mie Ayam Rica Jamur Kancing',
    slug: 'mie-ayam-rica-jamur',
    description: 'Mie kenyal buatan sendiri disajikan dengan bumbu rica pedas gurih, jamur kancing, dan kuah kaldu.',
    base_price: 29000,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80',
    is_popular: false,
    is_available: true,
    is_active: true,
    variants: [
      { id: 'v_6_kuah', product_id: 'prod_6', name: 'Kuah Terpisah', price_adjustment: 0, is_default: true },
      { id: 'v_6_kering', product_id: 'prod_6', name: 'Mie Kering / Yamien', price_adjustment: 0, is_default: false },
    ],
    addons: [
      { id: 'a_6_pangsit', product_id: 'prod_6', name: 'Pangsit Goreng Crispy (2 pcs)', price: 6000, max_quantity: 3, is_active: true },
    ],
  },
  {
    id: 'prod_7',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_snack',
    name: 'Pisang Goreng Madu Karamel Wijen',
    slug: 'pisang-goreng-madu',
    description: 'Pisang kepok manis digoreng renyah dengan balutan madu murni dan taburan wijen sangrai gurih.',
    base_price: 22000,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80',
    is_popular: true,
    is_available: true,
    is_active: true,
    variants: [],
    addons: [
      { id: 'a_7_cheese', product_id: 'prod_7', name: 'Taburan Keju Cheddar', price: 4000, max_quantity: 1, is_active: true },
      { id: 'a_7_choco', product_id: 'prod_7', name: 'Cokelat Meises', price: 3000, max_quantity: 1, is_active: true },
    ],
  },
  {
    id: 'prod_8',
    business_id: 'biz_sondoro_01',
    category_id: 'cat_snack',
    name: 'Croissant Butter Perancis',
    slug: 'croissant-butter',
    description: 'Pastry renyah berlapis dengan aroma mentega Perancis murni, dihangatkan sebelum disajikan.',
    base_price: 24000,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80',
    is_popular: false,
    is_available: true,
    is_active: true,
    variants: [],
    addons: [],
  },
];

const initialOrders: Order[] = [
  {
    id: 'ord_101',
    business_id: 'biz_sondoro_01',
    table_id: 'tbl_2',
    table_number: '02',
    order_number: 'ORD-101',
    access_token: 'tok_ord_101_xyz',
    customer_name: 'Budi Santoso',
    customer_notes: 'Kopi jangan terlalu manis ya mas.',
    fulfillment_status: 'pending',
    payment_status: 'unpaid',
    subtotal: 56000,
    discount_amount: 0,
    tax_amount: 5600,
    service_amount: 2800,
    total_amount: 64400,
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item_101_1',
        order_id: 'ord_101',
        product_id: 'prod_1',
        product_name: 'Es Kopi Susu Sondoro',
        variant_name: 'Regular (Cup)',
        unit_price: 22000,
        quantity: 1,
        subtotal: 25000,
        notes: 'Less sugar',
        addons: [{ id: 'add_1', addon_name: 'Grass Jelly (Cincau Hitam)', price: 3000, quantity: 1 }],
      },
      {
        id: 'item_101_2',
        order_id: 'ord_101',
        product_id: 'prod_5',
        product_name: 'Nasi Goreng Kecombrang Sondoro',
        variant_name: 'Pedas Sedang',
        unit_price: 34000,
        quantity: 1,
        subtotal: 39000,
        addons: [{ id: 'add_2', addon_name: 'Telur Ceplok Setengah Matang', price: 5000, quantity: 1 }],
      },
    ],
  },
  {
    id: 'ord_102',
    business_id: 'biz_sondoro_01',
    table_id: 'tbl_1',
    table_number: '01',
    order_number: 'ORD-102',
    access_token: 'tok_ord_102_abc',
    customer_name: 'Siti Rahma',
    fulfillment_status: 'preparing',
    payment_status: 'paid',
    subtotal: 50000,
    discount_amount: 0,
    tax_amount: 5000,
    service_amount: 2500,
    total_amount: 57500,
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item_102_1',
        order_id: 'ord_102',
        product_id: 'prod_2',
        product_name: 'Spanish Latte Caramel',
        variant_name: 'Iced Dingin',
        unit_price: 26000,
        quantity: 1,
        subtotal: 26000,
        addons: [],
      },
      {
        id: 'item_102_2',
        order_id: 'ord_102',
        product_id: 'prod_8',
        product_name: 'Croissant Butter Perancis',
        unit_price: 24000,
        quantity: 1,
        subtotal: 24000,
        notes: 'Minta dipanaskan garing',
        addons: [],
      },
    ],
  },
  {
    id: 'ord_103',
    business_id: 'biz_sondoro_01',
    table_id: 'tbl_3',
    table_number: '03',
    order_number: 'ORD-103',
    access_token: 'tok_ord_103_mno',
    customer_name: 'Dimas Kurniawan',
    fulfillment_status: 'ready',
    payment_status: 'paid',
    subtotal: 28000,
    discount_amount: 0,
    tax_amount: 2800,
    service_amount: 1400,
    total_amount: 32200,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item_103_1',
        order_id: 'ord_103',
        product_id: 'prod_3',
        product_name: 'V60 Japanese Iced Drip',
        variant_name: 'Beans Flores Bajawa',
        unit_price: 28000,
        quantity: 1,
        subtotal: 28000,
        addons: [],
      },
    ],
  },
];

interface StoreContextType {
  business: Business;
  tables: TableItem[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  payments: PaymentRecord[];
  currentShift: ShiftRecord | null;
  activeRole: UserRole;
  currentTable: TableItem | null;
  cart: CartItem[];
  activeView: 'customer' | 'pos' | 'kds' | 'admin' | 'receipt_preview';
  activeReceiptOrder: Order | null;
  setActiveRole: (role: UserRole) => void;
  setActiveView: (view: 'customer' | 'pos' | 'kds' | 'admin' | 'receipt_preview') => void;
  setCurrentTable: (table: TableItem | null) => void;
  showReceiptForOrder: (order: Order) => void;
  
  // Cart Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  
  // Order Actions
  submitCustomerOrder: (tableId: string, customerName: string, customerNotes?: string) => Promise<Order>;
  submitPosOrder: (tableId: string, customerName: string, items: CartItem[], customerNotes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: FulfillmentStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  
  // Payment Actions
  processPayment: (orderId: string, method: 'cash' | 'qris' | 'transfer' | 'card', amountReceived: number, cashierName?: string) => PaymentRecord;
  
  // Shift Actions
  openShift: (startCash: number, cashierName: string) => void;
  closeShift: (actualCash: number, notes?: string) => void;

  // Management Actions
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  saveTable: (table: TableItem) => void;
  deleteTable: (tableId: string) => void;
  regenerateTableQR: (tableId: string) => void;
  updateBusinessSettings: (settings: Partial<Business>) => void;
  resetToDefaultSeed: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or fallback to seeds
  const [business, setBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).business : initialBusiness;
  });

  const [tables, setTables] = useState<TableItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).tables : initialTables;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).categories : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).products : initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).orders : initialOrders;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).payments : [];
  });

  const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).currentShift : {
      id: 'shift_init_1',
      business_id: 'biz_sondoro_01',
      cashier_id: 'usr_cashier_1',
      cashier_name: 'Kasir Utama',
      start_cash: 500000, // Rp 500.000 modal awal
      expected_cash: 500000,
      status: 'open',
      opened_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    };
  });

  // UI state
  const [activeRole, setActiveRole] = useState<UserRole>('cashier');
  const [activeView, setActiveView] = useState<'customer' | 'pos' | 'kds' | 'admin' | 'receipt_preview'>('customer');
  const [currentTable, setCurrentTable] = useState<TableItem | null>(tables[1]); // Default to Meja 02
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    const state = {
      business,
      tables,
      categories,
      products,
      orders,
      payments,
      currentShift,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota exceeded fallback
    }
  }, [business, tables, categories, products, orders, payments, currentShift]);

  // Cart operations
  const addToCart = (newItem: CartItem) => {
    soundNotifier.playSuccessPing();
    setCart((prev) => {
      // Check if identical item already exists (same product, variant, addons, notes)
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === newItem.product.id &&
          it.selected_variant?.id === newItem.selected_variant?.id &&
          it.notes === newItem.notes &&
          JSON.stringify(it.selected_addons) === JSON.stringify(newItem.selected_addons)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          subtotal: existing.unit_price * newQty,
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((it) => it.cart_item_id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.cart_item_id === cartItemId) {
            const nextQty = it.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...it,
              quantity: nextQty,
              subtotal: it.unit_price * nextQty,
            };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  // Server-side calculated order creation
  const submitCustomerOrder = async (
    tableId: string,
    customerName: string,
    customerNotes?: string
  ): Promise<Order> => {
    const targetTable = tables.find((t) => t.id === tableId) || tables[0];

    // Calculate verified prices from catalog (never trust browser total)
    let verifiedSubtotal = 0;
    const orderItems = cart.map((cItem, idx) => {
      const liveProduct = products.find((p) => p.id === cItem.product.id) || cItem.product;
      let unitPrice = liveProduct.base_price;
      if (cItem.selected_variant) {
        unitPrice += cItem.selected_variant.price_adjustment;
      }
      const addonSnapshots = cItem.selected_addons.map((a, aIdx) => {
        return {
          id: `ord_addon_${Date.now()}_${aIdx}`,
          addon_name: a.name,
          price: a.price,
          quantity: a.quantity,
        };
      });
      const addonTotal = addonSnapshots.reduce((acc, a) => acc + a.price * a.quantity, 0);
      const totalItemUnit = unitPrice + addonTotal;
      const itemSubtotal = totalItemUnit * cItem.quantity;
      verifiedSubtotal += itemSubtotal;

      return {
        id: `item_${Date.now()}_${idx}`,
        order_id: '',
        product_id: liveProduct.id,
        product_name: liveProduct.name,
        variant_name: cItem.selected_variant?.name,
        unit_price: totalItemUnit,
        quantity: cItem.quantity,
        subtotal: itemSubtotal,
        notes: cItem.notes,
        addons: addonSnapshots,
      };
    });

    const taxAmount = Math.round((verifiedSubtotal * business.tax_rate) / 100);
    const serviceAmount = Math.round((verifiedSubtotal * business.service_rate) / 100);
    const totalAmount = verifiedSubtotal + taxAmount + serviceAmount;

    const newOrderNumber = `ORD-${Date.now().toString().slice(-4)}`;
    const newOrderId = `ord_${Date.now()}`;
    const newAccessToken = `tok_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder: Order = {
      id: newOrderId,
      business_id: business.id,
      table_id: targetTable.id,
      table_number: targetTable.table_number,
      order_number: newOrderNumber,
      access_token: newAccessToken,
      customer_name: customerName.trim() || 'Pelanggan Meja ' + targetTable.table_number,
      customer_notes: customerNotes,
      fulfillment_status: 'pending',
      payment_status: 'unpaid',
      subtotal: verifiedSubtotal,
      discount_amount: 0,
      tax_amount: taxAmount,
      service_amount: serviceAmount,
      total_amount: totalAmount,
      items: orderItems.map((i) => ({ ...i, order_id: newOrderId })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update state & notify
    setOrders((prev) => [newOrder, ...prev]);
    setTables((prev) =>
      prev.map((t) => (t.id === targetTable.id ? { ...t, status: 'occupied' } : t))
    );
    clearCart();
    soundNotifier.playNewOrderChime();

    return newOrder;
  };

  const submitPosOrder = async (
    tableId: string,
    customerName: string,
    items: CartItem[],
    customerNotes?: string
  ): Promise<Order> => {
    const targetTable = tables.find((t) => t.id === tableId) || tables[0];
    let verifiedSubtotal = 0;
    const orderItems = items.map((cItem, idx) => {
      const liveProduct = products.find((p) => p.id === cItem.product.id) || cItem.product;
      let unitPrice = liveProduct.base_price;
      if (cItem.selected_variant) {
        unitPrice += cItem.selected_variant.price_adjustment;
      }
      const addonSnapshots = cItem.selected_addons.map((a, aIdx) => ({
        id: `ord_addon_${Date.now()}_${aIdx}`,
        addon_name: a.name,
        price: a.price,
        quantity: a.quantity,
      }));
      const addonTotal = addonSnapshots.reduce((acc, a) => acc + a.price * a.quantity, 0);
      const totalItemUnit = unitPrice + addonTotal;
      const itemSubtotal = totalItemUnit * cItem.quantity;
      verifiedSubtotal += itemSubtotal;

      return {
        id: `item_${Date.now()}_${idx}`,
        order_id: '',
        product_id: liveProduct.id,
        product_name: liveProduct.name,
        variant_name: cItem.selected_variant?.name,
        unit_price: totalItemUnit,
        quantity: cItem.quantity,
        subtotal: itemSubtotal,
        notes: cItem.notes,
        addons: addonSnapshots,
      };
    });

    const taxAmount = Math.round((verifiedSubtotal * business.tax_rate) / 100);
    const serviceAmount = Math.round((verifiedSubtotal * business.service_rate) / 100);
    const totalAmount = verifiedSubtotal + taxAmount + serviceAmount;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      business_id: business.id,
      table_id: targetTable.id,
      table_number: targetTable.table_number,
      order_number: `ORD-${Date.now().toString().slice(-4)}`,
      access_token: `tok_${Math.random().toString(36).substring(2, 10)}`,
      customer_name: customerName.trim() || 'Pesanan Kasir Meja ' + targetTable.table_number,
      customer_notes: customerNotes,
      fulfillment_status: 'confirmed',
      payment_status: 'unpaid',
      subtotal: verifiedSubtotal,
      discount_amount: 0,
      tax_amount: taxAmount,
      service_amount: serviceAmount,
      total_amount: totalAmount,
      items: orderItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setTables((prev) =>
      prev.map((t) => (t.id === targetTable.id ? { ...t, status: 'occupied' } : t))
    );
    soundNotifier.playNewOrderChime();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: FulfillmentStatus) => {
    soundNotifier.playSuccessPing();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            fulfillment_status: status,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            fulfillment_status: 'cancelled',
            customer_notes: reason ? `${ord.customer_notes || ''} [Batal: ${reason}]` : ord.customer_notes,
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  const processPayment = (
    orderId: string,
    method: 'cash' | 'qris' | 'transfer' | 'card',
    amountReceived: number,
    cashierName: string = 'Kasir'
  ): PaymentRecord => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) throw new Error('Order not found');

    const changeGiven = Math.max(0, amountReceived - targetOrder.total_amount);

    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      business_id: business.id,
      order_id: targetOrder.id,
      payment_method: method,
      total_bill: targetOrder.total_amount,
      amount_received: amountReceived,
      change_given: changeGiven,
      payment_reference: method === 'qris' ? `QRIS-${Date.now().toString().slice(-6)}` : undefined,
      cashier_name: cashierName,
      created_at: new Date().toISOString(),
    };

    // Mark order paid
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: 'paid', updated_at: new Date().toISOString() } : o))
    );

    setPayments((prev) => [payment, ...prev]);

    // Update shift drawer if cash
    if (method === 'cash' && currentShift && currentShift.status === 'open') {
      setCurrentShift((prev) =>
        prev
          ? {
              ...prev,
              expected_cash: prev.expected_cash + targetOrder.total_amount,
            }
          : null
      );
    }

    soundNotifier.playSuccessPing();
    return payment;
  };

  const openShift = (startCash: number, cashierName: string) => {
    const newShift: ShiftRecord = {
      id: `shift_${Date.now()}`,
      business_id: business.id,
      cashier_id: 'usr_cashier_1',
      cashier_name: cashierName,
      start_cash: startCash,
      expected_cash: startCash,
      status: 'open',
      opened_at: new Date().toISOString(),
    };
    setCurrentShift(newShift);
  };

  const closeShift = (actualCash: number, notes?: string) => {
    if (!currentShift) return;
    const diff = actualCash - currentShift.expected_cash;
    setCurrentShift((prev) =>
      prev
        ? {
            ...prev,
            status: 'closed',
            actual_cash: actualCash,
            difference: diff,
            notes,
            closed_at: new Date().toISOString(),
          }
        : null
    );
  };

  const saveProduct = (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [product, ...prev];
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const saveCategory = (category: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = category;
        return updated;
      }
      return [...prev, category];
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const saveTable = (table: TableItem) => {
    setTables((prev) => {
      const idx = prev.findIndex((t) => t.id === table.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = table;
        return updated;
      }
      return [...prev, table];
    });
  };

  const deleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
  };

  const regenerateTableQR = (tableId: string) => {
    const newToken = `sndr-m${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(36).slice(-4)}`;
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, qr_token: newToken } : t))
    );
  };

  const updateBusinessSettings = (settings: Partial<Business>) => {
    setBusiness((prev) => ({ ...prev, ...settings }));
  };

  const resetToDefaultSeed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBusiness(initialBusiness);
    setTables(initialTables);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setOrders(initialOrders);
    setPayments([]);
  };

  const showReceiptForOrder = (order: Order) => {
    setActiveReceiptOrder(order);
    setActiveView('receipt_preview');
  };

  return (
    <StoreContext.Provider
      value={{
        business,
        tables,
        categories,
        products,
        orders,
        payments,
        currentShift,
        activeRole,
        currentTable,
        cart,
        activeView,
        activeReceiptOrder,
        setActiveRole,
        setActiveView,
        setCurrentTable,
        showReceiptForOrder,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        submitCustomerOrder,
        submitPosOrder,
        updateOrderStatus,
        cancelOrder,
        processPayment,
        openShift,
        closeShift,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveTable,
        deleteTable,
        regenerateTableQR,
        updateBusinessSettings,
        resetToDefaultSeed,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
