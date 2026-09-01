import { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { MenuItem } from '@/types';
import { useBestSellers } from '@/hooks/usePosInsights';
import { cn } from '@/lib/utils';

interface Props {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  className?: string;
}

/** แถบขายด่วน: เมนูขายดี 8 อันดับ 7 วันล่าสุด */
const QuickSaleBar = ({ menuItems, onAddToCart, className }: Props) => {
  const { data: best } = useBestSellers(8);

  const items = useMemo(() => {
    if (!best?.length) return [];
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    return best
      .map((b) => byId.get(b.menu_item_id))
      .filter((m): m is MenuItem => !!m && m.is_available !== false);
  }, [best, menuItems]);

  if (items.length === 0) return null;

  return (
    <div className={cn('mb-3', className)}>
      <div className="mb-1.5 flex items-center gap-1.5 px-0.5 text-xs font-semibold text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        ขายด่วน · ขายดี 7 วันล่าสุด
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onAddToCart(item)}
            className="flex shrink-0 flex-col items-start rounded-xl border border-border bg-card px-3 py-2 text-left shadow-sm transition-all touch-manipulation active:scale-[0.97] hover:border-primary/50 hover:shadow-md"
          >
            <span className="max-w-[9rem] truncate text-xs font-semibold text-foreground">
              {item.name}
            </span>
            <span className="text-sm font-bold tabular-nums text-primary">
              ฿{Number(item.price).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSaleBar;
