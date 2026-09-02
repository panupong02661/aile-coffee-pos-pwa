import { MenuItem, Addon, CartItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Plus, AlertTriangle } from 'lucide-react';

interface Props {
  menuItems: MenuItem[];
  addons?: Addon[];
  onAddToCart: (item: MenuItem, selectedAddons?: Addon[]) => void;
  gridColumns?: number;
  itemSize?: 'small' | 'medium' | 'large';
  cartItems?: CartItem[];
  shopLogoUrl?: string;
  /** menu_item_id -> รายชื่อวัตถุดิบที่ใกล้หมด */
  lowStockMap?: Record<string, string[]>;
}


const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
};

const PosMenuGridV2 = ({
  menuItems,
  onAddToCart,
  gridColumns = 4,
  itemSize = 'medium',
  cartItems = [],
  shopLogoUrl,
}: Props) => {
  const isMobile = useIsMobile();

  const qtyMap = new Map<string, number>();
  cartItems.forEach((ci) => {
    qtyMap.set(ci.menu_item.id, (qtyMap.get(ci.menu_item.id) || 0) + ci.quantity);
  });

  const cols = isMobile ? 'grid-cols-3' : COLS[gridColumns] || 'grid-cols-4';
  const compact = gridColumns >= 6 || isMobile;
  const pad = compact ? 'p-1.5' : 'p-2.5';
  const radius = compact ? 'rounded-2xl' : 'rounded-3xl';
  const imgRadius = compact ? 'rounded-xl' : 'rounded-[20px]';
  const nameSize = compact ? 'text-xs' : itemSize === 'large' ? 'text-base' : 'text-sm';
  const priceSize = compact ? 'text-sm' : itemSize === 'large' ? 'text-xl' : 'text-lg';

  return (
    <div className={cn('grid gap-2.5 sm:gap-3', cols)}>
      {menuItems
        .filter((item) => item.is_available === true)
        .map((item) => {
          const qty = qtyMap.get(item.id) || 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onAddToCart(item)}
              className={cn(
                'group relative flex flex-col overflow-hidden text-left transition-all duration-200 active:scale-[0.97] touch-manipulation',
                radius,
                pad,
                'bg-[hsl(var(--posv2-card))] shadow-[var(--posv2-shadow-soft)] hover:shadow-[var(--posv2-shadow-lift)]',
                qty > 0 && 'ring-2 ring-[hsl(var(--posv2-accent))]'
              )}
            >
              <div
                className={cn(
                  'relative aspect-square w-full overflow-hidden bg-[hsl(var(--posv2-surface))]',
                  imgRadius
                )}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : shopLogoUrl ? (
                  <img
                    src={shopLogoUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full scale-110 object-contain opacity-20"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[hsl(var(--posv2-ink))] opacity-10">
                    {item.name.charAt(0)}
                  </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <span
                  className={cn(
                    'absolute bottom-1.5 left-2 font-extrabold tracking-tight text-white drop-shadow',
                    priceSize
                  )}
                >
                  ฿{Number(item.price).toLocaleString()}
                </span>

                {!compact && (
                  <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[hsl(var(--posv2-ink))] shadow transition-colors group-hover:bg-[hsl(var(--posv2-accent))] group-hover:text-[hsl(var(--posv2-accent-fg))]">
                    <Plus className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}

                {qty > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[hsl(var(--posv2-accent))] px-1.5 text-xs font-bold text-[hsl(var(--posv2-accent-fg))] shadow-[var(--posv2-shadow-accent)]">
                    {qty}
                  </span>
                )}
              </div>

              <div className="px-1 pb-0.5 pt-1.5">
                <h3
                  className={cn(
                    'line-clamp-2 min-h-[2.5em] font-bold leading-tight text-[hsl(var(--posv2-ink))]',
                    nameSize
                  )}
                >
                  {item.name}
                </h3>
              </div>
            </button>
          );
        })}
    </div>
  );
};

export default PosMenuGridV2;
