
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  editMenuItem?: any;
  capturedPhoto?: string;
}

const MenuForm: React.FC<MenuFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  editMenuItem,
  capturedPhoto
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editMenuItem) {
      setFormData({
        name: editMenuItem.name || '',
        description: editMenuItem.description || '',
        price: editMenuItem.price?.toString() || '',
        category_id: editMenuItem.category_id || '',
        image_url: editMenuItem.image_url || '',
        is_available: editMenuItem.is_available ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: capturedPhoto || '',
        is_available: true
      });
    }
  }, [editMenuItem, capturedPhoto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const menuData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        image_url: formData.image_url,
        is_available: formData.is_available
      };

      if (editMenuItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuData)
          .eq('id', editMenuItem.id);

        if (error) throw error;
        toast({ title: 'แก้ไขเมนูสำเร็จ' });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([menuData]);

        if (error) throw error;
        toast({ title: 'เพิ่มเมนูสำเร็จ' });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: 'ไม่สามารถบันทึกเมนูได้',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editMenuItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">ชื่อเมนู</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">ราคา</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">หมวดหมู่</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image_url">รูปภาพ URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuForm;
