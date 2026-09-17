import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Settings, Palette, Type, Save, LayoutGrid } from 'lucide-react';
import AddonOption, { ADDON_STYLES, ADDON_STYLE_STORAGE_KEY, getSavedAddonStyleId } from './AddonOption';
import AddonModal from './AddonModal';
import type { MenuItem } from '@/types';
import type { DatabaseAddon } from '@/hooks/useSupabaseData';

interface AddonDisplayConfig {
  fontSize: string;
  fontWeight: string;
  textColor: string;
  backgroundColor: string;
  selectedTextColor: string;
  selectedBackgroundColor: string;
  borderRadius: string;
  minHeight: string;
}

const defaultConfig: AddonDisplayConfig = {
  fontSize: '14',
  fontWeight: 'bold',
  textColor: '#5d4a3f',
  backgroundColor: '#ffffff',
  selectedTextColor: '#ffffff',
  selectedBackgroundColor: '#6f4e37',
  borderRadius: '8',
  minHeight: '52',
};

const previewMenuItem: MenuItem = {
  id: 'addon-preview-menu',
  name: 'ลาเต้เย็น',
  price: 55,
  category_id: 'preview',
  is_available: true,
};

const previewAddons: DatabaseAddon[] = [
  ['sweet-0', 'ไม่หวาน', 0, 'ระดับความหวาน', true, false, 0],
  ['sweet-1', 'หวาน 50%', 0, 'ระดับความหวาน', true, false, 1],
  ['sweet-2', 'หวานปกติ', 0, 'ระดับความหวาน', true, false, 2],
  ['sweet-3', 'หวานมาก', 0, 'ระดับความหวาน', true, false, 3],
  ['top-0', 'ช็อตพิเศษ', 15, 'ท็อปปิ้งเพิ่มเติม', false, true, 0],
  ['top-1', 'วิปครีม', 20, 'ท็อปปิ้งเพิ่มเติม', false, true, 1],
  ['top-2', 'ไข่มุก', 10, 'ท็อปปิ้งเพิ่มเติม', false, true, 2],
  ['top-3', 'เจลลี่', 10, 'ท็อปปิ้งเพิ่มเติม', false, true, 3],
].map(([id, name, price, groupName, isRequired, allowMultiple, sortOrder]) => ({
  id: String(id),
  name: String(name),
  price: Number(price),
  addon_group_id: `group-${groupName}`,
  sort_order: Number(sortOrder),
  is_active: true,
  created_at: '',
  updated_at: '',
  addon_groups: {
    id: `group-${groupName}`,
    name: String(groupName),
    is_required: Boolean(isRequired),
    allow_multiple: Boolean(allowMultiple),
    sort_order: String(groupName) === 'ระดับความหวาน' ? 0 : 1,
  },
}));

const AddonDisplaySettings = () => {
  const [config, setConfig] = useState<AddonDisplayConfig>(defaultConfig);
  const [styleId, setStyleId] = useState<number>(1);
  const [previewStyleId, setPreviewStyleId] = useState<number | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('addonDisplayConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    setStyleId(getSavedAddonStyleId());
  }, []);

  const handleSave = () => {
    localStorage.setItem('addonDisplayConfig', JSON.stringify(config));
    localStorage.setItem(ADDON_STYLE_STORAGE_KEY, styleId.toString());
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    localStorage.removeItem('addonDisplayConfig');
    toast.success('รีเซ็ตการตั้งค่าเรียบร้อยแล้ว');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="w-5 h-5" />
          ตั้งค่าการแสดงผล Add-on
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Style Picker */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            เลือกรูปแบบ Add-on (26 แบบ)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADDON_STYLES.map((s) => {
              const active = styleId === s.id;
              const sweetOptions = [
                { name: 'ไม่หวาน', price: 0 },
                { name: 'หวาน 50%', price: 0 },
                { name: 'หวานปกติ', price: 0 },
                { name: 'หวานมาก', price: 0 },
              ];
              const toppingOptions = [
                { name: 'ช็อตพิเศษ', price: 15 },
                { name: 'วิปครีม', price: 20 },
                { name: 'ไข่มุก', price: 10 },
                { name: 'เจลลี่', price: 10 },
              ];
              const selectedSweet = 1;
              const selectedTopping = 0;
              return (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setStyleId(s.id); setPreviewStyleId(s.id); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setStyleId(s.id);
                      setPreviewStyleId(s.id);
                    }
                  }}
                  className={`text-left rounded-xl border-2 transition-all overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                      : 'border-gray-200 hover:border-border hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className={`flex items-center justify-between px-4 py-2.5 ${active ? 'bg-primary text-white' : 'bg-background text-foreground'}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm">แบบ {s.id}</span>
                      <span className="text-xs font-semibold opacity-90">{s.name}</span>
                    </div>
                    {active && <span className="text-[10px] px-2 py-0.5 bg-white text-foreground rounded-full font-bold">กำลังใช้</span>}
                  </div>

                  {/* Mock modal body */}
                    <div className={`p-4 space-y-3 ${
                    s.id === 22 ? 'bg-[hsl(var(--addon-classic-paper))]' :
                    s.id === 23 ? 'bg-[hsl(var(--addon-pixel-yellow)/0.16)]' :
                    s.id === 24 ? 'bg-[hsl(var(--addon-float-surface))] py-6' :
                    s.id === 25 ? 'bg-[hsl(var(--addon-left-surface))]' :
                    s.id === 26 ? 'bg-[hsl(var(--addon-magazine-paper))]' : 'bg-card'
                  }`}>
                    {/* Menu header */}
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">☕</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">ลาเต้เย็น</div>
                        <div className="text-xs text-muted-foreground">฿ 55</div>
                      </div>
                    </div>

                    {/* Group 1 */}
                      <div className={s.id === 25 ? 'grid grid-cols-[92px_1fr] items-center' : ''}>
                        <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        ระดับความหวาน
                        <span className="text-[10px] text-red-500">*จำเป็น</span>
                      </div>
                        <div className="grid grid-cols-4 gap-1.5">
                        {sweetOptions.map((o, i) => (
                          <AddonOption
                            key={o.name}
                            name={o.name}
                            price={o.price}
                            selected={i === selectedSweet}
                            onClick={() => setStyleId(s.id)}
                            styleId={s.id}
                            config={config}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Group 2 */}
                      <div className={s.id === 25 ? 'grid grid-cols-[92px_1fr] items-center' : ''}>
                      <div className="text-xs font-semibold text-foreground mb-1.5">
                        ท็อปปิ้งเพิ่มเติม
                      </div>
                        <div className={`grid gap-1.5 ${s.id >= 22 && s.id !== 25 ? 'grid-cols-3' : s.id === 25 ? 'grid-cols-4' : 'grid-cols-2'}`}>
                        {toppingOptions.map((o, i) => (
                          <AddonOption
                            key={o.name}
                            name={o.name}
                            price={o.price}
                            selected={i === selectedTopping}
                            onClick={() => setStyleId(s.id)}
                            styleId={s.id}
                            config={config}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description + footer */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground line-clamp-1 pr-2">{s.description}</span>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">รวม ฿ 70</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            * เลือกรูปแบบที่ต้องการแล้วกด "บันทึกการตั้งค่า" ด้านล่าง เพื่อใช้กับหน้าเลือกเมนู
          </p>
        </div>

        <AddonModal
          isOpen={previewStyleId !== null}
          onClose={() => setPreviewStyleId(null)}
          menuItem={previewMenuItem}
          addons={previewAddons}
          onAddToCart={() => undefined}
          styleIdOverride={previewStyleId ?? undefined}
          previewMode
        />

        {/* Typography Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Type className="w-4 h-4" />
            การตั้งค่าตัวอักษร
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ขนาดตัวอักษร (px)</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(config.fontSize)]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, fontSize: value[0].toString() }))}
                  min={10}
                  max={24}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-center text-sm font-medium">{config.fontSize}px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>น้ำหนักตัวอักษร</Label>
              <Select
                value={config.fontWeight}
                onValueChange={(value) => setConfig(prev => ({ ...prev, fontWeight: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">ปกติ</SelectItem>
                  <SelectItem value="medium">กลาง</SelectItem>
                  <SelectItem value="semibold">หนาปานกลาง</SelectItem>
                  <SelectItem value="bold">หนา</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4" />
            การตั้งค่าสี
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>สีตัวอักษร (ปกติ)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.textColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>สีพื้นหลัง (ปกติ)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>สีตัวอักษร (เลือกแล้ว)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config.selectedTextColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, selectedTextColor: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.selectedTextColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, selectedTextColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>สีพื้นหลัง (เลือกแล้ว)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config.selectedBackgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, selectedBackgroundColor: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.selectedBackgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, selectedBackgroundColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Size Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">การตั้งค่าขนาด</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ความสูงขั้นต่ำ (px)</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(config.minHeight)]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, minHeight: value[0].toString() }))}
                  min={40}
                  max={80}
                  step={2}
                  className="flex-1"
                />
                <span className="w-12 text-center text-sm font-medium">{config.minHeight}px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>ความโค้งมุม (px)</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[parseInt(config.borderRadius)]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, borderRadius: value[0].toString() }))}
                  min={0}
                  max={20}
                  step={2}
                  className="flex-1"
                />
                <span className="w-12 text-center text-sm font-medium">{config.borderRadius}px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">ตัวอย่างการแสดงผล</h3>
          <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
            {/* Normal State */}
            <div
              className="flex flex-col items-center justify-center p-2 border rounded cursor-pointer transition-all"
              style={{
                minHeight: `${config.minHeight}px`,
                minWidth: '80px',
                fontSize: `${config.fontSize}px`,
                fontWeight: config.fontWeight === 'normal' ? 400 : config.fontWeight === 'medium' ? 500 : config.fontWeight === 'semibold' ? 600 : 700,
                color: config.textColor,
                backgroundColor: config.backgroundColor,
                borderRadius: `${config.borderRadius}px`,
              }}
            >
              <span>หวาน 50%</span>
            </div>
            
            {/* Selected State */}
            <div
              className="flex flex-col items-center justify-center p-2 border rounded cursor-pointer transition-all"
              style={{
                minHeight: `${config.minHeight}px`,
                minWidth: '80px',
                fontSize: `${config.fontSize}px`,
                fontWeight: config.fontWeight === 'normal' ? 400 : config.fontWeight === 'medium' ? 500 : config.fontWeight === 'semibold' ? 600 : 700,
                color: config.selectedTextColor,
                backgroundColor: config.selectedBackgroundColor,
                borderRadius: `${config.borderRadius}px`,
              }}
            >
              <span>หวาน 100%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            รีเซ็ตค่าเริ่มต้น
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึกการตั้งค่า
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddonDisplaySettings;
