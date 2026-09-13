import { usePOSSettings } from '@/hooks/usePOSSettings';
import CategoryBarShowcase from '@/components/category-bar-preview/CategoryBarShowcase';

interface Cat {
  id: string;
  name: string;
}

interface Props {
  categories: Cat[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function PosV2CategoryBar({ categories, selected, onSelect }: Props) {
  const { categoryBarStyle } = usePOSSettings();

  if (categoryBarStyle && categoryBarStyle >= 1 && categoryBarStyle <= 10) {
    return (
      <div className="w-full max-h-[9rem] overflow-y-auto posv2-noscroll">
        <CategoryBarShowcase
          categories={categories}
          selected={selected}
          onSelect={onSelect}
          variant={categoryBarStyle}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap content-start gap-1.5 max-h-[5.25rem] overflow-y-auto posv2-noscroll rounded-2xl p-1.5">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 border ${
              active
                ? 'bg-[hsl(var(--posv2-ink))] text-[hsl(var(--posv2-card))] border-transparent shadow-md'
                : 'bg-[hsl(var(--posv2-card))] text-[hsl(var(--posv2-ink))] border-[hsl(var(--posv2-line))] shadow-[var(--posv2-shadow-soft)] hover:border-[hsl(var(--posv2-ink-soft))]'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
