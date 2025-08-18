import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseAddonGroup, useSupabaseData } from '@/hooks/useSupabaseData';
import { Check, ChevronDown } from 'lucide-react';

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
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { categories, menuItems } = useSupabaseData();

  // Load existing relationships when editing
  useEffect(() => {
    const loadExistingRelationships = async () => {
      if (editAddonGroup && isOpen) {
        // Load existing menu relationships
        const { data: menuRels } = await supabase
          .from('menu_addon_groups')
          .select('menu_item_id')
          .eq('addon_group_id', editAddonGroup.id);
        
        if (menuRels) {
          setSelectedMenuItems(menuRels.map(rel => rel.menu_item_id));
        }

        // Load existing category relationships
        const { data: categoryRels } = await supabase
          .from('category_addon_groups')
          .select('category_id')
          .eq('addon_group_id', editAddonGroup.id);
        
        if (categoryRels) {
          setSelectedCategories(categoryRels.map(rel => rel.category_id));
        }
      }
    };

    loadExistingRelationships();
  }, [editAddonGroup, isOpen]);

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
        setSelectedMenuItems([]);
        setSelectedCategories([]);
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
      let addonGroupId: string;

      if (editAddonGroup) {
        const { error } = await supabase
          .from('addon_groups')
          .update(formData)
          .eq('id', editAddonGroup.id);
        
        if (error) throw error;
        addonGroupId = editAddonGroup.id;
        toast({ title: 'สำเร็จ', description: 'อัปเดตกลุ่ม Add-on สำเร็จ' });
      } else {
        const { data, error } = await supabase
          .from('addon_groups')
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;
        addonGroupId = data.id;
        toast({ title: 'สำเร็จ', description: 'เพิ่มกลุ่ม Add-on สำเร็จ' });
      }

      // Delete existing relationships for this addon group
      await Promise.all([
        supabase
          .from('menu_addon_groups')
          .delete()
          .eq('addon_group_id', addonGroupId),
        supabase
          .from('category_addon_groups')
          .delete()
          .eq('addon_group_id', addonGroupId)
      ]);

      // Insert new menu relationships
      if (selectedMenuItems.length > 0) {
        const menuRelationships = selectedMenuItems.map(menuItemId => ({
          addon_group_id: addonGroupId,
          menu_item_id: menuItemId
        }));

        const { error: menuError } = await supabase
          .from('menu_addon_groups')
          .insert(menuRelationships);

        if (menuError) throw menuError;
      }

      // Insert new category relationships
      if (selectedCategories.length > 0) {
        const categoryRelationships = selectedCategories.map(categoryId => ({
          addon_group_id: addonGroupId,
          category_id: categoryId
        }));

        const { error: categoryError } = await supabase
          .from('category_addon_groups')
          .insert(categoryRelationships);

        if (categoryError) throw categoryError;
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

  const toggleMenuItem = (menuItemId: string) => {
    setSelectedMenuItems(prev => 
      prev.includes(menuItemId)
        ? prev.filter(id => id !== menuItemId)
        : [...prev, menuItemId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllMenuItems = () => {
    setSelectedMenuItems(menuItems.map(item => item.id));
  };

  const clearMenuItems = () => {
    setSelectedMenuItems([]);
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories.map(cat => cat.id));
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Menu Selection with ScrollArea */}
          <div>
            <Label>เมนู</Label>
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedMenuItems.length === 0
                      ? "เลือกเมนู..."
                      : selectedMenuItems.length === menuItems.length
                      ? "เลือกทั้งหมด"
                      : `เลือกแล้ว ${selectedMenuItems.length}รายการ`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start" side="bottom">
                  <div className="p-2 border-b">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllMenuItems}
                        className="flex-1"
                      >
                        เลือกทั้งหมด
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearMenuItems}
                        className="flex-1"
                      >
                        ล้างการเลือก
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-60">
                    <div className="p-1">
                      {menuItems.map((menuItem) => (
                        <div
                          key={menuItem.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded-sm"
                          onClick={() => toggleMenuItem(menuItem.id)}
                        >
                          <div className="w-4 h-4 border rounded flex items-center justify-center">
                            {selectedMenuItems.includes(menuItem.id) && (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                          <span className="text-sm">{menuItem.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Category Selection with ScrollArea */}
          <div>
            <Label>หมวดหมู่</Label>
            <div className="mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedCategories.length === 0
                      ? "เลือกหมวดหมู่..."
                      : selectedCategories.length === categories.length
                      ? "เลือกทั้งหมด"
                      : `เลือกแล้ว ${selectedCategories.length} รายการ`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start" side="bottom">
                  <div className="p-2 border-b">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllCategories}
                        className="flex-1"
                      >
                        เลือกทั้งหมด
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearCategories}
                        className="flex-1"
                      >
                        ล้างการเลือก
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-60">
                    <div className="p-1">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded-sm"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="w-4 h-4 border rounded flex items-center justify-center">
                            {selectedCategories.includes(category.id) && (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
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
