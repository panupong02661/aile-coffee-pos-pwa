import { useCallback, useEffect, useMemo, useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { useToast } from '@/hooks/use-toast';
import { Banknote, QrCode, Receipt, Wallet, Printer, PlayCircle, StopCircle } from 'lucide-react';

interface ShiftRow {
  id: string;
  shift_start: string;
  shift_end: string | null;
  opening_cash: number | null;
  closing_cash: number | null;
  expected_cash: number | null;
  cash_difference: number | null;
  status: string | null;
  notes: string | null;
}

const baht = (n: number) => `฿${Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const thaiTime = (iso: string) =>
  new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

const isPromptPay = (m?: string | null) => {
  const v = (m || '').toLowerCase();
  return v.includes('promptpay') || v.includes('qr') || v.includes('โอน') || v.includes('transfer');
};
const isCash = (m?: string | null) => {
  const v = (m || '').toLowerCase();
  return v === '' || v.includes('cash') || v.includes('เงินสด');
};

const ShiftClose = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { shopId, loading: shopLoading } = useCurrentShop();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState<ShiftRow | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [openingCash, setOpeningCash] = useState('0');
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (shopLoading) return;
    setLoading(true);
    try {
      let sq = supabase
        .from('shifts')
        .select('*')
        .eq('status', 'open')
        .order('shift_start', { ascending: false })
        .limit(1);
      if (shopId) sq = sq.eq('shop_id', shopId);
      const { data: shiftData } = await sq;
      const current = (shiftData?.[0] as ShiftRow) || null;
      setShift(current);

      const since = current?.shift_start || new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
      let oq = supabase
        .from('orders')
        .select('id, total_amount, bill_discount, payment_method, created_at, status')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(2000);
      if (shopId) oq = oq.eq('shop_id', shopId);
      const { data: orderData } = await oq;
      setOrders((orderData || []).filter((o: any) => o.status !== 'cancelled'));
    } finally {
      setLoading(false);
    }
  }, [shopId, shopLoading]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    let cash = 0, promptpay = 0, other = 0, discount = 0, total = 0;
    orders.forEach((o) => {
      const amt = Number(o.total_amount || 0);
      total += amt;
      discount += Number(o.bill_discount || 0);
      if (isPromptPay(o.payment_method)) promptpay += amt;
      else if (isCash(o.payment_method)) cash += amt;
      else other += amt;
    });
    const opening = Number(shift?.opening_cash ?? Number(openingCash) ?? 0);
    return { cash, promptpay, other, discount, total, count: orders.length, expected: opening + cash };
  }, [orders, shift, openingCash]);

  const diff = closingCash === '' ? null : Number(closingCash) - summary.expected;

  const openShift = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('shifts').insert({
        shift_start: new Date().toISOString(),
        opening_cash: Number(openingCash || 0),
        status: 'open',
        ...(shopId ? { shop_id: shopId } : {}),
      });
      if (error) throw error;
      toast({ title: 'เปิดกะแล้ว', description: `เงินทอนตั้งต้น ${baht(Number(openingCash || 0))}` });
      await load();
    } catch (e: any) {
      toast({ title: 'เปิดกะไม่สำเร็จ', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const closeShift = async () => {
    if (!shift) return;
    setSaving(true);
    try {
      const closing = Number(closingCash || 0);
      const { error } = await supabase
        .from('shifts')
        .update({
          shift_end: new Date().toISOString(),
          closing_cash: closing,
          expected_cash: summary.expected,
          cash_difference: closing - summary.expected,
          status: 'closed',
          notes: notes || null,
        })
        .eq('id', shift.id);
      if (error) throw error;
      toast({ title: 'ปิดกะเรียบร้อย', description: `ส่วนต่าง ${baht(closing - summary.expected)}` });
      setClosingCash('');
      setNotes('');
      await load();
    } catch (e: any) {
      toast({ title: 'ปิดกะไม่สำเร็จ', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const printSummary = () => {
    const rows = [
      ['เปิดกะ', shift ? thaiTime(shift.shift_start) : '-'],
      ['ปิดกะ', thaiTime(new Date().toISOString())],
      ['เงินทอนตั้งต้น', baht(Number(shift?.opening_cash ?? openingCash ?? 0))],
      ['เงินสด', baht(summary.cash)],
      ['พร้อมเพย์/โอน', baht(summary.promptpay)],
      ['อื่น ๆ', baht(summary.other)],
      ['ส่วนลด', baht(summary.discount)],
      ['ยอดขายรวม', baht(summary.total)],
      ['จำนวนบิล', String(summary.count)],
      ['เงินในลิ้นชักที่ควรมี', baht(summary.expected)],
      ['นับได้จริง', closingCash === '' ? '-' : baht(Number(closingCash))],
      ['ส่วนต่าง', diff === null ? '-' : baht(diff)],
    ];
    const html = `<html><head><meta charset="utf-8"><title>สรุปกะ</title>
<style>body{font-family:sans-serif;width:280px;margin:0 auto;padding:12px}
h2{text-align:center;font-size:16px;margin:0 0 8px}
table{width:100%;font-size:12px;border-collapse:collapse}
td{padding:3px 0}td:last-child{text-align:right;font-weight:600}
hr{border:none;border-top:1px dashed #999;margin:8px 0}</style></head>
<body><h2>ใบสรุปกะ</h2><hr/><table>${rows
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('')}</table><hr/>
<p style="text-align:center;font-size:11px">ลงชื่อ ____________________</p>
<script>window.onload=()=>{window.print()}</script></body></html>`;
    const w = window.open('', '_blank', 'width=380,height=640');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 p-4 transition-all duration-300 ease-in-out md:ml-[56px]">
        <div className="max-w-7xl mx-auto">
          <Header
            onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">สรุปกะ / ปิดรอบขาย</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {shift ? (
                  <>
                    <Badge variant="secondary" className="mr-2">กะเปิดอยู่</Badge>
                    เริ่มเมื่อ {thaiTime(shift.shift_start)}
                  </>
                ) : (
                  'ยังไม่มีกะที่เปิดอยู่ — สรุปด้านล่างคิดจากยอดขายวันนี้'
                )}
              </p>
            </div>
            <Button variant="outline" onClick={printSummary} className="gap-2">
              <Printer className="h-4 w-4" /> พิมพ์ใบสรุปกะ
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="เงินสด" value={baht(summary.cash)} icon={Banknote} tone="success" />
              <StatCard label="พร้อมเพย์ / โอน" value={baht(summary.promptpay)} icon={QrCode} tone="info" />
              <StatCard label="ยอดขายรวม" value={baht(summary.total)} icon={Wallet} tone="primary" hint={`ส่วนลด ${baht(summary.discount)}`} />
              <StatCard label="จำนวนบิล" value={String(summary.count)} icon={Receipt} tone="warning" />
            </div>
          )}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {shift ? 'ปิดกะ' : 'เปิดกะใหม่'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!shift ? (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">เงินทอนตั้งต้นในลิ้นชัก</label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={openingCash}
                        onChange={(e) => setOpeningCash(e.target.value)}
                        className="mt-1 h-11 text-lg"
                      />
                    </div>
                    <Button onClick={openShift} disabled={saving} className="w-full gap-2 h-11">
                      <PlayCircle className="h-4 w-4" /> เปิดกะ
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-border bg-muted/40 p-3">
                        <p className="text-muted-foreground">เงินทอนตั้งต้น</p>
                        <p className="text-lg font-bold tabular-nums text-foreground">
                          {baht(Number(shift.opening_cash || 0))}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/40 p-3">
                        <p className="text-muted-foreground">ควรมีในลิ้นชัก</p>
                        <p className="text-lg font-bold tabular-nums text-foreground">{baht(summary.expected)}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">นับเงินได้จริง</label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                        placeholder="0.00"
                        className="mt-1 h-11 text-lg"
                      />
                    </div>
                    {diff !== null && (
                      <p
                        className={`text-sm font-semibold ${
                          Math.abs(diff) < 0.01
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive'
                        }`}
                      >
                        ส่วนต่าง {baht(diff)}
                      </p>
                    )}
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="หมายเหตุ (ถ้ามี)"
                      rows={2}
                    />
                    <Button
                      onClick={closeShift}
                      disabled={saving || closingCash === ''}
                      className="w-full gap-2 h-11"
                    >
                      <StopCircle className="h-4 w-4" /> ปิดกะ
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">บิลในรอบนี้ ({summary.count})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[420px] overflow-y-auto p-0">
                {loading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">ยังไม่มีบิลในรอบนี้</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {orders.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                        <span className="text-muted-foreground">
                          {new Date(o.created_at).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex-1 truncate text-xs text-muted-foreground">
                          {isPromptPay(o.payment_method) ? 'พร้อมเพย์' : isCash(o.payment_method) ? 'เงินสด' : o.payment_method || 'อื่น ๆ'}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {baht(Number(o.total_amount || 0))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftClose;
