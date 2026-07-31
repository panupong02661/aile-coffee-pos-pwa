import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { previewMenuGroups } from './menuData';

/** Variant 2 — Two-Pane Miller columns */
export default function Variant2TwoPane() {
  const [active, setActive] = useState(previewMenuGroups[1].id);
  const group = previewMenuGroups.find((g) => g.id === active)!;

  return (
    <div className="flex h-full">
      <div className="w-[84px] bg-muted/40 border-r border-border py-2 overflow-y-auto">
        {previewMenuGroups.map((g) => {
          const Icon = g.icon;
          const isOn = g.id === active;
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

      <div className="w-56 bg-card border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">{group.label}</p>
          <p className="text-[11px] text-muted-foreground">{group.items.length} รายการ</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
