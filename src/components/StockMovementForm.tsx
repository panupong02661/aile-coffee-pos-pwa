
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseIngredient } from '@/hooks/useSupabaseData';
import { ShoppingCart, RotateCcw, Minus, Trash } from 'lucide-react';

interface StockMovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ingredients: DatabaseIngredient[];
}

const StockMovementForm = ({ isOpen, onClose, onSuccess, ingredients }: StockMovementFormProps) => {
  const [formData, setFormData] = useState({
    ingredient_id: '',
    movement_type: 'purchase' as 'purchase' | 'adjustment' | 'usage' | 'waste',
    quantity_change: 0,
    cost_per_unit: 0,
    reference_number: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const movementTypes = [
    { value: 'purchase', label: 'ซื้อเข้า/เติมสต็อก', icon: ShoppingCart, color: 'text-green-600' },
    { value: 'adjustment', label: 'ปรับยอด', icon: RotateCcw, color: 'text-blue-600' },
    { value: 'usage', label: 'ใช้งาน', icon: Minus, color: 'text-orange-600' },
    { value: 'waste', label: 'สูญเสีย/เสียหาย', icon: Trash, color: 'text-red-600' }
  ];

  const selectedIngredient = ingredients.find(i => i.id === formData.ingredient_id);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ingredient_id: '',
        movement_type: 'purchase',
        quantity_change: 0,
        cost_per_unit: 0,
        reference_number: '',
        notes: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-fill cost_per_unit when ingredient is selected
    if (selectedIngredient && formData.movement_type === 'purchase') {
      setFormData(prev => ({ 
        ...prev, 
        cost_per_unit: selectedIngredient.cost_per_unit 
      }));
    }
  }, [selectedIngredient, formData.movement_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ingredient_id || formData.quantity_change === 0) {
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: 'กรุณาเลือกวัตถุดิบและใส่จำนวน', 
        variant: 'destructive' 
      });
      return;
    }

    if (!selectedIngredient) return;

    setLoading(true);
    try {
      // Calculate new quantity
      const isDecrease = formData.movement_type === 'usage' || formData.movement_type === 'waste';
      const actualQuantityChange = isDecrease ? -Math.abs(formData.quantity_change) : Math.abs(formData.quantity_change);
      const newQuantity = selectedIngredient.quantity + actualQuantityChange;

      if (newQuantity < 0) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: 'จำนวนที่ลดไม่สามารถมากกว่าสต็อกปัจจุบันได้', 
          variant: 'destructive' 
        });
        setLoading(false);
        return;
      }

      // Create stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          ingredient_id: formData.ingredient_id,
          movement_type: formData.movement_type,
          quantity_change: actualQuantityChange,
          cost_per_unit: formData.cost_per_unit || null,
          reference_number: formData.reference_number || null,
          notes: formData.notes || null,
          created_by: 'staff'
        }]);

      if (movementError) throw movementError;

      // Update ingredient quantity
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ 
          quantity: newQuantity,
          // Update cost_per_unit if it's a purchase
          ...(formData.movement_type === 'purchase' && formData.cost_per_unit > 0 && {
            cost_per_unit: formData.cost_per_unit
          })
        })
        .eq('id', formData.ingredient_id);

      if (updateError) throw updateError;

      const movementTypeLabel = movementTypes.find(t => t.value === formData.movement_type)?.label;
      toast({ 
        title: 'สำเร็จ', 
        description: `บันทึก${movementTypeLabel}สำเร็จ` 
      });
      
      onSuccess();
    } catch (error) {
      console.error('Stock movement error:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: 'ไม่สามารถบันทึกการเคลื่อนไหวสต็อกได้', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStock = () => {
    if (!selectedIngredient) return 0;
    const isDecrease = formData.movement_type === 'usage' || formData.movement_type === 'waste';
    const actualQuantityChange = isDecrease ? -Math.abs(formData.quantity_change) : Math.abs(formData.quantity_change);
    return selectedIngredient.quantity + actualQuantityChange;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>บันทึกการเคลื่อนไหวสต็อก</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ingredient">วัตถุดิบ *</Label>
            <Select value={formData.ingredient_id} onValueChange={(value) => setFormData(prev => ({ ...prev, ingredient_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกวัตถุดิบ" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ingredient) => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{ingredient.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedIngredient && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">สต็อกปัจจุบัน</div>
              <div className="font-semibold">
                {selectedIngredient.quantity} {selectedIngredient.unit}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="movement_type">ประเภทการเคลื่อนไหว *</Label>
            <Select value={formData.movement_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, movement_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                {movementTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity_change">
              จำนวน ({formData.movement_type === 'usage' || formData.movement_type === 'waste' ? 'ลด' : 'เพิ่ม'}) *
            </Label>
            <Input
              id="quantity_change"
              type="number"
              min="0"
              step="0.01"
              value={formData.quantity_change}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity_change: Number(e.target.value) }))}
              required
            />
            {selectedIngredient && formData.quantity_change > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                สต็อกหลังการเปลี่ยนแปลง: {getCurrentStock()} {selectedIngredient.unit}
              </div>
            )}
          </div>

          {(formData.movement_type === 'purchase' || formData.movement_type === 'adjustment') && (
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
          )}

          <div>
            <Label htmlFor="reference_number">เลขที่อ้างอิง</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              placeholder="เลขที่ใบสั่งซื้อ, ใบเสร็จ ฯลฯ"
            />
          </div>

          <div>
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? 'กำลังบันทึก...' : 'บันทึกการเคลื่อนไหว'}
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

export default StockMovementForm;
