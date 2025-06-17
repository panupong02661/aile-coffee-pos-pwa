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
  cost_per_unit: number;
  minimum_stock: number;
  supplier?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuIngredient {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity_needed: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  ingredient_id: string;
  movement_type: 'purchase' | 'adjustment' | 'usage' | 'waste';
  quantity_change: number;
  cost_per_unit?: number;
  reference_number?: string;
  order_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
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
  const [menuIngredients, setMenuIngredients] = useState<MenuIngredient[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
    
    // Cast the data to the correct types
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
    
    // Cast the data to the correct types
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
    
    // Cast the data to the correct types
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
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลวัตถุดิบได้', variant: 'destructive' });
      return;
    }
    setIngredients(data || []);
  };

  const fetchMenuIngredients = async () => {
    const { data, error } = await supabase
      .from('menu_ingredients')
      .select('*');
    
    if (error) {
      console.error('Error fetching menu ingredients:', error);
      return;
    }
    setMenuIngredients(data || []);
  };

  const fetchStockMovements = async () => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดประวัติการเคลื่อนไหวสต็อกได้', variant: 'destructive' });
      return;
    }
    setStockMovements(data || []);
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
        fetchMenuIngredients(),
        fetchStockMovements(),
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
    menuIngredients,
    stockMovements,
    loading,
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
      menuIngredients: fetchMenuIngredients,
      stockMovements: fetchStockMovements,
    },
    uploadImage,
    getAddonGroupsForMenuItem,
    getAddonGroupsForCategory,
  };
};
