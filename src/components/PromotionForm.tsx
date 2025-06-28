
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
    target_group: 'all'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
        target_group: editPromotion.target_group || 'all'
      });
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
        target_group: 'all'
      });
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

      const promotionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        discount_value: formData.discount_value,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        target_group: formData.target_group
      };

      if (editPromotion) {
        // Update existing promotion
        const { error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editPromotion.id);

        if (error) throw error;
      } else {
        // Create new promotion
        const { error } = await supabase
          .from('promotions')
          .insert(promotionData);

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
                  <SelectItem value="platinum">สมาชิกแพลตินั่ม</SelectItem>
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
