import { useMemo, useState } from 'react';
import { Search, LayoutGrid, Coffee, BarChart3, Settings, Users } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import PosV2CategoryBar from '@/components/preview/PosV2CategoryBar';
import PosV2MenuCard, { PosV2Item } from '@/components/preview/PosV2MenuCard';
import PosV2Cart, { PosV2CartLine } from '@/components/preview/PosV2Cart';

const NAV = [LayoutGrid, Coffee, Users, BarChart3, Settings];

export default function PosV2() {
  const { categories, menuItems, loading } = useSupabaseData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<PosV2CartLine[]>([]);

  const cats = useMemo(
    () => [{ id: 'all', name: 'ทั้งหมด' }, ...categories.map((c) => ({ id: c.id, name: c.name }))],
    [categories]
  );

  const items: PosV2Item[] = useMemo(
    () =>
      menuItems
        .filter((m) => selectedCategory === 'all' || m.category_id === selectedCategory)
        .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()))
        .map((m) => ({
          id: m.id,
          name: m.name,
          price: Number(m.price),
          image: m.image_url || undefined,
          description: m.description && m.description !== m.name ? m.description : undefined,
        })),
    [menuItems, selectedCategory, search]
  );

  const qtyOf = (id: string) => lines.find((l) => l.item.id === id)?.qty ?? 0;

  const add = (item: PosV2Item) =>
    setLines((prev) =>
      prev.some((l) => l.item.id === item.id)
        ? prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { item, qty: 1 }]
    );

  const inc = (id: string) =>
    setLines((prev) => prev.map((l) => (l.item.id === id ? { ...l, qty: l.qty + 1 } : l)));

  const dec = (id: string) =>
    setLines((prev) =>
      prev.flatMap((l) =>
        l.item.id === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l]
      )
    );

  return (
    <div
      className="flex overflow-hidden bg-[hsl(var(--posv2-surface))]"
      style={{ height: '100svh' }}
    >
      {/* Left rail */}
      <aside className="hidden w-[76px] shrink-0 flex-col items-center gap-3 py-6 md:flex">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--posv2-ink))] text-lg font-black text-[hsl(var(--posv2-card))]">
          A
        </div>
        {NAV.map((Icon, i) => (
          <button
            key={i}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-90 ${
              i === 0
                ? 'bg-[hsl(var(--posv2-card))] text-[hsl(var(--posv2-accent))] shadow-[var(--posv2-shadow-soft)]'
                : 'text-[hsl(var(--posv2-ink-soft))] hover:bg-[hsl(var(--posv2-card))]'
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col gap-4 py-6 pl-3 pr-3 md:pl-0">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--posv2-ink))]">
              เมนูสินค้า
            </h1>
            <p className="text-sm text-[hsl(var(--posv2-ink-soft))]">แตะเพื่อเพิ่มลงตะกร้า</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--posv2-ink-soft))]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเมนู..."
              className="w-full rounded-2xl bg-[hsl(var(--posv2-card))] py-3 pl-11 pr-4 text-sm text-[hsl(var(--posv2-ink))] shadow-[var(--posv2-shadow-soft)] outline-none placeholder:text-[hsl(var(--posv2-ink-soft))] focus:ring-2 focus:ring-[hsl(var(--posv2-accent)/0.35)]"
            />
          </div>
        </header>

        <PosV2CategoryBar
          categories={cats}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <div className="min-h-0 flex-1 overflow-y-auto pb-2 pr-1">
          {loading && items.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-3xl bg-[hsl(var(--posv2-card))]"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-[hsl(var(--posv2-ink-soft))]">
              ไม่พบเมนูที่ค้นหา
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((item) => (
                <PosV2MenuCard key={item.id} item={item} qty={qtyOf(item.id)} onAdd={add} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart */}
      <div className="hidden w-[380px] shrink-0 py-6 pl-3 pr-4 lg:block">
        <PosV2Cart lines={lines} onInc={inc} onDec={dec} onClear={() => setLines([])} />
      </div>
    </div>
  );
}
