-- ==============================================================================
-- KOPI DE SONDORO & RESTO POS — PRODUCTION DATABASE SCHEMA
-- Multi-Tenant PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Business Entity (Multi-Tenant Core)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'IDR',
    tax_rate NUMERIC(5,2) DEFAULT 11.00,       -- PPN (e.g. 11%)
    service_rate NUMERIC(5,2) DEFAULT 5.00,    -- Service charge (e.g. 5%)
    open_time TIME DEFAULT '08:00',
    close_time TIME DEFAULT '22:00',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Staff Profiles & RBAC
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- matches auth.users.id
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'cashier', 'kitchen', 'waiter')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Restaurant Tables & QR Token System
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    table_label VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 4,
    qr_token VARCHAR(100) UNIQUE NOT NULL, -- Cryptographically secure public token
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'reserved')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, table_number)
);

-- 5. Dining Sessions (Session Isolation)
CREATE TABLE IF NOT EXISTS public.dining_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    session_code VARCHAR(50) NOT NULL,
    customer_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- 6. Menu Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Coffee',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- 7. Menu Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Product Variants & Addons
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,             -- e.g. 'Regular', 'Large', 'Hot', 'Iced'
    price_adjustment NUMERIC(12,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.product_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,             -- e.g. 'Extra Espresso Shot', 'Oat Milk'
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_quantity INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. Inventory Items & Movements
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'gram', -- gram, ml, pcs, kg
    current_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_stock_alert NUMERIC(12,2) NOT NULL DEFAULT 10,
    cost_per_unit NUMERIC(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('restock', 'order_deduct', 'waste', 'audit_adjustment')),
    quantity NUMERIC(12,2) NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    dining_session_id UUID REFERENCES public.dining_sessions(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,     -- e.g. #ORD-20261029-001
    idempotency_key VARCHAR(100) UNIQUE,   -- Prevents duplicate network requests
    access_token VARCHAR(100) NOT NULL,    -- Secure customer order tracking token
    customer_name VARCHAR(100) DEFAULT 'Pelanggan',
    customer_notes TEXT,
    fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (fulfillment_status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' 
        CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    service_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Order Items (Snapshot Data Preservation)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    variant_name_snapshot VARCHAR(100),
    unit_price_snapshot NUMERIC(12,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal_snapshot NUMERIC(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_item_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    addon_name_snapshot VARCHAR(100) NOT NULL,
    price_snapshot NUMERIC(12,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

-- 12. Payments & Receipts
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'qris', 'transfer', 'card')),
    total_bill NUMERIC(12,2) NOT NULL,
    amount_received NUMERIC(12,2) NOT NULL,
    change_given NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_reference VARCHAR(100),
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Cashier Shifts & Register
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
    expected_cash NUMERIC(12,2) DEFAULT 0,
    actual_cash NUMERIC(12,2),
    difference NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM SPEED & HIGH THROUGHPUT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON public.tables(qr_token);
CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON public.orders(business_id, fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON public.orders(table_id, fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_access_token ON public.orders(access_token);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id, is_active);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Public can view active businesses, active categories, active products, and valid tables
CREATE POLICY "Public read businesses" ON public.businesses FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read product variants" ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "Public read product addons" ON public.product_addons FOR SELECT USING (TRUE);
CREATE POLICY "Public read active tables by token" ON public.tables FOR SELECT USING (is_active = TRUE);

-- Customer can read their own order via access_token
CREATE POLICY "Customer read order via access token" ON public.orders 
FOR SELECT USING (access_token = current_setting('request.headers', true)::json->>'x-order-token' OR auth.role() = 'authenticated');

-- Customer can create order (sanitized by server RPC)
CREATE POLICY "Customer insert order" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Customer insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Customer insert order item addons" ON public.order_item_addons FOR INSERT WITH CHECK (TRUE);

-- Staff authenticated access (Filtered by business_id)
CREATE POLICY "Staff all access profiles" ON public.profiles FOR ALL USING (auth.uid() = id OR business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff all access tables" ON public.tables FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff all access categories" ON public.categories FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff all access products" ON public.products FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff all access orders" ON public.orders FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff all access payments" ON public.payments FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Staff all access shifts" ON public.shifts FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));
