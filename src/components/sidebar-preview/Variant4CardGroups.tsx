import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { previewMenuGroups } from './menuData';
import { ChevronDown } from 'lucide-react';

const TONES = [
  'bg-primary/12 text-primary',
  'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  'bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400',
  'bg-rose-500/12 text-rose-600 dark:text-rose-400',
  'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
  'bg-teal-500/12 text-teal-600 dark:text-teal-400',
  'bg-orange-500/12 text-orange-600 dark:text-orange-400',
  'bg-slate-500/12 text-slate-600 dark:text-slate-300',
];

/** Variant 4 — Soft colored card groups (touch friendly) */
export default function Variant4CardGroups() {
  const [open, setOpen] = useState<string[]>(['main']);
  const toggle = (id: string) =>
    setOpen((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="w-[272px] h-full bg-background border-r border-border overflow-y-auto p-3 space-y-2">
      {previewMenuGroups.map((g, i) => {
        const Icon = g.icon;
        const isOpen = open.includes(g.id);
        const tone = TONES[i % TONES.length];
        return (
          <div key={g.id} className="rounded-2xl bg-card border border-border/70 overflow-hidden">
            <button
              onClick={() => toggle(g.id)}
              className="w-full flex items-center gap-3 p-3 text-left"
            >
              <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center', tone)}>
                <Icon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-foreground truncate">{g.label}</span>
                <span className="block text-[11px] text-muted-foreground">{g.items.length} รายการ</span>
              </span>
              <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div className="px-3 pb-3 space-y-1">
                {g.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-accent text-sm text-foreground transition-colors"
                    >
                      <ItemIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
