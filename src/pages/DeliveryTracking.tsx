
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Truck, Package, ChefHat, MapPin, CheckCircle2, Clock, Phone, User, Star, XCircle, Plus, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface DeliveryOrder {
  id: string;
  order_id: string | null;
  status: string;
  status_note: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  estimated_prep_time: number;
  estimated_delivery_time: number;
  actual_prep_start: string | null;
  actual_prep_end: string | null;
  actual_pickup_time: string | null;
  actual_delivery_time: string | null;
  customer_rating: number | null;
  total_amount: number;
  delivery_fee: number;
  created_at: string;
}

const statusFlow = [
  { key: 'pending', label: 'รอยืนยัน', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
  { key: 'confirmed', label: 'ยืนยันแล้ว', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-100' },
  { key: 'preparing', label: 'กำลังทำ', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-100' },
  { key: 'ready_for_pickup', label: 'พร้อมรับ', icon: Package, color: 'text-purple-500', bg: 'bg-purple-100' },
  { key: 'picked_up', label: 'ไรเดอร์รับแล้ว', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { key: 'delivering', label: 'กำลังจัดส่ง', icon: MapPin, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  { key: 'delivered', label: 'ส่งแล้ว', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'failed', label: 'จัดส่งไม่สำเร็จ', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  { key: 'cancelled', label: 'ยกเลิก', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
];

const getNextStatus = (current: string): string | null => {
  const order = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering', 'delivered'];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
};

const getStatusInfo = (status: string) => statusFlow.find(s => s.key === status) || statusFlow[0];

const DeliveryTracking = () => {
  const { toast } = useToast();
  const { shopId } = useCurrentShop();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filter, setFilter] = useState('active');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customer_name: '', customer_phone: '', delivery_address: '',
    driver_name: '', driver_phone: '', total_amount: '', delivery_fee: '0',
    estimated_prep_time: '15', estimated_delivery_time: '30',
  });

  const fetchOrders = async () => {
    let query = supabase.from('delivery_tracking').select('*').order('created_at', { ascending: false });
    if (shopId) query = query.eq('shop_id', shopId);
    if (filter === 'active') query = query.not('status', 'in', '("delivered","cancelled","failed")');
    const { data } = await query;
    setOrders(data || []);
  };

  useEffect(() => { fetchOrders(); }, [shopId, filter]);

  useEffect(() => {
    const channel = supabase.channel('delivery-tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_tracking' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shopId, filter]);

  const advanceStatus = async (order: DeliveryOrder) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    const updates: any = { status: next, updated_at: new Date().toISOString() };
    if (next === 'preparing') updates.actual_prep_start = new Date().toISOString();
    if (next === 'ready_for_pickup') updates.actual_prep_end = new Date().toISOString();
    if (next === 'picked_up') updates.actual_pickup_time = new Date().toISOString();
    if (next === 'delivered') updates.actual_delivery_time = new Date().toISOString();
    await supabase.from('delivery_tracking').update(updates).eq('id', order.id);
    const info = getStatusInfo(next);
    toast({ title: `อัปเดตสถานะ: ${info.label}` });
    fetchOrders();
  };

  const cancelOrder = async (id: string) => {
    await supabase.from('delivery_tracking').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id);
    toast({ title: 'ยกเลิกออเดอร์แล้ว' });
    fetchOrders();
  };

  const createDelivery = async () => {
    const { error } = await supabase.from('delivery_tracking').insert({
      customer_name: createForm.customer_name,
      customer_phone: createForm.customer_phone,
      delivery_address: createForm.delivery_address,
      driver_name: createForm.driver_name || null,
      driver_phone: createForm.driver_phone || null,
      total_amount: parseFloat(createForm.total_amount) || 0,
      delivery_fee: parseFloat(createForm.delivery_fee) || 0,
      estimated_prep_time: parseInt(createForm.estimated_prep_time) || 15,
      estimated_delivery_time: parseInt(createForm.estimated_delivery_time) || 30,
      status: 'pending',
      shop_id: shopId,
    });
    if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
    toast({ title: 'สร้างออเดอร์เดลิเวอรี่สำเร็จ' });
    setIsCreateOpen(false);
    setCreateForm({ customer_name: '', customer_phone: '', delivery_address: '', driver_name: '', driver_phone: '', total_amount: '', delivery_fee: '0', estimated_prep_time: '15', estimated_delivery_time: '30' });
    fetchOrders();
  };

  const getTimeDiff = (start: string) => {
    const diff = Math.floor((Date.now() - new Date(start).getTime()) / 60000);
    return diff < 60 ? `${diff} นาที` : `${Math.floor(diff / 60)} ชม. ${diff % 60} น.`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 md:ml-[56px] px-3 md:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">ระบบเดลิเวอรี่</h1>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">กำลังดำเนิน..</SelectItem>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> สร้างออเดอร์</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: 'รอยืนยัน', count: orders.filter(o => o.status === 'pending').length, color: 'text-gray-600' },
              { label: 'กำลังทำ', count: orders.filter(o => o.status === 'preparing').length, color: 'text-orange-600' },
              { label: 'กำลังจัดส่ง', count: orders.filter(o => ['picked_up', 'delivering'].includes(o.status)).length, color: 'text-cyan-600' },
              { label: 'ส่งแล้ว', count: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
            ].map(s => (
              <Card key={s.label}><CardContent className="p-4 text-center">
                <div className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{s.label}</div>
              </CardContent></Card>
            ))}
          </div>

          {/* Orders Grid - 2 columns on tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {orders.map(order => {
              const info = getStatusInfo(order.status);
              const Icon = info.icon;
              const nextStatus = getNextStatus(order.status);
              const nextInfo = nextStatus ? getStatusInfo(nextStatus) : null;

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${info.bg}`}>
                          <Icon className={`w-5 h-5 ${info.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{order.customer_name || 'ลูกค้า'}</div>
                          <Badge variant="outline" className={`text-[10px] ${info.color}`}>{info.label}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="font-semibold">฿{order.total_amount.toLocaleString()}</div>
                        <div>{getTimeDiff(order.created_at)} ที่แล้ว</div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                      {statusFlow.slice(0, 7).map((step, i) => {
                        const isActive = statusFlow.findIndex(s => s.key === order.status) >= i;
                        const isCurrent = step.key === order.status;
                        return (
                          <div key={step.key} className="flex items-center">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              isCurrent ? `${step.color.replace('text-', 'bg-')} ring-2 ring-offset-1` :
                              isActive ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                            {i < 6 && <div className={`w-4 md:w-6 h-0.5 ${isActive ? 'bg-green-500' : 'bg-gray-200'}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-3">
                      {order.customer_phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer_phone}</div>}
                      {order.delivery_address && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate">{order.delivery_address}</span></div>}
                      {order.driver_name && <div className="flex items-center gap-1"><User className="w-3 h-3" />🏍️ {order.driver_name}</div>}
                      {order.delivery_fee > 0 && <div>ค่าส่ง: ฿{order.delivery_fee}</div>}
                    </div>

                    {/* Actions */}
                    {!['delivered', 'cancelled', 'failed'].includes(order.status) && (
                      <div className="flex gap-2">
                        {nextInfo && (
                          <Button size="sm" className="flex-1" onClick={() => advanceStatus(order)}>
                            <ArrowRight className="w-3 h-3 mr-1" /> {nextInfo.label}
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => cancelOrder(order.id)}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {order.status === 'delivered' && order.customer_rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= order.customer_rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {orders.length === 0 && (
              <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">
                ยังไม่มีออเดอร์เดลิเวอรี่ — กดปุ่ม "สร้างออเดอร์" เพื่อเริ่มต้น
              </CardContent></Card>
            )}
          </div>

          {/* Create Dialog */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>สร้างออเดอร์เดลิเวอรี่</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                <div><Label>ชื่อลูกค้า *</Label><Input value={createForm.customer_name} onChange={e => setCreateForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
                <div><Label>เบอร์โทรลูกค้า</Label><Input value={createForm.customer_phone} onChange={e => setCreateForm(p => ({ ...p, customer_phone: e.target.value }))} /></div>
                <div><Label>ที่อยู่จัดส่ง *</Label><Textarea value={createForm.delivery_address} onChange={e => setCreateForm(p => ({ ...p, delivery_address: e.target.value }))} /></div>
                <div><Label>ยอดรวม (฿)</Label><Input type="number" value={createForm.total_amount} onChange={e => setCreateForm(p => ({ ...p, total_amount: e.target.value }))} /></div>
                <div><Label>ค่าจัดส่ง (฿)</Label><Input type="number" value={createForm.delivery_fee} onChange={e => setCreateForm(p => ({ ...p, delivery_fee: e.target.value }))} /></div>
                <div><Label>ชื่อไรเดอร์</Label><Input value={createForm.driver_name} onChange={e => setCreateForm(p => ({ ...p, driver_name: e.target.value }))} /></div>
                <div><Label>เบอร์ไรเดอร์</Label><Input value={createForm.driver_phone} onChange={e => setCreateForm(p => ({ ...p, driver_phone: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>เวลาเตรียม (นาที)</Label><Input type="number" value={createForm.estimated_prep_time} onChange={e => setCreateForm(p => ({ ...p, estimated_prep_time: e.target.value }))} /></div>
                  <div><Label>เวลาจัดส่ง (นาที)</Label><Input type="number" value={createForm.estimated_delivery_time} onChange={e => setCreateForm(p => ({ ...p, estimated_delivery_time: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={createDelivery} disabled={!createForm.customer_name || !createForm.delivery_address}>สร้างออเดอร์</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default DeliveryTracking;
