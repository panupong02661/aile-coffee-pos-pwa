export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category_id: string;
  is_available: boolean;
  calculated_cost?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export type AddonCategory = 'shot' | 'sweetness' | 'topping' | 'size' | 'other';

export interface Addon {
  id: string;
  name: string;
  price: number;
  category: AddonCategory;
  is_required: boolean;
  allow_multiple: boolean;
  menu_item_id?: string;
  addon_group_id?: string;
  addon_groups?: {
    id: string;
    name: string;
    allow_multiple: boolean;
    is_required: boolean;
  };
}

export interface CartItem {
  id: string;
  menu_item: MenuItem;
  quantity: number;
  selected_addons: Addon[];
  item_discount: number;
  item_discount_type: 'percent' | 'amount';
  total_price: number;
}

export interface Member {
  phone: string;
  name: string;
  email?: string;
  points: number;
  tier: 'silver' | 'gold' | 'platinum';
  total_spent: number;
  join_date: string;
}

export type PaymentMethod = 'cash' | 'qr' | 'points' | 'promptpay';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  discount_type: 'percent' | 'amount';
  total: number;
  payment_method: PaymentMethod;
  member?: Member;
  created_at: string;
  status: 'completed' | 'cancelled' | 'refunded';
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayCustomers: number;
  salesGrowth: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  minimum_stock: number;
  supplier?: string;
}

export interface MenuIngredient {
  menu_item_id: string;
  ingredient_id: string;
  quantity_needed: number;
}
