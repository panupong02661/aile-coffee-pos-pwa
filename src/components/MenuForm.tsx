import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Crop } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Lazy load ImageCropper to avoid loading react-cropper on every page
const ImageCropper = lazy(() => import('./ImageCropper'));

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
    cost_price: '',
    category_id: '',
    image_url: '',
    is_available: true
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editMenuItem) {
        setFormData({
          name: editMenuItem.name || '',
          description: editMenuItem.description || '',
          price: editMenuItem.price?.toString() || '',
          cost_price: editMenuItem.cost_price?.toString() || '',
          category_id: editMenuItem.category_id || '',
          image_url: editMenuItem.image_url || '',
          is_available: editMenuItem.is_available ?? true
        });
        setImagePreview(editMenuItem.image_url || '');
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          cost_price: '',
          category_id: '',
          image_url: capturedPhoto || '',
          is_available: true
        });
        setImagePreview(capturedPhoto || '');
      }
      setShowCropper(false);
      setOriginalImage('');
    }
  }, [isOpen, editMenuItem, capturedPhoto]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploading(true);
    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      // Upload to Supabase
      const fileExt = 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
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
    } finally {
      setUploading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const menuData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        category_id: formData.category_id || null,
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMenuItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อเมนู *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">ราคาขาย *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cost_price">ราคาต้นทุน</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                />
              </div>
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

            {/* Image Upload Section */}
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
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">ไม่มีรูปภาพ</span>
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
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'กำลังอัปโหลด...' : (imagePreview ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ')}
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading || uploading} className="bg-primary hover:bg-primary/90">
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showCropper && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white">กำลังโหลด...</div></div>}>
          <ImageCropper
            isOpen={showCropper}
            onClose={() => setShowCropper(false)}
            onCrop={handleCroppedImage}
            imageSrc={originalImage}
          />
        </Suspense>
      )}
    </>
  );
};

export default MenuForm;
