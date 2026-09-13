import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CategoryBarShowcase from '@/components/category-bar-preview/CategoryBarShowcase';

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
  { id: 1, name: 'Index Tabs', desc: 'แท็บสารบัญเส้นตรง พร้อมเลขลำดับ' },
  { id: 2, name: 'Ticket Row', desc: 'ป้ายตั๋วแยกใบ ยกตัวขึ้นเมื่อเลือก' },
  { id: 3, name: 'Featured Lead', desc: 'หมวดแนะนำเป็นจุดนำ แล้วตามด้วยเมนูเส้นบาง' },
  { id: 4, name: 'Two-Level Map', desc: 'แบ่งหมวดเป็นสองระดับแบบแผนผัง' },
  { id: 5, name: 'Mega Directory', desc: 'ช่องสารบัญเต็มความกว้าง มองเห็นครบ' },
  { id: 6, name: 'Market Labels', desc: 'ป้ายกระดาษขอบคมและเงาพิมพ์' },
  { id: 7, name: 'Editorial Strip', desc: 'แถบดำแบบเมนูคาเฟ่สไตล์นิตยสาร' },
  { id: 8, name: 'Search & Browse', desc: 'ช่องค้นหารวมกับหมวดแบบแถวเดียว' },
  { id: 9, name: 'Soft Switchboard', desc: 'แผงสวิตช์เรียบและกดง่าย' },
  { id: 10, name: 'Cafe Contents', desc: 'สารบัญร้านกาแฟพร้อมตัวอักษรกำกับ' },
];

export default function CategoryBarPreview() {
  const [active, setActive] = useState(1);
  const [selected, setSelected] = useState('coffee');
  const current = VARIANTS.find((v) => v.id === active) ?? VARIANTS[0];

  if (!current) return null;

  return (
    <div className="category-preview-body min-h-screen bg-background">
      <header className="border-b-2 border-foreground bg-card px-4 py-4">
        <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Paper &amp; Ink Collection</p>
        <h1 className="category-preview-serif text-xl font-bold text-foreground">ตัวอย่างแถบหมวดหมู่ 10 รูปแบบ</h1>
        <p className="mt-1 text-xs text-muted-foreground">หน้าทดลองเท่านั้น — หน้า POS จริงยังไม่เปลี่ยน</p>
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 posv2-noscroll">
          {VARIANTS.map((v) => (
            <Button
              key={v.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActive(v.id)}
              className={cn(
                'shrink-0 rounded-sm text-xs',
                active === v.id
                  ? 'border-foreground bg-foreground text-background hover:bg-foreground hover:text-background'
                  : 'bg-card text-muted-foreground'
              )}
            >
              {String(v.id).padStart(2, '0')} {v.name}
            </Button>
          ))}
        </div>
      </header>

      <main className="p-3 sm:p-4">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="category-preview-serif text-lg font-bold">แบบ {String(current.id).padStart(2, '0')}</span>
          <span className="text-sm font-semibold">{current.name}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">— {current.desc}</span>
        </div>

        <section aria-label="ตัวอย่างหน้า POS" className="overflow-hidden border border-border bg-background shadow-sm">
          <div className="border-b border-border bg-card p-2 sm:p-3">
            <CategoryBarShowcase categories={CATEGORIES} selected={selected} onSelect={setSelected} variant={active} />
          </div>

          <div className="grid min-h-[590px] grid-cols-1 lg:grid-cols-[1fr_300px]">
            <div className="grid grid-cols-2 content-start gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <article key={i} className="min-h-32 border border-border bg-card p-2">
                  <div className="mb-2 aspect-[4/3] bg-muted" />
                  <div className="h-2.5 w-4/5 bg-foreground/80" />
                  <div className="mt-2 h-2 w-1/3 bg-muted-foreground/40" />
                </article>
              ))}
            </div>
            <aside className="border-t border-border bg-card lg:border-l lg:border-t-0">
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <h2 className="category-preview-serif text-base font-bold">ตะกร้าสินค้า</h2>
                <span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-bold">0</span>
              </div>
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground lg:min-h-[420px]">
                <ShoppingBag className="size-8" />
                <p className="text-xs">ยังไม่มีสินค้าในตะกร้า</p>
              </div>
              <div className="border-t border-border p-4">
                <div className="mb-3 flex justify-between text-sm font-bold"><span>ยอดสุทธิ</span><span>฿0</span></div>
                <Button disabled className="w-full rounded-sm">ชำระเงิน</Button>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
