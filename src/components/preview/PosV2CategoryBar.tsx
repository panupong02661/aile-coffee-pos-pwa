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
  return (
    <div className="flex flex-wrap content-start gap-1.5 max-h-[5.25rem] overflow-y-auto posv2-noscroll">
      {categories.map((cat) => {
        const active = cat.id === selected;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
              active
                ? 'bg-[hsl(var(--posv2-accent))] text-[hsl(var(--posv2-accent-fg))] shadow-[var(--posv2-shadow-accent)]'
                : 'bg-[hsl(var(--posv2-card))] text-[hsl(var(--posv2-ink-soft))] shadow-[var(--posv2-shadow-soft)] hover:text-[hsl(var(--posv2-ink))]'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
