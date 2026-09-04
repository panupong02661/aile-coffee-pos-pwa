import { useState } from 'react';
import { cn } from '@/lib/utils';
import Variant1PillCloud from '@/components/category-bar-preview/Variant1PillCloud';
import Variant2UnderlineTabs from '@/components/category-bar-preview/Variant2UnderlineTabs';
import Variant3IconChips from '@/components/category-bar-preview/Variant3IconChips';
import Variant4SegmentedGlass from '@/components/category-bar-preview/Variant4SegmentedGlass';
import Variant5ColorDots from '@/components/category-bar-preview/Variant5ColorDots';

const CATEGORIES = [
  { id: 'recommended', name: 'เมนูแนะนำ' },
  { id: 'coffee', name: 'กาแฟ' },
  { id: 'tea', name: 'ชา' },
  { id: 'milk', name: 'นม' },
  { id: 'soda', name: 'โซดา' },
  { id: 'dessert', name: 'ขนม' },
  { id: 'food', name: 'อาหาร' },
];

const VARIANTS = [
  { id: 1, name: 'Pill Cloud', desc: 'ปุ่มเมฆลอยนุ่ม เงาเบา กดสลับง่าย', Comp: Variant1PillCloud },
  { id: 2, name: 'Underline Tabs', desc: 'แท็บแนวนอน เส้นใต้เน้นหมวดที่เลือก', Comp: Variant2UnderlineTabs },
  { id: 3, name: 'Icon Chips', desc: 'ไอคอนประกอบชื่อหมวด มีขอบวงแหวน', Comp: Variant3IconChips },
  { id: 4, name: 'Segmented Glass', desc: 'แผงกระจกแบ่งช่วง เน้นปุ่มที่กด', Comp: Variant4SegmentedGlass },
  { id: 5, name: 'Color Dots', desc: 'จุดสีแยกหมวด มินิมอล ดูสะอาดตา', Comp: Variant5ColorDots },
];

export default function CategoryBarPreview() {
  const [active, setActive] = useState(1);
  const [selected, setSelected] = useState('coffee');
  const current = VARIANTS.find((v) => v.id === active)!;
  const Comp = current.Comp;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-foreground">ตัวอย่างดีไซน์แถบเมนูหมวดหมู่ (5 แบบ)</h1>
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

      <div className="p-4 space-y-4">
        <p className="text-sm text-foreground">
          <span className="font-semibold">แบบที่ {current.id}: {current.name}</span>
          <span className="text-muted-foreground"> — {current.desc}</span>
        </p>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <Comp categories={CATEGORIES} selected={selected} onSelect={setSelected} />
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground mb-3">จำลองหน้า POS แบบง่าย</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-card border border-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
