import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSkinProps } from '../menuConfig';
import SidebarUtilityBar from '../SidebarUtilityBar';

const FAVORITES = ['pos', 'dashboard', 'menu', 'reports', 'members'];

/** Skin 3 — Search-first command list */
const SkinSearchFirst = ({ groups, pathname, shopName, onNavigate }: SidebarSkinProps) => {
  const [q, setQ] = useState('');

  const allItems = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => ({ ...i, groupLabel: g.label }))),
    [groups]
  );

  const results = useMemo(() => {
    if (!q.trim()) return null;
    const s = q.trim().toLowerCase();
    return allItems.filter((i) => i.label.toLowerCase().includes(s));
  }, [q, allItems]);

  const favItems = allItems.filter((i) => FAVORITES.includes(i.id));

  const itemClass = (path: string) =>
    cn(
      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
      pathname === path ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
    );

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
                <Link key={item.id} to={item.path} onClick={onNavigate} className={itemClass(item.path)}>
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto text-[10px] opacity-60 truncate">{item.groupLabel}</span>
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
                    onClick={onNavigate}
                    className={cn(
                      'flex flex-col items-start gap-1 p-2 rounded-lg text-xs transition-colors',
                      pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-accent text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate w-full">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {groups.map((g) => (
              <div key={g.id} className="mb-2">
                <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">{g.label}</p>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} to={item.path} onClick={onNavigate} className={itemClass(item.path)}>
                      <Icon className="w-3.5 h-3.5 opacity-80" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      <SidebarUtilityBar shopName={shopName} />
    </div>
  );
};

export default SkinSearchFirst;
