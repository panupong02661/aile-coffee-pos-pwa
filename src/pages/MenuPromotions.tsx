import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tag, Plus, Edit, Trash2, Package, FolderOpen, 
  Percent, CircleDollarSign, Calendar, Save, X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { format } from 'date-fns';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'amount';
  discount_value: number;
  target_group: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
  menu_item_ids: string[];
  category_ids: string[];
  min_purchase: number;
  discount_apply_type: 'item' | 'bill';
}

const MenuPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'category'>('menu');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'amount',
    discount_value: 0,
    target_group: 'all',
    start_date: '',
    end_date: '',
    is_active: true,
    usage_limit: null as number | null,
    min_purchase: 0,
    discount_apply_type: 'item' as 'item' | 'bill',
    selectedMenuItems: [] as string[],
    selectedCategories: [] as string[],
  });

  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');

      setCategories(categoriesData || []);

      // Fetch menu items
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('id, name, price, category_id')
        .eq('is_available', true)
        .order('name');

      setMenuItems(menuData || []);

      // Fetch promotions
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (promotionsError) throw promotionsError;

      // Fetch promotion menu items
      const { data: promoMenuItems } = await supabase
        .from('promotion_menu_items')
        .select('promotion_id, menu_item_id');

      // Fetch promotion categories
      const { data: promoCategories } = await supabase
        .from('promotion_categories')
        .select('promotion_id, category_id');

      // Combine data
      const combinedPromotions: Promotion[] = (promotionsData || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        type: p.type as 'percentage' | 'amount',
        discount_value: Number(p.discount_value),
        target_group: p.target_group,
        start_date: p.start_date,
        end_date: p.end_date,
        is_active: p.is_active,
        usage_limit: p.usage_limit,
        used_count: p.used_count,
        min_purchase: Number(p.min_purchase) || 0,
        discount_apply_type: (p.discount_apply_type as 'item' | 'bill') || 'item',
        menu_item_ids: (promoMenuItems || [])
          .filter(pm => pm.promotion_id === p.id)
          .map(pm => pm.menu_item_id),
        category_ids: (promoCategories || [])
          .filter(pc => pc.promotion_id === p.id)
          .map(pc => pc.category_id),
      }));

      setPromotions(combinedPromotions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      discount_value: 0,
      target_group: 'all',
      start_date: '',
      end_date: '',
      is_active: true,
      usage_limit: null,
      min_purchase: 0,
      discount_apply_type: 'item',
      selectedMenuItems: [],
      selectedCategories: [],
    });
    setEditingPromotion(null);
    setIsFormOpen(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อโปรโมชั่น', variant: 'destructive' });
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด', variant: 'destructive' });
      return;
    }
    if (formData.discount_value <= 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกจำนวนส่วนลด', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      if (editingPromotion) {
        // Update promotion
        const { error: updateError } = await supabase
          .from('promotions')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim(),
            type: formData.type,
            discount_value: formData.discount_value,
            target_group: formData.target_group,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_active: formData.is_active,
            usage_limit: formData.usage_limit,
            min_purchase: formData.min_purchase,
            discount_apply_type: formData.discount_apply_type,
          })
          .eq('id', editingPromotion.id);

        if (updateError) throw updateError;

        // Delete old menu items and categories
        await supabase.from('promotion_menu_items').delete().eq('promotion_id', editingPromotion.id);
        await supabase.from('promotion_categories').delete().eq('promotion_id', editingPromotion.id);

        // Insert new menu items
        if (formData.selectedMenuItems.length > 0) {
          await supabase.from('promotion_menu_items').insert(
            formData.selectedMenuItems.map(id => ({
              promotion_id: editingPromotion.id,
              menu_item_id: id,
            }))
          );
        }

        // Insert new categories
        if (formData.selectedCategories.length > 0) {
          await supabase.from('promotion_categories').insert(
            formData.selectedCategories.map(id => ({
              promotion_id: editingPromotion.id,
              category_id: id,
            }))
          );
        }

        toast({ title: 'สำเร็จ', description: 'แก้ไขโปรโมชั่นเรียบร้อย' });
      } else {
        // Create new promotion
        const { data: newPromo, error: insertError } = await supabase
          .from('promotions')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim(),
            type: formData.type,
            discount_value: formData.discount_value,
            target_group: formData.target_group,
            start_date: formData.start_date,
            end_date: formData.end_date,
            is_active: formData.is_active,
            usage_limit: formData.usage_limit,
            min_purchase: formData.min_purchase,
            discount_apply_type: formData.discount_apply_type,
            used_count: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Insert menu items
        if (formData.selectedMenuItems.length > 0) {
          await supabase.from('promotion_menu_items').insert(
            formData.selectedMenuItems.map(id => ({
              promotion_id: newPromo.id,
              menu_item_id: id,
            }))
          );
        }

        // Insert categories
        if (formData.selectedCategories.length > 0) {
          await supabase.from('promotion_categories').insert(
            formData.selectedCategories.map(id => ({
              promotion_id: newPromo.id,
              category_id: id,
            }))
          );
        }

        toast({ title: 'สำเร็จ', description: 'สร้างโปรโมชั่นเรียบร้อย' });
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving promotion:', error);
      toast({ title: 'ข้อผิดพลาด', description: error.message || 'ไม่สามารถบันทึกได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name,
      description: promo.description,
      type: promo.type,
      discount_value: promo.discount_value,
      target_group: promo.target_group,
      start_date: promo.start_date.replace('Z', '').split('.')[0],
      end_date: promo.end_date.replace('Z', '').split('.')[0],
      is_active: promo.is_active,
      usage_limit: promo.usage_limit,
      min_purchase: promo.min_purchase || 0,
      discount_apply_type: promo.discount_apply_type || 'item',
      selectedMenuItems: promo.menu_item_ids,
      selectedCategories: promo.category_ids,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบโปรโมชั่น?')) return;

    setIsLoading(true);
    try {
      await supabase.from('promotion_menu_items').delete().eq('promotion_id', id);
      await supabase.from('promotion_categories').delete().eq('promotion_id', id);
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'สำเร็จ', description: 'ลบโปรโมชั่นเรียบร้อย' });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenuItemSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMenuItems: prev.selectedMenuItems.includes(id)
        ? prev.selectedMenuItems.filter(i => i !== id)
        : [...prev.selectedMenuItems, id],
    }));
  };

  const toggleCategorySelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(id)
        ? prev.selectedCategories.filter(i => i !== id)
        : [...prev.selectedCategories, id],
    }));
  };

  const selectAllMenuItems = () => {
    setFormData(prev => ({
      ...prev,
      selectedMenuItems: menuItems.map(m => m.id),
    }));
  };

  const clearMenuItemSelection = () => {
    setFormData(prev => ({ ...prev, selectedMenuItems: [] }));
  };

  const selectAllCategories = () => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: categories.map(c => c.id),
    }));
  };

  const clearCategorySelection = () => {
    setFormData(prev => ({ ...prev, selectedCategories: [] }));
  };

  const getMenuItemName = (id: string) => menuItems.find(m => m.id === id)?.name || id;
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const menuItemsByCategory = categories.map(cat => ({
    category: cat,
    items: menuItems.filter(m => m.category_id === cat.id),
  }));

  return (
    <div className="min-h-screen bg-coffee-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <div className="p-4">
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="w-6 h-6" />
                จัดการโปรโมชั่นตามเมนู/หมวดหมู่
              </h1>
              <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มโปรโมชั่น
              </Button>
            </div>

            {/* Form */}
            {isFormOpen && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">ชื่อโปรโมชั่น *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="เช่น ลด 20% กาแฟทั้งหมด"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="type">ประเภทส่วนลด</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(v: 'percentage' | 'amount') => setFormData({ ...formData, type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              <span className="flex items-center gap-2">
                                <Percent className="w-4 h-4" /> เปอร์เซ็นต์ (%)
                              </span>
                            </SelectItem>
                            <SelectItem value="amount">
                              <span className="flex items-center gap-2">
                                <CircleDollarSign className="w-4 h-4" /> จำนวนเงิน (บาท)
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="discount_value">
                          จำนวน{formData.type === 'percentage' ? ' %' : ' บาท'} *
                        </Label>
                        <Input
                          id="discount_value"
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                          min="0"
                          max={formData.type === 'percentage' ? 100 : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">วันเริ่มต้น *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">วันสิ้นสุด *</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Description and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="description">คำอธิบาย</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="รายละเอียดโปรโมชั่น..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="min_purchase">ยอดซื้อขั้นต่ำ (บาท)</Label>
                        <Input
                          id="min_purchase"
                          type="number"
                          value={formData.min_purchase || ''}
                          onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) || 0 })}
                          placeholder="0 = ไม่มีขั้นต่ำ"
                          min="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          ลูกค้าต้องซื้อเมนูในหมวดหมู่นี้ขั้นต่ำตามที่กำหนดถึงจะได้ส่วนลด
                        </p>
                      </div>
                      {formData.min_purchase > 0 && (
                        <div>
                          <Label htmlFor="discount_apply_type">รูปแบบการลด</Label>
                          <Select 
                            value={formData.discount_apply_type} 
                            onValueChange={(v: 'item' | 'bill') => setFormData({ ...formData, discount_apply_type: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="item">
                                ส่วนลดรายการ (ลดทุกรายการที่เข้าเงื่อนไข)
                              </SelectItem>
                              <SelectItem value="bill">
                                ส่วนลดท้ายบิล (ลดท้ายบิลรวมครั้งเดียว)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formData.discount_apply_type === 'item' 
                              ? 'ลดราคาแต่ละรายการที่เข้าเงื่อนไขโปรโมชั่น' 
                              : 'ลดยอดรวมท้ายบิลเพียงครั้งเดียว'}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="usage_limit">จำกัดการใช้งาน (ครั้ง)</Label>
                        <Input
                          id="usage_limit"
                          type="number"
                          value={formData.usage_limit || ''}
                          onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                          placeholder="ไม่จำกัด"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                        />
                        <Label>เปิดใช้งาน</Label>
                      </div>
                    </div>
                  </div>

                  {/* Menu/Category Selection */}
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">เลือกเมนู/หมวดหมู่ที่ใช้โปรโมชั่น</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      หากไม่เลือกอะไรเลย โปรโมชั่นจะใช้ได้กับทุกเมนู
                    </p>
                    
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'menu' | 'category')}>
                      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="menu" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          เลือกตามเมนู ({formData.selectedMenuItems.length})
                        </TabsTrigger>
                        <TabsTrigger value="category" className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          เลือกตามหมวดหมู่ ({formData.selectedCategories.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="menu" className="mt-4">
                        <div className="flex gap-2 mb-3">
                          <Button variant="outline" size="sm" onClick={selectAllMenuItems}>
                            เลือกทั้งหมด
                          </Button>
                          <Button variant="outline" size="sm" onClick={clearMenuItemSelection}>
                            ล้างการเลือก
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px] border rounded-lg p-4">
                          {menuItemsByCategory.map(({ category, items }) => (
                            <div key={category.id} className="mb-4">
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                {category.name} ({items.length})
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {items.map(item => (
                                  <label
                                    key={item.id}
                                    className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent transition-colors ${
                                      formData.selectedMenuItems.includes(item.id) ? 'bg-primary/10 border-primary' : ''
                                    }`}
                                  >
                                    <Checkbox
                                      checked={formData.selectedMenuItems.includes(item.id)}
                                      onCheckedChange={() => toggleMenuItemSelection(item.id)}
                                    />
                                    <span className="text-sm truncate">{item.name}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">฿{item.price}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="category" className="mt-4">
                        <div className="flex gap-2 mb-3">
                          <Button variant="outline" size="sm" onClick={selectAllCategories}>
                            เลือกทั้งหมด
                          </Button>
                          <Button variant="outline" size="sm" onClick={clearCategorySelection}>
                            ล้างการเลือก
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categories.map(cat => (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-accent transition-colors ${
                                formData.selectedCategories.includes(cat.id) ? 'bg-primary/10 border-primary' : ''
                              }`}
                            >
                              <Checkbox
                                checked={formData.selectedCategories.includes(cat.id)}
                                onCheckedChange={() => toggleCategorySelection(cat.id)}
                              />
                              <FolderOpen className="w-4 h-4" />
                              <span>{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                      <X className="w-4 h-4 mr-2" />
                      ยกเลิก
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPromotion ? 'บันทึกการแก้ไข' : 'สร้างโปรโมชั่น'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Promotions List */}
            <Card>
              <CardHeader>
                <CardTitle>รายการโปรโมชั่นทั้งหมด ({promotions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {promotions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ยังไม่มีโปรโมชั่น
                  </div>
                ) : (
                  <div className="space-y-4">
                    {promotions.map(promo => (
                      <div
                        key={promo.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{promo.name}</h3>
                            <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                              {promo.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            </Badge>
                            <Badge variant="outline">
                              {promo.type === 'percentage' ? (
                                <><Percent className="w-3 h-3 mr-1" /> ลด {promo.discount_value}%</>
                              ) : (
                                <><CircleDollarSign className="w-3 h-3 mr-1" /> ลด ฿{promo.discount_value}</>
                              )}
                            </Badge>
                          </div>
                          
                          {promo.description && (
                            <p className="text-sm text-muted-foreground">{promo.description}</p>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(promo.start_date), 'dd/MM/yyyy HH:mm')} - {format(new Date(promo.end_date), 'dd/MM/yyyy HH:mm')}
                            </span>
                            {promo.min_purchase > 0 && (
                              <Badge variant="outline" className="ml-2">
                                ซื้อขั้นต่ำ ฿{promo.min_purchase}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {promo.menu_item_ids.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground">เมนู:</span>
                                {promo.menu_item_ids.slice(0, 5).map(id => (
                                  <Badge key={id} variant="secondary" className="text-xs">
                                    {getMenuItemName(id)}
                                  </Badge>
                                ))}
                                {promo.menu_item_ids.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{promo.menu_item_ids.length - 5} อื่นๆ
                                  </Badge>
                                )}
                              </div>
                            )}
                            {promo.category_ids.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground">หมวดหมู่:</span>
                                {promo.category_ids.map(id => (
                                  <Badge key={id} variant="outline" className="text-xs">
                                    <FolderOpen className="w-3 h-3 mr-1" />
                                    {getCategoryName(id)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {promo.menu_item_ids.length === 0 && promo.category_ids.length === 0 && (
                              <Badge variant="secondary" className="text-xs">ใช้ได้ทุกเมนู</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(promo)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPromotions;
