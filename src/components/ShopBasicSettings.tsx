
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentShop } from '@/hooks/useCurrentShop';
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
  const { shopId, loading: shopLoading } = useCurrentShop();
  
  const { register, handleSubmit, setValue, watch } = useForm<ShopSettingsForm>();
  const logoUrl = watch('logo_url');

  useEffect(() => {
    if (!shopLoading && shopId) {
      fetchShopSettings();
    }
  }, [shopId, shopLoading]);

  useEffect(() => {
    if (logoUrl) {
      setLogoPreview(logoUrl);
    }
  }, [logoUrl]);

  const fetchShopSettings = async () => {
    if (!shopId) return;
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .eq('shop_id', shopId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching shop settings:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลร้านได้',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setValue('shop_name', data.shop_name || '');
        setValue('address', data.address || '');
        setValue('phone', data.phone || '');
        setValue('email', data.email || '');
        setValue('tax_id', data.tax_id || '');
        setValue('logo_url', data.logo_url || '');
      }
    } catch (error) {
      console.error('Unexpected error fetching shop settings:', error);
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

      const shopData = { 
        shop_name: data.shop_name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        tax_id: data.tax_id || null,
        logo_url: logoUrl || null
      };

      // Check if settings exist for this shop
      const { data: existing, error: fetchError } = await supabase
        .from('shop_settings')
        .select('id')
        .eq('shop_id', shopId!)
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing settings:', fetchError);
        throw fetchError;
      }

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('shop_settings')
          .update(shopData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new with shop_id
        const { error } = await supabase
          .from('shop_settings')
          .insert([{ ...shopData, shop_id: shopId }]);

        if (error) throw error;
      }

      // Sync shop name to the shops table so the sidebar/branch name stays consistent
      if (shopId && data.shop_name) {
        const { error: shopSyncError } = await supabase
          .from('shops')
          .update({ shop_name: data.shop_name })
          .eq('id', shopId);
        if (shopSyncError) {
          console.error('Error syncing shop name to shops table:', shopSyncError);
        }
      }

      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลร้านได้ถูกบันทึกเรียบร้อยแล้ว'
      });

      setLogoFile(null);
      // Refresh data
      fetchShopSettings();
    } catch (error: any) {
      console.error('Error saving shop settings:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: error?.message || 'ไม่สามารถบันทึกข้อมูลได้',
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

      {/* ชื่อร้าน */}
      <Card>
        <CardHeader>
          <CardTitle>ชื่อร้าน</CardTitle>
          <CardDescription>ชื่อร้านที่จะแสดงในใบเสร็จ</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="shop_name">ชื่อร้าน</Label>
            <Input
              id="shop_name"
              {...register('shop_name', { required: true })}
              placeholder="ใส่ชื่อร้าน"
            />
          </div>
        </CardContent>
      </Card>

      {/* ที่อยู่ */}
      <Card>
        <CardHeader>
          <CardTitle>ที่อยู่ร้าน</CardTitle>
          <CardDescription>ที่อยู่ที่จะแสดงในใบเสร็จ</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="ใส่ที่อยู่ร้าน"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* เบอร์โทรศัพท์ */}
      <Card>
        <CardHeader>
          <CardTitle>เบอร์โทรศัพท์</CardTitle>
          <CardDescription>เบอร์โทรศัพท์ที่จะแสดงในใบเสร็จ</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="02-xxx-xxxx"
            />
          </div>
        </CardContent>
      </Card>

      {/* อีเมลและข้อมูลภาษี */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลอื่นๆ</CardTitle>
          <CardDescription>อีเมลและเลขประจำตัวผู้เสียภาษี</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@example.com"
            />
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
        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </Button>
      </div>
    </form>
  );
};

export default ShopBasicSettings;
