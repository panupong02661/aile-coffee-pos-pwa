import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { previewMenuGroups, allPreviewItems } from './menuData';

const FAVORITES = ['pos', 'dashboard', 'menu', 'reports', 'members'];

/** Variant 3 — Search-first command list */
export default function Variant3SearchFirst() {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return null;
    const s = q.trim().toLowerCase();
    return allPreviewItems.filter((i) => i.label.toLowerCase().includes(s));
  }, [q]);

  const favItems = allPreviewItems.filter((i) => FAVORITES.includes(i.id));

  return (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเมนู..."
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted/60 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {results ? (
          <div className="space-y-0.5">
            <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              ผลการค้นหา ({results.length})
            </p>
            {results.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} to={item.path} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-accent">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground truncate">{item.groupLabel}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <>
            <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3" /> ใช้บ่อย
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {favItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="flex flex-col items-start gap-1 p-2 rounded-lg bg-muted/50 hover:bg-accent text-xs"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="truncate w-full">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {previewMenuGroups.map((g) => (
              <div key={g.id} className="mb-2">
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">{g.label}</p>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} to={item.path} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-accent">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
