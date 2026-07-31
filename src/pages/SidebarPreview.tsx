import { useState } from 'react';
import { cn } from '@/lib/utils';
import Variant1RailFlyout from '@/components/sidebar-preview/Variant1RailFlyout';
import Variant2TwoPane from '@/components/sidebar-preview/Variant2TwoPane';
import Variant3SearchFirst from '@/components/sidebar-preview/Variant3SearchFirst';
import Variant4CardGroups from '@/components/sidebar-preview/Variant4CardGroups';
import Variant5IconTabsPanel from '@/components/sidebar-preview/Variant5IconTabsPanel';
import Variant6FlatList from '@/components/sidebar-preview/Variant6FlatList';

const VARIANTS = [
  { id: 1, name: 'Rail + Flyout', desc: 'แถบไอคอนแคบ แตะแล้วแผงลอยโผล่ข้าง', Comp: Variant1RailFlyout },
  { id: 2, name: 'Two-Pane', desc: 'สองคอลัมน์ กลุ่มซ้าย รายการขวา', Comp: Variant2TwoPane },
  { id: 3, name: 'Search-First', desc: 'ค้นหาก่อน + โซนใช้บ่อย', Comp: Variant3SearchFirst },
  { id: 4, name: 'Card Groups', desc: 'การ์ดสีประจำหมวด แตะง่ายบน iPad', Comp: Variant4CardGroups },
  { id: 5, name: 'Icon Tabs + Panel', desc: 'แท็บไอคอน + กริด 2 คอลัมน์', Comp: Variant5IconTabsPanel },
  { id: 6, name: 'Minimal Flat', desc: 'ลิสต์เดียวหนาแน่น เห็นครบในตาเดียว', Comp: Variant6FlatList },
];

const SidebarPreview = () => {
  const [active, setActive] = useState(1);
  const current = VARIANTS.find((v) => v.id === active)!;
  const Comp = current.Comp;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">ตัวอย่างดีไซน์ Sidebar (6 แบบ)</h1>
        <p className="text-xs text-muted-foreground">ยังไม่แก้ของจริง — เลือกดูแล้วบอกเลขที่ชอบ</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active === v.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {v.id}. {v.name}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <p className="text-sm text-foreground mb-2">
          <span className="font-semibold">แบบที่ {current.id}: {current.name}</span>
          <span className="text-muted-foreground"> — {current.desc}</span>
        </p>
        <div className="rounded-xl border border-border overflow-hidden bg-background" style={{ height: 620 }}>
          <div className="flex h-full">
            <Comp />
            <div className="flex-1 bg-muted/30 p-6 overflow-hidden">
              <div className="h-8 w-40 rounded bg-muted mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-card border border-border" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarPreview;
