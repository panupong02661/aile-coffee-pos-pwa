import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { previewMenuGroups } from './menuData';
import { Coffee } from 'lucide-react';

/** Variant 1 — Rail + Flyout */
export default function Variant1RailFlyout() {
  const [open, setOpen] = useState<string | null>(null);
  const activeGroup = previewMenuGroups.find((g) => g.id === open);

  return (
    <div className="relative flex h-full" onMouseLeave={() => setOpen(null)}>
      <div className="w-16 h-full bg-card border-r border-border flex flex-col items-center py-3 gap-1">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Coffee className="w-5 h-5 text-primary" />
        </div>
        {previewMenuGroups.map((g) => {
          const Icon = g.icon;
          const isOn = open === g.id;
          return (
            <button
              key={g.id}
              onMouseEnter={() => setOpen(g.id)}
              onClick={() => setOpen(isOn ? null : g.id)}
              className={cn(
                'relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
                isOn ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              {isOn && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-full bg-primary" />}
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {activeGroup && (
        <div className="absolute left-16 top-3 z-20 w-60 rounded-xl border border-border bg-popover shadow-xl p-2 animate-in fade-in slide-in-from-left-2">
          <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{activeGroup.label}</p>
          <div className="space-y-0.5">
            {activeGroup.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
