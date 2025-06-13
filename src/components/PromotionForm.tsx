
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editPromotion?: any;
}

const PromotionForm = ({ isOpen, onClose, onSuccess, editPromotion }: PromotionFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'amount' | 'buy_get' | 'free_item',
    discount_value: 0,
    start_date: '',
    end_date: '',
    target_group: 'all' as 'all' | 'silver' | 'gold' | 'platinum',
    usage_limit: null as number | null,
    is_active: true,
  });
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMenuPopoverOpen, setIsMenuPopoverOpen] = useState(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id, 
          name,
          categories (
            id,
            name
          )
        `)
        .eq('is_available', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (editPromotion) {
      setFormData({
        name: editPromotion.name || '',
        description: editPromotion.description || '',
        type: editPromotion.type || 'percentage',
        discount_value: editPromotion.discount_value || 0,
        start_date: editPromotion.start_date ? new Date(editPromotion.start_date).toISOString().slice(0, 16) : '',
        end_date: editPromotion.end_date ? new Date(editPromotion.end_date).toISOString().slice(0, 16) : '',
        target_group: editPromotion.target_group || 'all',
        usage_limit: editPromotion.usage_limit,
        is_active: editPromotion.is_active ?? true,
      });
      
      // Load selected menu items
      if (editPromotion.promotion_menu_items) {
        const menuItemIds = editPromotion.promotion_menu_items.map((item: any) => item.menu_items.id);
        setSelectedMenuItems(menuItemIds);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'percentage',
        discount_value: 0,
        start_date: '',
        end_date: '',
        target_group: 'all',
        usage_limit: null,
        is_active: true,
      });
      setSelectedMenuItems([]);
    }
  }, [editPromotion]);

  const handleMenuItemToggle = (menuItemId: string) => {
    setSelectedMenuItems(prev => 
      prev.includes(menuItemId)
        ? prev.filter(id => id !== menuItemId)
        : [...prev, menuItemId]
    );
  };

  const selectAllMenuItems = () => {
    setSelectedMenuItems(menuItems.map(item => item.id));
  };

  const deselectAllMenuItems = () => {
    setSelectedMenuItems([]);
  };

  const handleCategorySelect = (categoryId: string) => {
    const categoryMenuItems = menuItems.filter(item => item.categories?.id === categoryId);
    const categoryItemIds = categoryMenuItems.map(item => item.id);
    
    // Add all items from this category to selected items
    setSelectedMenuItems(prev => {
      const newItems = categoryItemIds.filter(id => !prev.includes(id));
      return [...prev, ...newItems];
    });
    
    setSelectedCategory(categoryId);
    setIsCategoryPopoverOpen(false);
  };

  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.categories?.id === selectedCategory)
    : menuItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลที่จำเป็น', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const promotionData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      let promotionId: string;

      if (editPromotion) {
        const { error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editPromotion.id);
        
        if (error) throw error;
        promotionId = editPromotion.id;
        
        // Delete existing menu item associations
        await supabase
          .from('promotion_menu_items')
          .delete()
          .eq('promotion_id', promotionId);
          
        toast({ title: 'สำเร็จ', description: 'อัปเดตโปรโมชั่นสำเร็จ' });
      } else {
        const { data, error } = await supabase
          .from('promotions')
          .insert([promotionData])
          .select()
          .single();
        
        if (error) throw error;
        promotionId = data.id;
        toast({ title: 'สำเร็จ', description: 'เพิ่มโปรโมชั่นสำเร็จ' });
      }

      // Insert new menu item associations
      if (selectedMenuItems.length > 0) {
        const menuItemAssociations = selectedMenuItems.map(menuItemId => ({
          promotion_id: promotionId,
          menu_item_id: menuItemId,
        }));

        const { error: associationError } = await supabase
          .from('promotion_menu_items')
          .insert(menuItemAssociations);

        if (associationError) throw associationError;
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">ชื่อโปรโมชั่น *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">ประเภทโปรโมชั่น *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">ส่วนลดเปอร์เซ็นต์</SelectItem>
                  <SelectItem value="amount">ส่วนลดจำนวนเงิน</SelectItem>
                  <SelectItem value="buy_get">ซื้อแถม</SelectItem>
                  <SelectItem value="free_item">ของแถม</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_value">จำนวนส่วนลด *</Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="usage_limit">จำกัดการใช้งาน (ครั้ง)</Label>
              <Input
                id="usage_limit"
                type="number"
                min="0"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">วันที่เริ่ม *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">วันที่สิ้นสุด *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="target_group">กลุ่มเป้าหมาย</Label>
            <Select value={formData.target_group} onValueChange={(value: any) => setFormData(prev => ({ ...prev, target_group: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกคน</SelectItem>
                <SelectItem value="silver">สมาชิกเงิน</SelectItem>
                <SelectItem value="gold">สมาชิกทอง</SelectItem>
                <SelectItem value="platinum">สมาชิกแพลตตินั่ม</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>เมนูที่ใช้ได้</Label>
              <div className="space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllMenuItems}>
                  เลือกทั้งหมด
                </Button>
                <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      เลือกหมวดหมู่
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <div className="space-y-2">
                      <div className="font-medium">เลือกหมวดหมู่</div>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <Button
                            key={category.id}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleCategorySelect(category.id)}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover open={isMenuPopoverOpen} onOpenChange={setIsMenuPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      เลือกเมนู
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">เลือกเมนู</span>
                        <Button size="sm" variant="ghost" onClick={deselectAllMenuItems}>
                          ยกเลิกทั้งหมด
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {filteredMenuItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={item.id}
                              checked={selectedMenuItems.includes(item.id)}
                              onCheckedChange={() => handleMenuItemToggle(item.id)}
                            />
                            <Label htmlFor={item.id} className="text-sm cursor-pointer">
                              {item.name}
                              {item.categories && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({item.categories.name})
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="border border-coffee-200 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.filter(item => selectedMenuItems.includes(item.id)).map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`selected-${item.id}`}
                      checked={true}
                      onCheckedChange={() => handleMenuItemToggle(item.id)}
                    />
                    <Label htmlFor={`selected-${item.id}`} className="text-sm cursor-pointer">
                      {item.name}
                    </Label>
                  </div>
                ))}
                {selectedMenuItems.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-2">ยังไม่ได้เลือกเมนู</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">เปิดใช้งาน</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-coffee-600 hover:bg-coffee-700">
              {loading ? 'กำลังบันทึก...' : (editPromotion ? 'อัปเดต' : 'สร้างโปรโมชั่น')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              ยกเลิก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionForm;
