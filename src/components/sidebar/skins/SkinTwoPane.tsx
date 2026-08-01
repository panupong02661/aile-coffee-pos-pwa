import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarSkinProps } from '../menuConfig';
import SidebarUtilityBar from '../SidebarUtilityBar';

/** Skin 2 — Two-Pane Miller columns */
const SkinTwoPane = ({ groups, pathname, shopName, onNavigate }: SidebarSkinProps) => {
  const initial = groups.find((g) => g.items.some((i) => i.path === pathname))?.id ?? groups[0]?.id;
  const [active, setActive] = useState(initial);
  const group = groups.find((g) => g.id === active) ?? groups[0];

  if (!group) return null;

  return (
    <div className="flex h-full bg-card">
      <div className="w-[84px] bg-muted/40 border-r border-border flex flex-col">
        <div className="flex-1 overflow-y-auto py-2">
          {groups.map((g) => {
            const Icon = g.icon;
            const isOn = g.id === group.id;
            return (
              <button
                key={g.id}
                onClick={() => setActive(g.id)}
                className={cn(
                  'w-full px-1 py-2.5 flex flex-col items-center gap-1 transition-colors border-l-2',
                  isOn
                    ? 'border-primary bg-background text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] leading-tight text-center">{g.short}</span>
              </button>
            );
          })}
        </div>
        <SidebarUtilityBar shopName={shopName} compact />
      </div>

      <div className="w-[200px] border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground truncate">{group.label}</p>
          <p className="text-[11px] text-muted-foreground">{group.items.length} รายการ</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
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
    </div>
  );
};

export default SkinTwoPane;
