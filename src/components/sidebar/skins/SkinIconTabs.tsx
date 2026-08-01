import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarSkinProps } from '../menuConfig';
import SidebarUtilityBar from '../SidebarUtilityBar';

/** Skin 5 — Icon tabs + wide grid panel */
const SkinIconTabs = ({ groups, pathname, shopName, onNavigate }: SidebarSkinProps) => {
  const initial = groups.find((g) => g.items.some((i) => i.path === pathname))?.id ?? groups[0]?.id;
  const [active, setActive] = useState(initial);
  const group = groups.find((g) => g.id === active) ?? groups[0];

  if (!group) return null;

  return (
    <div className="flex h-full">
      <div className="w-14 bg-foreground/[0.04] dark:bg-foreground/[0.06] border-r border-border flex flex-col items-center">
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-0.5 w-full">
          {groups.map((g) => {
            const Icon = g.icon;
            const isOn = g.id === group.id;
            return (
              <button
                key={g.id}
                onClick={() => setActive(g.id)}
                title={g.label}
                className={cn(
                  'relative w-12 h-12 flex items-center justify-center transition-colors flex-shrink-0',
                  isOn ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isOn && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />}
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
        <SidebarUtilityBar shopName={shopName} compact className="w-full" />
      </div>

      <div className="w-[240px] bg-card border-r border-border flex flex-col">
        <div className="px-4 pt-5 pb-3">
          <h3 className="text-lg font-bold text-foreground leading-tight">{group.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">เลือกเมนูที่ต้องการ</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex flex-col gap-2 p-3 rounded-lg border transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/70 hover:border-primary hover:bg-accent/50 text-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5', !isActive && 'text-primary')} />
                  <span className="text-xs font-medium leading-snug">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinIconTabs;
