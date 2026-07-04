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

const AddonDisplaySettings = () => {
  const [config, setConfig] = useState<AddonDisplayConfig>(defaultConfig);
  const [styleId, setStyleId] = useState<number>(1);

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
        <CardTitle className="flex items-center gap-2 text-coffee-800">
          <Settings className="w-5 h-5" />
          ตั้งค่าการแสดงผล Add-on
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Style Picker */}
        <div className="space-y-4">
          <h3 className="font-semibold text-coffee-700 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            เลือกรูปแบบ Add-on (8 แบบ)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ADDON_STYLES.map((s) => {
              const active = styleId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyleId(s.id)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    active
                      ? 'border-coffee-600 bg-coffee-50 ring-2 ring-coffee-300'
                      : 'border-gray-200 hover:border-coffee-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-coffee-800">แบบ {s.id}</span>
                    {active && <span className="text-[10px] px-2 py-0.5 bg-coffee-600 text-white rounded-full">กำลังใช้</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <AddonOption
                      name="หวาน 50%"
                      price={0}
                      selected={false}
                      onClick={() => setStyleId(s.id)}
                      styleId={s.id}
                      config={config}
                    />
                    <AddonOption
                      name="ช็อตพิเศษ"
                      price={15}
                      selected={true}
                      onClick={() => setStyleId(s.id)}
                      styleId={s.id}
                      config={config}
                    />
                  </div>
                  <div className="text-xs font-semibold text-coffee-700">{s.name}</div>
                  <div className="text-[11px] text-coffee-500 line-clamp-2">{s.description}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-coffee-500">
            * เลือกรูปแบบที่ต้องการแล้วกด "บันทึกการตั้งค่า" ด้านล่าง เพื่อใช้กับหน้าเลือกเมนู
          </p>
        </div>

        {/* Typography Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-coffee-700 flex items-center gap-2">
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
          <h3 className="font-semibold text-coffee-700 flex items-center gap-2">
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
          <h3 className="font-semibold text-coffee-700">การตั้งค่าขนาด</h3>
          
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
          <h3 className="font-semibold text-coffee-700">ตัวอย่างการแสดงผล</h3>
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
            className="flex-1 bg-coffee-600 hover:bg-coffee-700"
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
