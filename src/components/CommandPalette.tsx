import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { menuGroups } from '@/components/sidebar/menuConfig';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { Search } from 'lucide-react';

interface Hit {
  id: string;
  label: string;
  sub?: string;
  path: string;
}

/** ค้นหาแบบสั่งการ: กด Ctrl/Cmd+K เพื่อกระโดดไปหน้าใด ๆ, เมนู หรือเลขบิล */
const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuHits, setMenuHits] = useState<Hit[]>([]);
  const [orderHits, setOrderHits] = useState<Hit[]>([]);
  const navigate = useNavigate();
  const { shopId } = useCurrentShop();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typeof e.key === 'string' && e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const pages = useMemo(
    () =>
      menuGroups.flatMap((g) =>
        g.items.map((i) => ({ id: `${g.id}-${i.id}`, label: i.label, sub: g.label, path: i.path }))
      ),
    []
  );

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setMenuHits([]);
      setOrderHits([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        let mq = supabase.from('menu_items').select('id, name, price').ilike('name', `%${term}%`).limit(6);
        let oq = supabase
          .from('orders')
          .select('id, order_number, total_amount')
          .ilike('order_number', `%${term}%`)
          .order('created_at', { ascending: false })
          .limit(6);
        if (shopId) {
          mq = mq.eq('shop_id', shopId);
          oq = oq.eq('shop_id', shopId);
        }

        const [menus, orders] = await Promise.all([mq, oq]);
        if (cancelled) return;

        setMenuHits(
          (menus.data || []).map((m: any) => ({
            id: m.id,
            label: m.name,
            sub: `฿${Number(m.price).toLocaleString()}`,
            path: '/menu',
          }))
        );
        setOrderHits(
          (orders.data || []).map((o: any) => ({
            id: o.id,
            label: o.order_number,
            sub: `฿${Number(o.total_amount).toLocaleString()}`,
            path: '/reports',
          }))
        );
      } catch {
        /* เงียบไว้ ไม่ให้ค้นหาพัง UI */
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, shopId]);

  const go = (path: string) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="พิมพ์ชื่อหน้า ชื่อเมนู หรือเลขบิล..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-1 py-4 text-sm text-muted-foreground">
            <Search className="h-5 w-5" />
            ไม่พบรายการที่ค้นหา
          </div>
        </CommandEmpty>

        <CommandGroup heading="หน้าในระบบ">
          {pages.map((p) => (
            <CommandItem key={p.id} value={`${p.label} ${p.sub} ${p.path}`} onSelect={() => go(p.path)}>
              <span className="flex-1">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.sub}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {menuHits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="เมนูสินค้า">
              {menuHits.map((m) => (
                <CommandItem key={m.id} value={`menu-${m.label}-${m.id}`} onSelect={() => go(m.path)}>
                  <span className="flex-1">{m.label}</span>
                  <span className="text-xs text-muted-foreground">{m.sub}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {orderHits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="ออเดอร์">
              {orderHits.map((o) => (
                <CommandItem key={o.id} value={`order-${o.label}-${o.id}`} onSelect={() => go(o.path)}>
                  <span className="flex-1">{o.label}</span>
                  <span className="text-xs text-muted-foreground">{o.sub}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
