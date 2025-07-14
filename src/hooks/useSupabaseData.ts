import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  category_id?: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

export interface DatabaseAddonGroup {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  allow_multiple: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAddon {
  id: string;
  name: string;
  price: number;
  addon_group_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  addon_groups?: {
    id: string;
    name: string;
    is_required: boolean;
    allow_multiple: boolean;
  };
}

export interface MenuAddonGroup {
  id: string;
  menu_item_id: string;
  addon_group_id: string;
  created_at: string;
}

export interface CategoryAddonGroup {
  id: string;
  category_id: string;
  addon_group_id: string;
  created_at: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptSettings {
  id: string;
  show_logo: boolean;
  show_shop_info: boolean;
  show_tax_id: boolean;
  show_date_time: boolean;
  show_order_number: boolean;
  show_item_details: boolean;
  show_total: boolean;
  show_payment_method: boolean;
  show_customer_info: boolean;
  footer_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMember {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMembershipSetting {
  id: string;
  tier: 'silver' | 'gold' | 'platinum';
  discount_percentage: number;
  points_per_baht: number;
  points_to_redeem: number;
  redeem_value: number;
  minimum_spend_for_upgrade: number;
  created_at: string;
  updated_at: string;
}

export interface DatabasePointTransaction {
  id: string;
  member_id: string;
  points_change: number;
  transaction_type: 'earn' | 'redeem' | 'adjust' | 'expire';
  description?: string;
  order_id?: string;
  created_at: string;
}

export interface DatabaseIngredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum_stock: number;
  cost_per_unit: number;
  supplier?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expiry_date?: string;
  reorder_point?: number | null;
}

export interface DatabaseStockMovement {
  id: string;
  ingredient_id: string;
  movement_type: 'purchase' | 'adjustment' | 'usage' | 'waste';
  quantity_change: number;
  cost_per_unit?: number;
  reference_number?: string;
  notes?: string;
  created_by: string;
  order_id?: string;
  created_at: string;
  ingredients?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface DatabaseMenuIngredient {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity_needed: number;
  created_at: string;
  ingredients?: {
    id: string;
    name: string;
    unit: string;
    cost_per_unit: number;
  };
}

export interface DatabaseShift {
  id: string;
  staff_id?: string;
  shift_start: string;
  shift_end?: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  cash_difference?: number;
  status: 'active' | 'closed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSupplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_id?: string;
  payment_terms: number;
  credit_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabasePurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'pending' | 'sent' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  suppliers?: {
    id: string;
    name: string;
  };
}

export interface DatabasePurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  ingredient_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  expiry_date?: string;
  batch_number?: string;
  created_at: string;
  ingredients?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface DatabaseTableArea {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface DatabaseTable {
  id: string;
  table_number: string;
  area_id?: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position_x: number;
  position_y: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  table_areas?: {
    id: string;
    name: string;
  };
}

export interface DatabaseTableReservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  tables?: {
    id: string;
    table_number: string;
  };
}

export interface DatabaseCreditCustomer {
  id: string;
  member_id: string;
  credit_limit: number;
  current_balance: number;
  payment_terms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface DatabaseCreditSale {
  id: string;
  order_id: string;
  credit_customer_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_amount: number;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabasePriceSchedule {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDeliveryDriver {
  id: string;
  name: string;
  phone: string;
  license_number?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  status: 'available' | 'busy' | 'offline';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDeliveryAssignment {
  id: string;
  order_id: string;
  driver_id: string;
  pickup_time?: string;
  delivery_time?: string;
  estimated_delivery_time?: string;
  delivery_address: string;
  delivery_fee: number;
  status: 'assigned' | 'picked_up' | 'on_route' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  delivery_drivers?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface DatabaseProductReservation {
  id: string;
  customer_id: string;
  menu_item_id: string;
  quantity: number;
  reservation_date: string;
  pickup_time?: string;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  deposit_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  members?: {
    id: string;
    name: string;
    phone: string;
  };
  menu_items?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface DatabaseSMSSettings {
  id: string;
  provider: string;
  api_key?: string;
  sender_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLanguageSettings {
  id: string;
  language_code: string;
  language_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DatabaseTranslation {
  id: string;
  language_code: string;
  translation_key: string;
  translation_value: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAPIIntegration {
  id: string;
  name: string;
  type: 'accounting' | 'erp' | 'delivery' | 'payment';
  endpoint_url?: string;
  api_key?: string;
  api_secret?: string;
  config: any;
  is_active: boolean;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [addonGroups, setAddonGroups] = useState<DatabaseAddonGroup[]>([]);
  const [addons, setAddons] = useState<DatabaseAddon[]>([]);
  const [menuAddonGroups, setMenuAddonGroups] = useState<MenuAddonGroup[]>([]);
  const [categoryAddonGroups, setCategoryAddonGroups] = useState<CategoryAddonGroup[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
  const [members, setMembers] = useState<DatabaseMember[]>([]);
  const [membershipSettings, setMembershipSettings] = useState<DatabaseMembershipSetting[]>([]);
  const [pointTransactions, setPointTransactions] = useState<DatabasePointTransaction[]>([]);
  const [ingredients, setIngredients] = useState<DatabaseIngredient[]>([]);
  const [stockMovements, setStockMovements] = useState<DatabaseStockMovement[]>([]);
  const [menuIngredients, setMenuIngredients] = useState<DatabaseMenuIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New state for extended functionality
  const [shifts, setShifts] = useState<DatabaseShift[]>([]);
  const [suppliers, setSuppliers] = useState<DatabaseSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<DatabasePurchaseOrder[]>([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<DatabasePurchaseOrderItem[]>([]);
  const [tableAreas, setTableAreas] = useState<DatabaseTableArea[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [tableReservations, setTableReservations] = useState<DatabaseTableReservation[]>([]);
  const [creditCustomers, setCreditCustomers] = useState<DatabaseCreditCustomer[]>([]);
  const [creditSales, setCreditSales] = useState<DatabaseCreditSale[]>([]);
  const [priceSchedules, setPriceSchedules] = useState<DatabasePriceSchedule[]>([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DatabaseDeliveryDriver[]>([]);
  const [deliveryAssignments, setDeliveryAssignments] = useState<DatabaseDeliveryAssignment[]>([]);
  const [productReservations, setProductReservations] = useState<DatabaseProductReservation[]>([]);
  const [smsSettings, setSmsSettings] = useState<DatabaseSMSSettings | null>(null);
  const [languageSettings, setLanguageSettings] = useState<DatabaseLanguageSettings[]>([]);
  const [translations, setTranslations] = useState<DatabaseTranslation[]>([]);
  const [apiIntegrations, setApiIntegrations] = useState<DatabaseAPIIntegration[]>([]);

  const fetchShopSettings = async () => {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่าร้านได้', variant: 'destructive' });
      return;
    }
    setShopSettings(data);
  };

  const fetchReceiptSettings = async () => {
    const { data, error } = await supabase
      .from('receipt_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่าใบเสร็จได้', variant: 'destructive' });
      return;
    }
    setReceiptSettings(data);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดหมวดหมู่ได้', variant: 'destructive' });
      return;
    }
    setCategories(data || []);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        categories!menu_items_category_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดเมนูได้', variant: 'destructive' });
      return;
    }
    setMenuItems(data || []);
  };

  const fetchAddonGroups = async () => {
    const { data, error } = await supabase
      .from('addon_groups')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดกลุ่ม Add-on ได้', variant: 'destructive' });
      return;
    }
    setAddonGroups(data || []);
  };

  const fetchAddons = async () => {
    const { data, error } = await supabase
      .from('addons')
      .select(`
        *,
        addon_groups!addons_addon_group_id_fkey (
          id,
          name,
          is_required,
          allow_multiple
        )
      `)
      .order('sort_order');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลด Add-on ได้', variant: 'destructive' });
      return;
    }
    setAddons(data || []);
  };

  const fetchMenuAddonGroups = async () => {
    const { data, error } = await supabase
      .from('menu_addon_groups')
      .select('*');
    
    if (error) {
      console.error('Error fetching menu addon groups:', error);
      return;
    }
    setMenuAddonGroups(data || []);
  };

  const fetchCategoryAddonGroups = async () => {
    const { data, error } = await supabase
      .from('category_addon_groups')
      .select('*');
    
    if (error) {
      console.error('Error fetching category addon groups:', error);
      return;
    }
    setCategoryAddonGroups(data || []);
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
      return;
    }
    
    const typedMembers = (data || []).map(member => ({
      ...member,
      tier: member.tier as 'silver' | 'gold' | 'platinum'
    }));
    
    setMembers(typedMembers);
  };

  const fetchMembershipSettings = async () => {
    const { data, error } = await supabase
      .from('membership_settings')
      .select('*')
      .order('tier');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่าสมาชิกได้', variant: 'destructive' });
      return;
    }
    
    const typedSettings = (data || []).map(setting => ({
      ...setting,
      tier: setting.tier as 'silver' | 'gold' | 'platinum'
    }));
    
    setMembershipSettings(typedSettings);
  };

  const fetchPointTransactions = async () => {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติแต้มได้', variant: 'destructive' });
      return;
    }
    
    const typedTransactions = (data || []).map(transaction => ({
      ...transaction,
      transaction_type: transaction.transaction_type as 'earn' | 'redeem' | 'adjust' | 'expire'
    }));
    
    setPointTransactions(typedTransactions);
  };

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดวัตถุดิบได้', variant: 'destructive' });
      return;
    }
    setIngredients(data || []);
  };

  const fetchStockMovements = async () => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        ingredients!stock_movements_ingredient_id_fkey (
          id,
          name,
          unit
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการเคลื่อนไหวสต็อกได้', variant: 'destructive' });
      return;
    }
    
    const typedMovements = (data || []).map(movement => ({
      ...movement,
      movement_type: movement.movement_type as 'purchase' | 'adjustment' | 'usage' | 'waste'
    }));
    
    setStockMovements(typedMovements);
  };

  const fetchMenuIngredients = async () => {
    const { data, error } = await supabase
      .from('menu_ingredients')
      .select(`
        *,
        ingredients!menu_ingredients_ingredient_id_fkey (
          id,
          name,
          unit,
          cost_per_unit
        )
      `);
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดสูตรเมนูได้', variant: 'destructive' });
      return;
    }
    setMenuIngredients(data || []);
  };

  // New fetch functions
  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลเวรทำงานได้', variant: 'destructive' });
      return;
    }
    
    const typedShifts = (data || []).map(shift => ({
      ...shift,
      status: shift.status as 'active' | 'closed'
    }));
    
    setShifts(typedShifts);
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลผู้จำหน่ายได้', variant: 'destructive' });
      return;
    }
    setSuppliers(data || []);
  };

  const fetchPurchaseOrders = async () => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers!purchase_orders_supplier_id_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดใบสั่งซื้อได้', variant: 'destructive' });
      return;
    }
    
    const typedOrders = (data || []).map(order => ({
      ...order,
      status: order.status as 'pending' | 'sent' | 'received' | 'cancelled'
    }));
    
    setPurchaseOrders(typedOrders);
  };

  const fetchTableAreas = async () => {
    const { data, error } = await supabase
      .from('table_areas')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลพื้นที่โต๊ะได้', variant: 'destructive' });
      return;
    }
    setTableAreas(data || []);
  };

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select(`
        *,
        table_areas!tables_area_id_fkey (
          id,
          name
        )
      `)
      .order('table_number');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลโต๊ะได้', variant: 'destructive' });
      return;
    }
    
    const typedTables = (data || []).map(table => ({
      ...table,
      status: table.status as 'available' | 'occupied' | 'reserved' | 'maintenance'
    }));
    
    setTables(typedTables);
  };

  const fetchTableReservations = async () => {
    const { data, error } = await supabase
      .from('table_reservations')
      .select(`
        *,
        tables!table_reservations_table_id_fkey (
          id,
          table_number
        )
      `)
      .order('reservation_date', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการจองโต๊ะได้', variant: 'destructive' });
      return;
    }
    
    const typedReservations = (data || []).map(reservation => ({
      ...reservation,
      status: reservation.status as 'confirmed' | 'cancelled' | 'completed' | 'no_show'
    }));
    
    setTableReservations(typedReservations);
  };

  const fetchCreditCustomers = async () => {
    const { data, error } = await supabase
      .from('credit_customers')
      .select(`
        *,
        members!credit_customers_member_id_fkey (
          id,
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดลูกค้าเครดิตได้', variant: 'destructive' });
      return;
    }
    setCreditCustomers(data || []);
  };

  const fetchCreditSales = async () => {
    const { data, error } = await supabase
      .from('credit_sales')
      .select('*')
      .order('due_date', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการขายเครดิตได้', variant: 'destructive' });
      return;
    }
    
    const typedSales = (data || []).map(sale => ({
      ...sale,
      status: sale.status as 'pending' | 'paid' | 'overdue' | 'cancelled'
    }));
    
    setCreditSales(typedSales);
  };

  const fetchPriceSchedules = async () => {
    const { data, error } = await supabase
      .from('price_schedules')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดตารางราคาได้', variant: 'destructive' });
      return;
    }
    setPriceSchedules(data || []);
  };

  const fetchDeliveryDrivers = async () => {
    const { data, error } = await supabase
      .from('delivery_drivers')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลคนส่งได้', variant: 'destructive' });
      return;
    }
    
    const typedDrivers = (data || []).map(driver => ({
      ...driver,
      status: driver.status as 'available' | 'busy' | 'offline'
    }));
    
    setDeliveryDrivers(typedDrivers);
  };

  const fetchDeliveryAssignments = async () => {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        delivery_drivers!delivery_assignments_driver_id_fkey (
          id,
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการมอบหมายงานส่งได้', variant: 'destructive' });
      return;
    }
    
    const typedAssignments = (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as 'assigned' | 'picked_up' | 'on_route' | 'delivered' | 'cancelled'
    }));
    
    setDeliveryAssignments(typedAssignments);
  };

  const fetchProductReservations = async () => {
    const { data, error } = await supabase
      .from('product_reservations')
      .select(`
        *,
        members!product_reservations_customer_id_fkey (
          id,
          name,
          phone
        ),
        menu_items!product_reservations_menu_item_id_fkey (
          id,
          name,
          price
        )
      `)
      .order('reservation_date', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการจองสินค้าได้', variant: 'destructive' });
      return;
    }
    
    const typedReservations = (data || []).map(reservation => ({
      ...reservation,
      status: reservation.status as 'active' | 'fulfilled' | 'cancelled' | 'expired'
    }));
    
    setProductReservations(typedReservations);
  };

  const fetchSMSSettings = async () => {
    const { data, error } = await supabase
      .from('sms_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่า SMS ได้', variant: 'destructive' });
      return;
    }
    setSmsSettings(data);
  };

  const fetchLanguageSettings = async () => {
    const { data, error } = await supabase
      .from('language_settings')
      .select('*')
      .order('language_name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่าภาษาได้', variant: 'destructive' });
      return;
    }
    setLanguageSettings(data || []);
  };

  const fetchTranslations = async () => {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('language_code, translation_key');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการแปลภาษาได้', variant: 'destructive' });
      return;
    }
    setTranslations(data || []);
  };

  const fetchAPIIntegrations = async () => {
    const { data, error } = await supabase
      .from('api_integrations')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการเชื่อมต่อ API ได้', variant: 'destructive' });
      return;
    }
    
    const typedIntegrations = (data || []).map(integration => ({
      ...integration,
      type: integration.type as 'accounting' | 'erp' | 'delivery' | 'payment'
    }));
    
    setApiIntegrations(typedIntegrations);
  };

  // Helper functions
  const getAddonGroupsForMenuItem = (menuItemId: string) => {
    const menuAddonGroupIds = menuAddonGroups
      .filter(mag => mag.menu_item_id === menuItemId)
      .map(mag => mag.addon_group_id);
    
    return addonGroups.filter(ag => menuAddonGroupIds.includes(ag.id));
  };

  const getAddonGroupsForCategory = (categoryId: string) => {
    const categoryAddonGroupIds = categoryAddonGroups
      .filter(cag => cag.category_id === categoryId)
      .map(cag => cag.addon_group_id);
    
    return addonGroups.filter(ag => categoryAddonGroupIds.includes(ag.id));
  };

  const getLowStockIngredients = () => {
    return ingredients.filter(ingredient => 
      ingredient.quantity <= ingredient.minimum_stock && ingredient.is_active
    );
  };

  const getExpiredIngredients = () => {
    const today = new Date().toISOString().split('T')[0];
    return ingredients.filter(ingredient => 
      ingredient.expiry_date && ingredient.expiry_date <= today && ingredient.is_active
    );
  };

  const getExpiringIngredients = (days: number = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    return ingredients.filter(ingredient => 
      ingredient.expiry_date && 
      ingredient.expiry_date <= futureDateStr && 
      ingredient.expiry_date > new Date().toISOString().split('T')[0] &&
      ingredient.is_active
    );
  };

  const getReorderNeededIngredients = () => {
    return ingredients.filter(ingredient => 
      ingredient.quantity <= (ingredient.reorder_point ?? 0) && ingredient.is_active
    );
  };

  const getIngredientsForMenuItem = (menuItemId: string) => {
    return menuIngredients.filter(mi => mi.menu_item_id === menuItemId);
  };

  const calculateMenuItemCost = (menuItemId: string) => {
    const itemIngredients = getIngredientsForMenuItem(menuItemId);
    return itemIngredients.reduce((total, mi) => {
      const costPerUnit = mi.ingredients?.cost_per_unit || 0;
      return total + (mi.quantity_needed * costPerUnit);
    }, 0);
  };

  const calculateMenuItemProfit = (menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return 0;
    
    const cost = calculateMenuItemCost(menuItemId);
    return menuItem.price - cost;
  };

  const calculateMenuItemMargin = (menuItemId: string) => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem || menuItem.price === 0) return 0;
    
    const profit = calculateMenuItemProfit(menuItemId);
    return (profit / menuItem.price) * 100;
  };

  const getAvailableTables = () => {
    return tables.filter(table => table.status === 'available' && table.is_active);
  };

  const getActiveShift = () => {
    return shifts.find(shift => shift.status === 'active');
  };

  const getOverdueCreditSales = () => {
    const today = new Date().toISOString().split('T')[0];
    return creditSales.filter(sale => 
      sale.status === 'pending' && sale.due_date < today
    );
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
        fetchAddonGroups(),
        fetchAddons(),
        fetchMenuAddonGroups(),
        fetchCategoryAddonGroups(),
        fetchShopSettings(),
        fetchReceiptSettings(),
        fetchMembers(),
        fetchMembershipSettings(),
        fetchPointTransactions(),
        fetchIngredients(),
        fetchStockMovements(),
        fetchMenuIngredients(),
        fetchShifts(),
        fetchSuppliers(),
        fetchPurchaseOrders(),
        fetchTableAreas(),
        fetchTables(),
        fetchTableReservations(),
        fetchCreditCustomers(),
        fetchCreditSales(),
        fetchPriceSchedules(),
        fetchDeliveryDrivers(),
        fetchDeliveryAssignments(),
        fetchProductReservations(),
        fetchSMSSettings(),
        fetchLanguageSettings(),
        fetchTranslations(),
        fetchAPIIntegrations(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categories,
    menuItems,
    addonGroups,
    addons,
    menuAddonGroups,
    categoryAddonGroups,
    shopSettings,
    receiptSettings,
    members,
    membershipSettings,
    pointTransactions,
    ingredients,
    stockMovements,
    menuIngredients,
    loading,

    // New data
    shifts,
    suppliers,
    purchaseOrders,
    purchaseOrderItems,
    tableAreas,
    tables,
    tableReservations,
    creditCustomers,
    creditSales,
    priceSchedules,
    deliveryDrivers,
    deliveryAssignments,
    productReservations,
    smsSettings,
    languageSettings,
    translations,
    apiIntegrations,

    refetch: {
      categories: fetchCategories,
      menuItems: fetchMenuItems,
      addonGroups: fetchAddonGroups,
      addons: fetchAddons,
      menuAddonGroups: fetchMenuAddonGroups,
      categoryAddonGroups: fetchCategoryAddonGroups,
      shopSettings: fetchShopSettings,
      receiptSettings: fetchReceiptSettings,
      members: fetchMembers,
      membershipSettings: fetchMembershipSettings,
      pointTransactions: fetchPointTransactions,
      ingredients: fetchIngredients,
      stockMovements: fetchStockMovements,
      menuIngredients: fetchMenuIngredients,
      shifts: fetchShifts,
      suppliers: fetchSuppliers,
      purchaseOrders: fetchPurchaseOrders,
      tableAreas: fetchTableAreas,
      tables: fetchTables,
      tableReservations: fetchTableReservations,
      creditCustomers: fetchCreditCustomers,
      creditSales: fetchCreditSales,
      priceSchedules: fetchPriceSchedules,
      deliveryDrivers: fetchDeliveryDrivers,
      deliveryAssignments: fetchDeliveryAssignments,
      productReservations: fetchProductReservations,
      smsSettings: fetchSMSSettings,
      languageSettings: fetchLanguageSettings,
      translations: fetchTranslations,
      apiIntegrations: fetchAPIIntegrations,
    },

    uploadImage,
    getAddonGroupsForMenuItem,
    getAddonGroupsForCategory,
    getLowStockIngredients,
    getExpiredIngredients,
    getExpiringIngredients,
    getReorderNeededIngredients,
    getIngredientsForMenuItem,
    calculateMenuItemCost,
    calculateMenuItemProfit,
    calculateMenuItemMargin,
    getAvailableTables,
    getActiveShift,
    getOverdueCreditSales,
  };
};
