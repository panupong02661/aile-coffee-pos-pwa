import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { AlertTriangle, Package, TrendingUp, DollarSign, PackageCheck } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minimum_stock: number;
  cost_per_unit: number;
}

interface Movement {
  id: string;
  movement_type: string;
  quantity_change: number;
  created_at: string;
  ingredients?: { name: string; unit: string } | null;
}

const baht = (n: number) => `฿${Number(n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;

const InventoryDashboard = () => {
  const { shopId, loading: shopLoading } = useCurrentShop();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-dashboard', shopId],
    enabled: !shopLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      let iq = supabase
        .from('ingredients')
        .select('id, name, unit, quantity, minimum_stock, cost_per_unit')
        .eq('is_active', true);
      if (shopId) iq = iq.eq('shop_id', shopId);

      let mq = supabase
        .from('stock_movements')
        .select('id, movement_type, quantity_change, created_at, ingredients(name, unit)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (shopId) mq = mq.eq('shop_id', shopId);

      const since = new Date();
      since.setHours(0, 0, 0, 0);
      let tq = supabase
        .from('stock_movements')
        .select('movement_type, quantity_change, cost_per_unit')
        .gte('created_at', since.toISOString())
        .limit(2000);
      if (shopId) tq = tq.eq('shop_id', shopId);

      const [ings, moves, today] = await Promise.all([iq, mq, tq]);

      const ingredients = (ings.data || []) as Ingredient[];
      const totalStockValue = ingredients.reduce(
        (s, i) => s + Number(i.quantity || 0) * Number(i.cost_per_unit || 0),
        0
      );
      const todayCost = (today.data || []).reduce((s: number, m: any) => {
        if (m.movement_type !== 'usage') return s;
        return s + Math.abs(Number(m.quantity_change || 0)) * Number(m.cost_per_unit || 0);
      }, 0);

      const lowStock = ingredients
        .filter((i) => Number(i.quantity) <= Number(i.minimum_stock || 0))
        .sort((a, b) => Number(a.quantity) - Number(b.quantity));

      return {
        ingredients,
        lowStock,
        totalStockValue,
        todayCost,
        movements: (moves.data || []) as unknown as Movement[],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { ingredients, lowStock, totalStockValue, todayCost, movements } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="มูลค่าสต็อกทั้งหมด"
          value={baht(totalStockValue)}
          hint={`${ingredients.length} รายการ`}
          icon={Package}
          tone="primary"
        />
        <StatCard
          label="ต้นทุนที่ใช้วันนี้"
          value={baht(todayCost)}
          hint="จากการตัดสต็อก"
          icon={DollarSign}
          tone="info"
        />
        <StatCard
          label="วัตถุดิบใกล้หมด"
          value={String(lowStock.length)}
          hint={lowStock.length > 0 ? 'ควรสั่งเพิ่ม' : 'สต็อกปกติ'}
          icon={AlertTriangle}
          tone={lowStock.length > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label="สต็อกเพียงพอ"
          value={String(Math.max(ingredients.length - lowStock.length, 0))}
          hint="รายการที่ยังพอใช้"
          icon={PackageCheck}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              แจ้งเตือนสต็อกต่ำ
            </CardTitle>
            <CardDescription>วัตถุดิบที่ใกล้หมดและต้องเติมสต็อก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">ไม่มีวัตถุดิบที่สต็อกต่ำ</p>
              ) : (
                lowStock.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{i.name}</p>
                      <p className="text-sm text-muted-foreground">
                        เหลือ {Number(i.quantity)} {i.unit} (ขั้นต่ำ {Number(i.minimum_stock)} {i.unit})
                      </p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      ขาด {Math.max(Number(i.minimum_stock) - Number(i.quantity), 0)} {i.unit}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              มูลค่าสต็อกสูงสุด
            </CardTitle>
            <CardDescription>วัตถุดิบที่ผูกเงินทุนไว้มากที่สุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลวัตถุดิบ</p>
              ) : (
                [...ingredients]
                  .sort(
                    (a, b) =>
                      Number(b.quantity) * Number(b.cost_per_unit || 0) -
                      Number(a.quantity) * Number(a.cost_per_unit || 0)
                  )
                  .slice(0, 6)
                  .map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{i.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Number(i.quantity)} {i.unit} × {baht(Number(i.cost_per_unit || 0))}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums text-foreground">
                        {baht(Number(i.quantity) * Number(i.cost_per_unit || 0))}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">การเคลื่อนไหวสต็อกล่าสุด</CardTitle>
          <CardDescription>ประวัติการเคลื่อนไหวสต็อก 10 รายการล่าสุด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีการเคลื่อนไหวสต็อก</p>
            ) : (
              movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {m.ingredients?.name || 'ไม่ระบุ'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const d = new Date(m.created_at);
                        return isNaN(d.getTime()) ? '-' : d.toLocaleString('th-TH');
                      })()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge
                      variant={
                        m.movement_type === 'purchase'
                          ? 'default'
                          : m.movement_type === 'usage'
                            ? 'secondary'
                            : m.movement_type === 'waste'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {m.movement_type === 'purchase'
                        ? 'ซื้อเข้า'
                        : m.movement_type === 'usage'
                          ? 'ใช้งาน'
                          : m.movement_type === 'waste'
                            ? 'สูญเสีย'
                            : 'ปรับยอด'}
                    </Badge>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      {Number(m.quantity_change) > 0 ? '+' : ''}
                      {Number(m.quantity_change)} {m.ingredients?.unit || ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
