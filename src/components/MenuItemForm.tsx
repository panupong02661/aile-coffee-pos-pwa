import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Crop } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseCategory, DatabaseMenuItem } from '@/hooks/useSupabaseData';
import ImageCropper from './ImageCropper';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: DatabaseCategory[];
  editItem?: DatabaseMenuItem | null;
  uploadImage?: (file: File) => Promise<string>;
}

const MenuItemForm = ({ isOpen, onClose, onSuccess, categories, editItem }: MenuItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    cost_price: 0,
    category_id: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Debug logging and form reset
  useEffect(() => {
    console.log('MenuItemForm useEffect triggered:', { isOpen, editItem });
    
    if (isOpen) {
      if (editItem) {
        console.log('Setting form data from editItem:', editItem);
        const newFormData = {
          name: editItem.name || '',
          description: editItem.description || '',
          price: editItem.price || 0,
          cost_price: editItem.cost_price || 0,
          category_id: editItem.category_id || '',
          image_url: editItem.image_url || '',
        };
        console.log('New form data:', newFormData);
        setFormData(newFormData);
        setImagePreview(editItem.image_url || '');
      } else {
        console.log('Resetting form for new item');
        setFormData({
          name: '',
          description: '',
          price: 0,
          cost_price: 0,
          category_id: '',
          image_url: '',
        });
        setImagePreview('');
      }
      setShowCropper(false);
      setOriginalImage('');
    }
  }, [isOpen, editItem]);

  // Additional effect to handle form data changes
  useEffect(() => {
    console.log('Current formData state:', formData);
  }, [formData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the cropper
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setOriginalImage(imageUrl);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (croppedImageDataUrl: string) => {
    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Upload to Supabase
      const fileExt = 'jpg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `menu/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      setImagePreview(data.publicUrl);
      
      toast({ title: 'สำเร็จ', description: 'อัปโหลดและครอปรูปภาพสำเร็จ' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัปโหลดรูปภาพได้', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลที่จำเป็น', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      if (editItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(formData)
          .eq('id', editItem.id);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'อัปเดตเมนูสำเร็จ' });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มเมนูสำเร็จ' });
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

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCropperWithCurrentImage = () => {
    if (imagePreview) {
      setOriginalImage(imagePreview);
      setShowCropper(true);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อเมนู *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">รายละเอียดเมนู</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">ราคาขาย *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost_price">ราคาต้นทุน</Label>
                <Input
                  id="cost_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_price: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">หมวดหมู่เมนู</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
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
              <Label>รูปภาพเมนู</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">ไม่มีรูปภาพ</span>
                  </div>
                )}
                
                <div className="mt-2 flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                  </Button>
                  
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openCropperWithCurrentImage}
                      className="flex items-center gap-2"
                    >
                      <Crop className="w-4 h-4" />
                      ครอปรูปภาพ
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-coffee-600 hover:bg-coffee-700">
                {loading ? 'กำลังบันทึก...' : (editItem ? 'อัปเดต' : 'เพิ่มเมนู')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                ยกเลิก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        onCrop={handleCroppedImage}
        imageSrc={originalImage}
      />
    </>
  );
};

export default MenuItemForm;
