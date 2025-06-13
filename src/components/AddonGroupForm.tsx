
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseAddonGroup } from '@/hooks/useSupabaseData';

interface AddonGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAddonGroup?: DatabaseAddonGroup | null;
}

const AddonGroupForm = ({ isOpen, onClose, onSuccess, editAddonGroup }: AddonGroupFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_required: false,
    allow_multiple: false,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset form data when dialog opens/closes or when editAddonGroup changes
  useEffect(() => {
    if (isOpen) {
      if (editAddonGroup) {
        setFormData({
          name: editAddonGroup.name || '',
          description: editAddonGroup.description || '',
          is_required: editAddonGroup.is_required ?? false,
          allow_multiple: editAddonGroup.allow_multiple ?? false,
          sort_order: editAddonGroup.sort_order || 0,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          is_required: false,
          allow_multiple: false,
          sort_order: 0,
        });
      }
    }
  }, [isOpen, editAddonGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อกลุ่ม Add-on', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editAddonGroup) {
        const { error } = await supabase
          .from('addon_groups')
          .update(formData)
          .eq('id', editAddonGroup.id);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'อัปเดตกลุ่ม Add-on สำเร็จ' });
      } else {
        const { error } = await supabase
          .from('addon_groups')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มกลุ่ม Add-on สำเร็จ' });
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
          <DialogTitle>{editAddonGroup ? 'แก้ไขกลุ่ม Add-on' : 'เพิ่มกลุ่ม Add-on ใหม่'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อกลุ่ม Add-on *</Label>
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
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
            />
            <Label htmlFor="is_required">บังคับเลือก</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow_multiple"
              checked={formData.allow_multiple}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_multiple: checked }))}
            />
            <Label htmlFor="allow_multiple">เลือกได้หลายรายการ</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-coffee-600 hover:bg-coffee-700">
              {loading ? 'กำลังบันทึก...' : (editAddonGroup ? 'อัปเดต' : 'เพิ่มกลุ่ม Add-on')}
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

export default AddonGroupForm;
