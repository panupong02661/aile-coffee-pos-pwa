
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
    type: 'percentage' as 'percentage' | 'amount',
    discount_value: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    target_group: 'all',
    apply_to: 'all' as 'all' | 'menu_item' | 'category'
  });
  
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch menu items
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, category_id')
        .eq('is_available', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
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
        is_active: editPromotion.is_active ?? true,
        target_group: editPromotion.target_group || 'all',
        apply_to: editPromotion.apply_to || 'all'
      });

      // Load selected menu items and categories
      if (editPromotion.promotion_menu_items) {
        setSelectedMenuItems(editPromotion.promotion_menu_items.map((item: any) => item.menu_items.id));
      }
      if (editPromotion.promotion_categories) {
        setSelectedCategories(editPromotion.promotion_categories.map((cat: any) => cat.categories.id));
      }
    } else {
      // Reset form for new promotion
      setFormData({
        name: '',
        description: '',
        type: 'percentage',
        discount_value: 0,
        start_date: '',
        end_date: '',
        is_active: true,
        target_group: 'all',
        apply_to: 'all'
      });
      setSelectedMenuItems([]);
      setSelectedCategories([]);
    }
  }, [editPromotion, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาใส่ชื่อโปรโมชั่น', variant: 'destructive' });
        return;
      }

      if (formData.discount_value <= 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาใส่มูลค่าส่วนลด', variant: 'destructive' });
        return;
      }

      if (!formData.start_date || !formData.end_date) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด', variant: 'destructive' });
        return;
      }

      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        toast({ title: 'ข้อผิดพลาด', description: 'วันที่เริ่มต้นต้องก่อนวันที่สิ้นสุด', variant: 'destructive' });
        return;
      }

      // Check if specific items/categories are selected when needed
      if (formData.apply_to === 'menu_item' && selectedMenuItems.length === 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกรายการเมนู', variant: 'destructive' });
        return;
      }

      if (formData.apply_to === 'category' && selectedCategories.length === 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกหมวดหมู่', variant: 'destructive' });
        return;
      }

      const promotionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        discount_type: formData.type,
        discount_value: formData.discount_value,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        target_group: formData.target_group,
        apply_to: formData.apply_to
      };

      let promotionId: string;

      if (editPromotion) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editPromotion.id);

        if (error) throw error;
        promotionId = editPromotion.id;

        // Clear existing relationships
        await supabase.from('promotion_menu_items').delete().eq('promotion_id', promotionId);
        await supabase.from('promotion_categories').delete().eq('promotion_id', promotionId);
      } else {
        // Create new promotion
        const { data, error } = await supabase
          .from('promotions')
          .insert(promotionData)
          .select()
          .single();

        if (error) throw error;
        promotionId = data.id;
      }

      // Insert menu item relationships
      if (formData.apply_to === 'menu_item' && selectedMenuItems.length > 0) {
        const menuItemRelations = selectedMenuItems.map(menuItemId => ({
          promotion_id: promotionId,
          menu_item_id: menuItemId
        }));

        const { error } = await supabase
          .from('promotion_menu_items')
          .insert(menuItemRelations);

        if (error) throw error;
      }

      // Insert category relationships
      if (formData.apply_to === 'category' && selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          promotion_id: promotionId,
          category_id: categoryId
        }));

        const { error } = await supabase
          .from('promotion_categories')
          .insert(categoryRelations);

        if (error) throw error;
      }

      toast({
        title: 'สำเร็จ',
        description: editPromotion ? 'แก้ไขโปรโมชั่นสำเร็จ' : 'สร้างโปรโมชั่นสำเร็จ'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกโปรโมชั่นได้',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMenuItemToggle = (menuItemId: string) => {
    setSelectedMenuItems(prev =>
      prev.includes(menuItemId)
        ? prev.filter(id => id !== menuItemId)
        : [...prev, menuItemId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-coffee-800">
            {editPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อโปรโมชั่น *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ชื่อโปรโมชั่น"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_group">กลุ่มเป้าหมาย</Label>
              <Select
                value={formData.target_group}
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_group: value }))}
              >
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="คำอธิบายโปรโมชั่น"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ประเภทส่วนลด *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'percentage' | 'amount') => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">ส่วนลดเปอร์เซ็นต์</SelectItem>
                  <SelectItem value="amount">ส่วนลดจำนวนเงิน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">
                มูลค่าส่วนลด * {formData.type === 'percentage' ? '(%)' : '(บาท)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                step={formData.type === 'percentage' ? '1' : '0.01'}
                max={formData.type === 'percentage' ? '100' : undefined}
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">วันที่เริ่มต้น *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
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

          <div className="space-y-2">
            <Label>ใช้กับ</Label>
            <Select
              value={formData.apply_to}
              onValueChange={(value: 'all' | 'menu_item' | 'category') => {
                setFormData(prev => ({ ...prev, apply_to: value }));
                setSelectedMenuItems([]);
                setSelectedCategories([]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกเมนู</SelectItem>
                <SelectItem value="menu_item">เมนูที่เลือก</SelectItem>
                <SelectItem value="category">หมวดหมู่ที่เลือก</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.apply_to === 'menu_item' && (
            <div className="space-y-2">
              <Label>เลือกเมนู</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`menu-${item.id}`}
                      checked={selectedMenuItems.includes(item.id)}
                      onCheckedChange={() => handleMenuItemToggle(item.id)}
                    />
                    <Label htmlFor={`menu-${item.id}`} className="text-sm">
                      {item.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">เลือก {selectedMenuItems.length} รายการ</p>
            </div>
          )}

          {formData.apply_to === 'category' && (
            <div className="space-y-2">
              <Label>เลือกหมวดหมู่</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">เลือก {selectedCategories.length} หมวดหมู่</p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
            />
            <Label htmlFor="is_active">เปิดใช้งาน</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              className="bg-coffee-600 hover:bg-coffee-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังบันทึก...' : (editPromotion ? 'แก้ไข' : 'สร้าง')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionForm;
