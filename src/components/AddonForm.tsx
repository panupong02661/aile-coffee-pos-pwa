
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseAddon, DatabaseAddonGroup } from '@/hooks/useSupabaseData';

interface AddonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addonGroups: DatabaseAddonGroup[];
  editAddon?: DatabaseAddon | null;
}

const AddonForm = ({ isOpen, onClose, onSuccess, addonGroups, editAddon }: AddonFormProps) => {
  const [formData, setFormData] = useState({
    name: editAddon?.name || '',
    price: editAddon?.price || 0,
    addon_group_id: editAddon?.addon_group_id || '',
    sort_order: editAddon?.sort_order || 0,
    is_active: editAddon?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.addon_group_id) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลที่จำเป็น', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editAddon) {
        const { error } = await supabase
          .from('addons')
          .update(formData)
          .eq('id', editAddon.id);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'อัปเดต Add-on สำเร็จ' });
      } else {
        const { error } = await supabase
          .from('addons')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่ม Add-on สำเร็จ' });
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
          <DialogTitle>{editAddon ? 'แก้ไข Add-on' : 'เพิ่ม Add-on ใหม่'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อ Add-on *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="addon_group">กลุ่ม Add-on *</Label>
            <Select value={formData.addon_group_id} onValueChange={(value) => setFormData(prev => ({ ...prev, addon_group_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกกลุ่ม Add-on" />
              </SelectTrigger>
              <SelectContent>
                {addonGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">ราคา (บาท)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
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
              {loading ? 'กำลังบันทึก...' : (editAddon ? 'อัปเดต' : 'เพิ่ม Add-on')}
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

export default AddonForm;
