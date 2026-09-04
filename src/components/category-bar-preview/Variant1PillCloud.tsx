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

/** Variant 1 — Floating pill cloud with soft shadow */
export default function Variant1PillCloud({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 p-1">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'relative whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95',
              active
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground shadow-sm border border-border hover:text-foreground hover:shadow'
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
