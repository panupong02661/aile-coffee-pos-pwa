
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseCategory } from '@/hooks/useSupabaseData';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCategory?: DatabaseCategory | null;
}

const CategoryForm = ({ isOpen, onClose, onSuccess, editCategory }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset form data when dialog opens/closes or when editCategory changes
  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setFormData({
          name: editCategory.name || '',
          description: editCategory.description || '',
          sort_order: editCategory.sort_order || 0,
          is_active: editCategory.is_active ?? true,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          sort_order: 0,
          is_active: true,
        });
      }
    }
  }, [isOpen, editCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อหมวดหมู่', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editCategory.id);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'อัปเดตหมวดหมู่สำเร็จ' });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มหมวดหมู่สำเร็จ' });
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อหมวดหมู่ *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
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

          <div>
            <Label htmlFor="sort_order">ลำดับการแสดง</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
            />
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
              {loading ? 'กำลังบันทึก...' : (editCategory ? 'อัปเดต' : 'เพิ่มหมวดหมู่')}
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

export default CategoryForm;
