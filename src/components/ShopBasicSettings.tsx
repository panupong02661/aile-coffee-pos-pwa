
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface ShopSettingsForm {
  shop_name: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  logo_url: string;
}

const ShopBasicSettings = () => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch } = useForm<ShopSettingsForm>();
  const logoUrl = watch('logo_url');

  useEffect(() => {
    fetchShopSettings();
  }, []);

  useEffect(() => {
    if (logoUrl) {
      setLogoPreview(logoUrl);
    }
  }, [logoUrl]);

  const fetchShopSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setValue('shop_name', data.shop_name);
        setValue('address', data.address || '');
        setValue('phone', data.phone || '');
        setValue('email', data.email || '');
        setValue('tax_id', data.tax_id || '');
        setValue('logo_url', data.logo_url || '');
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูลร้านได้',
        variant: 'destructive'
      });
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('shop-logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ShopSettingsForm) => {
    setLoading(true);
    try {
      let logoUrl = data.logo_url;

      // Upload new logo if selected
      if (logoFile) {
        logoUrl = await handleLogoUpload(logoFile);
        setValue('logo_url', logoUrl);
      }

      const shopData = { ...data, logo_url: logoUrl };

      // Check if settings exist
      const { data: existing } = await supabase
        .from('shop_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('shop_settings')
          .update(shopData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('shop_settings')
          .insert([shopData]);

        if (error) throw error;
      }

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลร้านได้ถูกบันทึกเรียบร้อยแล้ว'
      });

      setLogoFile(null);
    } catch (error) {
      console.error('Error saving shop settings:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setValue('logo_url', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>โลโก้ร้าน</CardTitle>
          <CardDescription>อัพโหลดโลโก้ของร้านค้า</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-32 h-32 object-contain border rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  onClick={removeLogo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="logo-upload"
              />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>เลือกไฟล์</span>
                </Button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Information */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลร้าน</CardTitle>
          <CardDescription>กรอกข้อมูลพื้นฐานของร้าน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shop_name">ชื่อร้าน</Label>
            <Input
              id="shop_name"
              {...register('shop_name', { required: true })}
              placeholder="ใส่ชื่อร้าน"
            />
          </div>

          <div>
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="ใส่ที่อยู่ร้าน"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="02-xxx-xxxx"
              />
            </div>

            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
            <Input
              id="tax_id"
              {...register('tax_id')}
              placeholder="x-xxxx-xxxxx-xx-x"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-coffee-600 hover:bg-coffee-700">
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </form>
  );
};

export default ShopBasicSettings;
