
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseIngredient } from '@/hooks/useSupabaseData';

interface IngredientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingIngredient?: DatabaseIngredient | null;
}

const IngredientForm = ({ isOpen, onClose, onSuccess, editingIngredient }: IngredientFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    quantity: 0,
    unit: 'g',
    cost_per_unit: 0,
    minimum_stock: 10,
    supplier: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'coffee', label: 'กาแฟ' },
    { value: 'dairy', label: 'นม/ของเหลว' },
    { value: 'syrup', label: 'ไซรัป' },
    { value: 'sweetener', label: 'สารให้ความหวาน' },
    { value: 'bakery', label: 'อบเบเกอรี่' },
    { value: 'packaging', label: 'บรรจุภัณฑ์' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  const units = [
    { value: 'g', label: 'กรัม (g)' },
    { value: 'kg', label: 'กิโลกรัม (kg)' },
    { value: 'ml', label: 'มิลลิลิตร (ml)' },
    { value: 'L', label: 'ลิตร (L)' },
    { value: 'pieces', label: 'ชิ้น' },
    { value: 'pack', label: 'แพ็ค' },
    { value: 'bottle', label: 'ขวด' },
    { value: 'can', label: 'กระป๋อง' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (editingIngredient) {
        setFormData({
          name: editingIngredient.name,
          category: editingIngredient.category,
          quantity: editingIngredient.quantity,
          unit: editingIngredient.unit,
          cost_per_unit: editingIngredient.cost_per_unit,
          minimum_stock: editingIngredient.minimum_stock,
          supplier: editingIngredient.supplier || '',
        });
      } else {
        setFormData({
          name: '',
          category: 'other',
          quantity: 0,
          unit: 'g',
          cost_per_unit: 0,
          minimum_stock: 10,
          supplier: '',
        });
      }
    }
  }, [isOpen, editingIngredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อวัตถุดิบ', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editingIngredient) {
        const { error } = await supabase
          .from('ingredients')
          .update(formData)
          .eq('id', editingIngredient.id);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'อัปเดตวัตถุดิบสำเร็จ' });
      } else {
        // Get the highest sort_order and add 1
        const { data: maxSortOrder } = await supabase
          .from('ingredients')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1);

        const nextSortOrder = maxSortOrder && maxSortOrder.length > 0 
          ? maxSortOrder[0].sort_order + 1 
          : 0;

        const { error } = await supabase
          .from('ingredients')
          .insert([{ ...formData, sort_order: nextSortOrder }]);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มวัตถุดิบสำเร็จ' });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingIngredient ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบใหม่'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อวัตถุดิบ *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">หมวดหมู่</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">จำนวนปัจจุบัน</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="unit">หน่วย</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหน่วย" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost_per_unit">ราคาต่อหน่วย</Label>
              <Input
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="minimum_stock">สต็อกขั้นต่ำ</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                step="0.01"
                value={formData.minimum_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplier">ผู้จัดจำหน่าย</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-coffee-600 hover:bg-coffee-700">
              {loading ? 'กำลังบันทึก...' : (editingIngredient ? 'อัปเดต' : 'เพิ่มวัตถุดิบ')}
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

export default IngredientForm;
