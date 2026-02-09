import { usePOSSettings } from '@/hooks/usePOSSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Moon,
  Type,
  Palette,
  Bold,
  Settings,
} from 'lucide-react';

const COLOR_PRESETS = [
  { label: 'กาแฟ', hue: '25', color: 'hsl(25, 60%, 35%)' },
  { label: 'ทอง', hue: '40', color: 'hsl(40, 60%, 35%)' },
  { label: 'เขียว', hue: '150', color: 'hsl(150, 50%, 35%)' },
  { label: 'ฟ้า', hue: '210', color: 'hsl(210, 60%, 35%)' },
  { label: 'ม่วง', hue: '270', color: 'hsl(270, 50%, 40%)' },
  { label: 'ชมพู', hue: '340', color: 'hsl(340, 55%, 45%)' },
  { label: 'ส้ม', hue: '15', color: 'hsl(15, 65%, 45%)' },
  { label: 'แดง', hue: '0', color: 'hsl(0, 60%, 40%)' },
];

const FONT_SIZE_OPTIONS = [
  { value: 'small' as const, label: 'เล็ก', sample: 'text-xs' },
  { value: 'medium' as const, label: 'กลาง', sample: 'text-sm' },
  { value: 'large' as const, label: 'ใหญ่', sample: 'text-base' },
];

const FONT_WEIGHT_OPTIONS = [
  { value: 'light' as const, label: 'บาง', sample: 'font-light' },
  { value: 'normal' as const, label: 'ปกติ', sample: 'font-normal' },
  { value: 'bold' as const, label: 'หนา', sample: 'font-bold' },
];

const POSGeneralSettings = () => {
  const {
    animationsEnabled,
    darkModeEnabled,
    fontSize,
    fontWeight,
    primaryColor,
    setAnimationsEnabled,
    setDarkModeEnabled,
    setFontSize,
    setFontWeight,
    setPrimaryColor,
  } = usePOSSettings();

  return (
    <div className="px-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
        <Settings className="w-3.5 h-3.5" />
        ตั้งค่าทั่วไป POS
      </h3>

      <div className="space-y-2">
        {/* Animation Toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-foreground">แอนิเมชัน</span>
          </div>
          <Switch
            checked={animationsEnabled}
            onCheckedChange={setAnimationsEnabled}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-foreground">โหมดมืด POS</span>
          </div>
          <Switch
            checked={darkModeEnabled}
            onCheckedChange={setDarkModeEnabled}
            className="data-[state=checked]:bg-indigo-500"
          />
        </div>

        <Separator className="my-1.5" />

        {/* Primary Color */}
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">สีหลัก</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hue}
                onClick={() => setPrimaryColor(preset.hue)}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all text-[10px]',
                  primaryColor === preset.hue
                    ? 'ring-2 ring-primary bg-primary/10 scale-105'
                    : 'hover:bg-accent'
                )}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-muted-foreground">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator className="my-1.5" />

        {/* Font Size */}
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">ขนาดตัวอักษร</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {FONT_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                className={cn(
                  'py-1.5 px-2 rounded-lg text-center transition-all',
                  opt.sample,
                  fontSize === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background text-foreground hover:bg-accent'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Bold className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">น้ำหนักตัวอักษร</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {FONT_WEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontWeight(opt.value)}
                className={cn(
                  'py-1.5 px-2 rounded-lg text-center text-sm transition-all',
                  opt.sample,
                  fontWeight === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background text-foreground hover:bg-accent'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSGeneralSettings;
