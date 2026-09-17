import { useRef, useState } from 'react';
import {
  Apple, Beef, Candy, Cherry, CircleDot, Coffee, Cookie, CupSoda,
  Citrus, Droplets, Flame, GlassWater, Grape, IceCreamBowl, Leaf,
  Milk, Nut, PackagePlus, Pizza, Salad, Sandwich, Sparkles, Star,
  UtensilsCrossed, Upload, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageCropper from '@/components/ImageCropper';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type AddonMediaType = 'none' | 'icon' | 'image';

const ADDON_ICON_MAP = {
  Coffee, CupSoda, GlassWater, Milk, Droplets, IceCreamBowl, Candy, Cookie,
  Apple, Cherry, Citrus, Grape, Leaf, Nut, Beef, Pizza, Salad, Sandwich,
  Flame, Sparkles, Star, CircleDot, PackagePlus, UtensilsCrossed,
} as const;

export type AddonIconName = keyof typeof ADDON_ICON_MAP;

export const AddonMedia = ({
  mediaType,
  iconName,
  imageUrl,
  className,
  imageClassName,
}: {
  mediaType?: string | null;
  iconName?: string | null;
  imageUrl?: string | null;
  className?: string;
  imageClassName?: string;
}) => {
  if (mediaType === 'image' && imageUrl) {
    return <img src={imageUrl} alt="" className={cn('object-cover', imageClassName ?? 'h-6 w-6 rounded-md', className)} />;
  }
  const IconComponent = iconName && iconName in ADDON_ICON_MAP
    ? ADDON_ICON_MAP[iconName as AddonIconName]
    : null;
  if (mediaType !== 'icon' || !IconComponent) return null;
  return <IconComponent aria-hidden="true" className={cn('h-5 w-5 shrink-0', className)} />;
};

interface AddonMediaFieldProps {
  mediaType: AddonMediaType;
  iconName: string;
  imageUrl: string;
  onChange: (value: { media_type: AddonMediaType; icon_name: string; image_url: string }) => void;
  uploadFolder: 'addons' | 'addon-groups';
}

const AddonMediaField = ({ mediaType, iconName, imageUrl, onChange, uploadFolder }: AddonMediaFieldProps) => {
  const [sourceImage, setSourceImage] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const chooseType = (nextType: AddonMediaType) => {
    onChange({
      media_type: nextType,
      icon_name: nextType === 'icon' ? iconName : '',
      image_url: nextType === 'image' ? imageUrl : '',
    });
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'ไฟล์ไม่ถูกต้อง', description: 'รองรับเฉพาะ JPG, PNG และ WebP', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'ไฟล์ใหญ่เกินไป', description: 'กรุณาเลือกรูปขนาดไม่เกิน 5 MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setSourceImage(reader.result);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadCroppedImage = async (dataUrl: string) => {
    setUploading(true);
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const path = `${uploadFolder}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage.from('menu-images').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('menu-images').getPublicUrl(path);
      onChange({ media_type: 'image', icon_name: '', image_url: data.publicUrl });
      toast({ title: 'อัปโหลดรูปสำเร็จ', description: 'รูปที่ปรับแต่งพร้อมใช้งานแล้ว' });
    } catch (error) {
      console.error('Add-on image upload failed:', error);
      toast({ title: 'อัปโหลดไม่สำเร็จ', description: 'กรุณาลองใหม่อีกครั้ง', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const matchingIcons = Object.keys(ADDON_ICON_MAP).filter(name =>
    name.toLowerCase().includes(iconSearch.trim().toLowerCase())
  ) as AddonIconName[];

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <Label>รูปหรือไอคอน</Label>
      <div className="grid grid-cols-3 gap-2">
        {([
          ['none', 'ไม่ใช้'],
          ['icon', 'เลือกไอคอน'],
          ['image', 'อัปโหลดรูป'],
        ] as const).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={mediaType === value ? 'default' : 'outline'}
            onClick={() => chooseType(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {mediaType === 'icon' && (
        <div className="space-y-2">
          <Input
            value={iconSearch}
            onChange={event => setIconSearch(event.target.value.slice(0, 40))}
            placeholder="ค้นหาไอคอน เช่น Coffee"
            maxLength={40}
          />
          <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto p-1">
            {matchingIcons.map(name => {
              const Icon = ADDON_ICON_MAP[name];
              return (
                <Button
                  key={name}
                  type="button"
                  variant={iconName === name ? 'default' : 'outline'}
                  size="icon"
                  className="h-10 w-10"
                  title={name}
                  onClick={() => onChange({ media_type: 'icon', icon_name: name, image_url: '' })}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {mediaType === 'image' && (
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative shrink-0">
              <img src={imageUrl} alt="ตัวอย่าง Add-on" className="h-24 w-24 rounded-md border object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                onClick={() => onChange({ media_type: 'image', icon_name: '', image_url: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground">
              <Upload className="h-6 w-6" />
            </div>
          )}
          <div className="space-y-2">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
            <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'กำลังอัปโหลด...' : imageUrl ? 'เปลี่ยนรูป' : 'เลือกรูป'}
            </Button>
            {imageUrl && (
              <Button type="button" variant="ghost" onClick={() => { setSourceImage(imageUrl); setCropOpen(true); }}>
                ปรับแต่งรูปเดิม
              </Button>
            )}
          </div>
        </div>
      )}

      <ImageCropper
        isOpen={cropOpen}
        onClose={() => setCropOpen(false)}
        onCrop={uploadCroppedImage}
        imageSrc={sourceImage}
      />
    </div>
  );
};

export default AddonMediaField;