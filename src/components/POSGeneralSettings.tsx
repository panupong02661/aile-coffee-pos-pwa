import { usePOSSettings, ThemePreset, SidebarStyle, CategoryBarStyle } from '@/hooks/usePOSSettings';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Moon,
  Type,
  Palette,
  Bold,
  Settings,
  Paintbrush,
  Layers,
  GlassWater,
  PanelLeft,
  LayoutGrid,
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

const THEME_PRESETS: { value: ThemePreset; label: string; preview: string; desc: string }[] = [
  { value: 'default', label: 'ค่าเริ่มต้น', preview: 'bg-gradient-to-br from-amber-100 to-orange-100', desc: 'สว่าง คลาสสิก' },
  { value: 'neon-dark', label: 'Neon Dark', preview: 'bg-gradient-to-br from-emerald-900 to-gray-900', desc: 'มืด + เขียวนีออน' },
  { value: 'cyber', label: 'Cyber', preview: 'bg-gradient-to-br from-blue-900 to-slate-900', desc: 'มืด + ฟ้าไซเบอร์' },
  { value: 'glass', label: 'Glass', preview: 'bg-gradient-to-br from-slate-600/50 to-slate-800/50', desc: 'โปร่งใส ปรับได้' },
];

const SIDEBAR_STYLES: { value: SidebarStyle; label: string; desc: string; preview: JSX.Element }[] = [
  {
    value: 'classic',
    label: 'คลาสสิก',
    desc: 'แบบเดิม ย่อ/ขยายได้',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-2 rounded-sm bg-primary/70" />
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
  {
    value: 'rail',
    label: 'Rail + Flyout',
    desc: 'แถบไอคอน + แผงลอย',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-2.5 rounded-sm bg-primary/70" />
        <div className="w-4 rounded-sm bg-primary/25" />
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
  {
    value: 'two-pane',
    label: 'Two-Pane',
    desc: 'กลุ่มซ้าย รายการขวา',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-2 rounded-sm bg-primary/70" />
        <div className="w-5 rounded-sm bg-primary/30" />
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
  {
    value: 'search',
    label: 'Search-First',
    desc: 'ค้นหา + ใช้บ่อย',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-7 rounded-sm bg-primary/40 flex flex-col p-[2px] gap-[2px]">
          <div className="h-1 rounded-sm bg-primary/70" />
          <div className="h-1 rounded-sm bg-primary/50" />
        </div>
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
  {
    value: 'cards',
    label: 'Card Groups',
    desc: 'การ์ดใหญ่ แตะง่าย',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-7 flex flex-col gap-[2px]">
          <div className="flex-1 rounded-sm bg-primary/50" />
          <div className="flex-1 rounded-sm bg-primary/30" />
        </div>
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
  {
    value: 'icon-tabs',
    label: 'Icon Tabs',
    desc: 'แท็บไอคอน + กริด',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-2 rounded-sm bg-primary/70" />
        <div className="w-7 grid grid-cols-2 gap-[2px]">
          <div className="rounded-sm bg-primary/30" />
          <div className="rounded-sm bg-primary/30" />
          <div className="rounded-sm bg-primary/30" />
          <div className="rounded-sm bg-primary/30" />
        </div>
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
  {
    value: 'flat',
    label: 'Minimal Flat',
    desc: 'ลิสต์เดียว เห็นครบ',
    preview: (
      <div className="flex h-8 w-full gap-[2px]">
        <div className="w-6 rounded-sm bg-primary/40 flex flex-col justify-center gap-[2px] p-[2px]">
          <div className="h-[2px] rounded-sm bg-primary/80" />
          <div className="h-[2px] rounded-sm bg-primary/60" />
          <div className="h-[2px] rounded-sm bg-primary/60" />
        </div>
        <div className="flex-1 rounded-sm bg-muted" />
      </div>
    ),
  },
];

const CATEGORY_BAR_STYLES: { value: CategoryBarStyle; label: string; desc: string }[] = [
  { value: 0, label: 'แบบเดิม', desc: 'ปุ่มมนเรียงแถว' },
  { value: 1, label: 'Index Tabs', desc: 'แท็บสารบัญ + เลขลำดับ' },
  { value: 2, label: 'Ticket Row', desc: 'ป้ายตั๋วแยกใบ' },
  { value: 3, label: 'Featured Lead', desc: 'หมวดแนะนำนำหน้า' },
  { value: 4, label: 'Two-Level Map', desc: 'สองระดับแบบแผนผัง' },
  { value: 5, label: 'Mega Directory', desc: 'สารบัญเต็มความกว้าง' },
  { value: 6, label: 'Market Labels', desc: 'ป้ายกระดาษขอบคม' },
  { value: 7, label: 'Editorial Strip', desc: 'แถบดำสไตล์นิตยสาร' },
  { value: 8, label: 'Browse Row', desc: 'หมวดแบบแถวเดียวกะทัดรัด' },
  { value: 9, label: 'Soft Switchboard', desc: 'แผงสวิตช์เรียบ' },
  { value: 10, label: 'Cafe Contents', desc: 'สารบัญร้านกาแฟ' },
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

const TEXT_COLOR_OPTIONS = [
  { value: 'default', label: 'อัตโนมัติ', color: '' },
  { value: '0 0% 100%', label: 'ขาว', color: 'hsl(0, 0%, 100%)' },
  { value: '0 0% 85%', label: 'เทาอ่อน', color: 'hsl(0, 0%, 85%)' },
  { value: '45 100% 70%', label: 'เหลือง', color: 'hsl(45, 100%, 70%)' },
  { value: '35 90% 65%', label: 'ทอง', color: 'hsl(35, 90%, 65%)' },
  { value: '25 80% 60%', label: 'ส้ม', color: 'hsl(25, 80%, 60%)' },
  { value: '150 60% 65%', label: 'เขียว', color: 'hsl(150, 60%, 65%)' },
  { value: '180 50% 70%', label: 'ฟ้าอ่อน', color: 'hsl(180, 50%, 70%)' },
  { value: '210 60% 75%', label: 'ฟ้า', color: 'hsl(210, 60%, 75%)' },
  { value: '270 50% 75%', label: 'ม่วง', color: 'hsl(270, 50%, 75%)' },
  { value: '330 60% 75%', label: 'ชมพู', color: 'hsl(330, 60%, 75%)' },
  { value: '0 70% 70%', label: 'แดง', color: 'hsl(0, 70%, 70%)' },
  { value: '60 30% 90%', label: 'ครีม', color: 'hsl(60, 30%, 90%)' },
];

const POSGeneralSettings = () => {
  const {
    animationsEnabled,
    darkModeEnabled,
    fontSize,
    fontWeight,
    primaryColor,
    textColor,
    themePreset,
    glassOpacity,
    sidebarStyle,
    categoryBarStyle,
    setAnimationsEnabled,
    setDarkModeEnabled,
    setFontSize,
    setFontWeight,
    setPrimaryColor,
    setTextColor,
    setThemePreset,
    setGlassOpacity,
    setSidebarStyle,
    setCategoryBarStyle,
  } = usePOSSettings();

  return (
    <div className="px-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
        <Settings className="w-3.5 h-3.5" />
        ตั้งค่าทั่วไป POS
      </h3>

      <div className="space-y-2">
        {/* Sidebar Style */}
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <PanelLeft className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">รูปแบบเมนูหลัก (Sidebar)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SIDEBAR_STYLES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSidebarStyle(opt.value)}
                className={cn(
                  'flex flex-col items-start gap-1 p-2 rounded-lg transition-all text-left text-[10px] border',
                  sidebarStyle === opt.value
                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                    : 'border-border hover:bg-accent'
                )}
              >
                <div className="w-full rounded-md border border-border/60 bg-background p-[3px]">
                  {opt.preview}
                </div>
                <span className="text-foreground font-medium">{opt.label}</span>
                <span className="text-muted-foreground leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Bar Style */}
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">รูปแบบแถบหมวดหมู่ (POS)</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORY_BAR_STYLES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategoryBarStyle(opt.value)}
                className={cn(
                  'flex flex-col items-start gap-0.5 p-2 rounded-lg transition-all text-left text-[10px] border',
                  categoryBarStyle === opt.value
                    ? 'ring-2 ring-primary border-primary bg-primary/5'
                    : 'border-border hover:bg-accent'
                )}
              >
                <span className="text-foreground font-medium">{opt.label}</span>
                <span className="text-muted-foreground leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Presets */}
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">ธีม</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setThemePreset(preset.value)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-[10px]',
                  themePreset === preset.value
                    ? 'ring-2 ring-primary scale-105'
                    : 'hover:bg-accent'
                )}
              >
                <div className={cn('w-full h-6 rounded-md border border-border', preset.preview)} />
                <span className="text-foreground font-medium">{preset.label}</span>
                <span className="text-muted-foreground leading-tight">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Glass Opacity Slider (only for glass theme) */}
        {themePreset === 'glass' && (
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <GlassWater className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">ความทึบ</span>
              <span className="text-xs text-muted-foreground ml-auto">{Math.round(glassOpacity * 100)}%</span>
            </div>
            <Slider
              value={[glassOpacity]}
              min={0.1}
              max={0.9}
              step={0.05}
              onValueChange={([v]) => setGlassOpacity(v)}
              className="w-full"
            />
          </div>
        )}

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

        <Separator className="my-1.5" />
        <div className="px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Paintbrush className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">สีตัวอักษร</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {TEXT_COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTextColor(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all text-[9px]',
                  textColor === opt.value
                    ? 'ring-2 ring-primary scale-110'
                    : 'hover:bg-accent hover:scale-105'
                )}
              >
                <div
                  className="w-7 h-7 rounded-full border-2 border-border shadow-sm"
                  style={{
                    backgroundColor: opt.color || 'transparent',
                    background: opt.value === 'default'
                      ? 'linear-gradient(135deg, hsl(0,0%,100%) 50%, hsl(220,15%,15%) 50%)'
                      : undefined,
                  }}
                />
                <span className="text-muted-foreground leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSGeneralSettings;
