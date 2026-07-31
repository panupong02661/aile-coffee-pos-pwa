import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { previewMenuGroups } from './menuData';

/** Variant 5 — Icon tabs + wide grid panel */
export default function Variant5IconTabsPanel() {
  const [active, setActive] = useState(previewMenuGroups[0].id);
  const group = previewMenuGroups.find((g) => g.id === active)!;

  return (
    <div className="flex h-full">
      <div className="w-14 bg-foreground/[0.04] dark:bg-foreground/[0.06] border-r border-border flex flex-col items-center py-2 gap-0.5 overflow-y-auto">
        {previewMenuGroups.map((g) => {
          const Icon = g.icon;
          const isOn = g.id === active;
          return (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              title={g.label}
              className={cn(
                'relative w-12 h-12 flex items-center justify-center transition-colors',
                isOn ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isOn && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />}
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      <div className="w-[300px] bg-card border-r border-border flex flex-col">
        <div className="px-4 pt-5 pb-3">
          <h3 className="text-xl font-bold text-foreground leading-tight">{group.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">เลือกเมนูที่ต้องการ</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex flex-col gap-2 p-3 rounded-lg border border-border/70 hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-foreground leading-snug">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
