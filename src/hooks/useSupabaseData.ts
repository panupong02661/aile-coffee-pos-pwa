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

export const useSupabaseData = () => {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [addonGroups, setAddonGroups] = useState<DatabaseAddonGroup[]>([]);
  const [addons, setAddons] = useState<DatabaseAddon[]>([]);
  const [menuAddonGroups, setMenuAddonGroups] = useState<MenuAddonGroup[]>([]);
  const [categoryAddonGroups, setCategoryAddonGroups] = useState<CategoryAddonGroup[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings | null>(null);
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
    },
    uploadImage,
    getAddonGroupsForMenuItem,
    getAddonGroupsForCategory,
  };
};
