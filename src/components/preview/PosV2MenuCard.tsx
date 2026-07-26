import { Plus } from 'lucide-react';

export interface PosV2Item {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

interface Props {
  item: PosV2Item;
  qty: number;
  onAdd: (item: PosV2Item) => void;
}

export default function PosV2MenuCard({ item, qty, onAdd }: Props) {
  return (
    <button
      onClick={() => onAdd(item)}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-[hsl(var(--posv2-card))] p-2.5 text-left shadow-[var(--posv2-shadow-soft)] transition-all duration-200 hover:shadow-[var(--posv2-shadow-lift)] active:scale-[0.97]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[hsl(var(--posv2-surface))]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[hsl(var(--posv2-ink))] opacity-10">
            {item.name.charAt(0)}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <span className="absolute bottom-2 left-2.5 text-lg font-extrabold tracking-tight text-white drop-shadow">
          ฿{item.price.toLocaleString()}
        </span>

        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[hsl(var(--posv2-ink))] shadow transition-colors group-hover:bg-[hsl(var(--posv2-accent))] group-hover:text-[hsl(var(--posv2-accent-fg))]">
          <Plus className="h-4 w-4" strokeWidth={3} />
        </span>

        {qty > 0 && (
          <span className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-[hsl(var(--posv2-accent))] px-2 text-xs font-bold text-[hsl(var(--posv2-accent-fg))] shadow-[var(--posv2-shadow-accent)]">
            {qty}
          </span>
        )}
      </div>

      <div className="px-1.5 pb-1 pt-2.5">
        <h3 className="truncate text-sm font-bold leading-tight text-[hsl(var(--posv2-ink))]">{item.name}</h3>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-[hsl(var(--posv2-ink-soft))]">{item.description}</p>
        )}
      </div>
    </button>
  );
}
