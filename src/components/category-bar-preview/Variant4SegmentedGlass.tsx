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

/** Variant 4 — Glass segmented control */
export default function Variant4SegmentedGlass({ categories, selected, onSelect }: Props) {
  return (
    <div className="inline-flex flex-wrap sm:flex-nowrap gap-1 p-1 rounded-2xl bg-muted/60 border border-border/70 backdrop-blur-sm">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'relative whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all active:scale-95',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
