import { cn } from '@/lib/utils';

interface Cat {
  id: string;
  name: string;
}

interface Props {
  categories: Cat[];
  selected: string;
  onSelect: (id: string) => void;
}

const DOTS = [
  'bg-amber-600',
  'bg-emerald-600',
  'bg-sky-600',
  'bg-rose-600',
  'bg-violet-600',
  'bg-orange-600',
  'bg-teal-600',
];

/** Variant 5 — Color dots + minimal text */
export default function Variant5ColorDots({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((cat, i) => {
        const active = cat.id === selected;
        const dot = DOTS[i % DOTS.length];
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-95 border',
              active
                ? 'bg-card text-foreground border-border shadow-sm'
                : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
            )}
          >
            <span className={cn('w-2.5 h-2.5 rounded-full', dot, active && 'ring-2 ring-offset-1 ring-offset-background ring-primary/40')} />
            <span className="whitespace-nowrap">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
