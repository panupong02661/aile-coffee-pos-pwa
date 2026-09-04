import { cn } from '@/lib/utils';
import { Coffee, CupSoda, Dessert, Milk, Salad, Sparkles, UtensilsCrossed } from 'lucide-react';

interface Cat {
  id: string;
  name: string;
}

interface Props {
  categories: Cat[];
  selected: string;
  onSelect: (id: string) => void;
}

const ICONS: Record<string, React.ElementType> = {
  coffee: Coffee,
  tea: CupSoda,
  milk: Milk,
  soda: CupSoda,
  dessert: Dessert,
  food: UtensilsCrossed,
  recommended: Sparkles,
};

/** Variant 3 — Icon chips with colored active ring */
export default function Variant3IconChips({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const active = cat.id === selected;
        const Icon = ICONS[cat.id] ?? Coffee;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 border',
              active
                ? 'bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/40'
                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
