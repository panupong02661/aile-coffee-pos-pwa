import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSkinProps } from '../menuConfig';
import SidebarUtilityBar from '../SidebarUtilityBar';

/** Skin 1 — Rail + Flyout */
const SkinRailFlyout = ({ groups, pathname, shopName, onNavigate }: SidebarSkinProps) => {
  const [open, setOpen] = useState<string | null>(null);
  const activeGroup = groups.find((g) => g.id === open);
  const rootRef = useRef<HTMLDivElement>(null);

  // ปิดเมนูย่อยเมื่อคลิกนอกพื้นที่ หรือกด Escape (ไม่ปิดเมื่อเลื่อนเมาส์ออก)
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex h-full">
      <div className="w-16 h-full bg-card border-r border-border flex flex-col items-center py-3 gap-1">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2 flex-shrink-0">
          <Coffee className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-1">
          {groups.map((g) => {
            const Icon = g.icon;
            const isOn = open === g.id;
            const hasActive = g.items.some((i) => i.path === pathname);
            return (
              <button
                key={g.id}
                onMouseEnter={() => setOpen(g.id)}
                onClick={() => setOpen(isOn ? null : g.id)}
                title={g.label}
                className={cn(
                  'relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0',
                  isOn || hasActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
        <SidebarUtilityBar shopName={shopName} compact className="w-full border-t-0" />
      </div>

      {activeGroup && (
        <div className="absolute left-16 top-3 z-20 w-60 max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-popover shadow-xl p-2 animate-in fade-in slide-in-from-left-2">
          <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{activeGroup.label}</p>
          <div className="space-y-0.5">
            {activeGroup.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setOpen(null);
                    onNavigate();
                  }}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinRailFlyout;
