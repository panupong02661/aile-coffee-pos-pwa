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

/** Variant 2 — Horizontal tabs with animated underline */
export default function Variant2UnderlineTabs({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex overflow-x-auto posv2-noscroll border-b border-border">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'relative shrink-0 px-4 py-3 text-xs sm:text-sm font-medium transition-colors active:scale-95',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {cat.name}
            {active && (
              <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
