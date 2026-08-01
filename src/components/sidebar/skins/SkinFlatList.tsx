import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarSkinProps } from '../menuConfig';
import SidebarUtilityBar from '../SidebarUtilityBar';

/** Skin 6 — Minimal dense flat list */
const SkinFlatList = ({ groups, pathname, shopName, onNavigate }: SidebarSkinProps) => (
  <div className="w-60 h-full bg-card border-r border-border flex flex-col">
    <div className="px-4 py-3 border-b border-border flex-shrink-0">
      <p className="text-sm font-semibold tracking-tight text-foreground truncate">{shopName}</p>
    </div>
    <div className="flex-1 overflow-y-auto py-1">
      {groups.map((g) => (
        <div key={g.id}>
          <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
            {g.label}
          </p>
          {g.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-2.5 pl-4 pr-3 py-[7px] text-[13px] border-l-2 transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-transparent text-foreground/80 hover:text-foreground hover:bg-accent/60 hover:border-primary'
                )}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
    <SidebarUtilityBar shopName={shopName} />
  </div>
);

export default SkinFlatList;
