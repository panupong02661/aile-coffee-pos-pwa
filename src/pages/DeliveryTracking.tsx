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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, ChefHat, MapPin, CheckCircle2, Clock, Phone, User, Star, XCircle, Plus, ArrowRight, Timer, MessageSquare } from 'lucide-react';
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
  customer_feedback: string | null;
  total_amount: number;
  delivery_fee: number;
  created_at: string;
}

const statusFlow = [
  { key: 'pending', label: 'รอยืนยัน', sublabel: 'ออเดอร์เข้ามาใหม่', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', ring: 'ring-gray-300' },
  { key: 'confirmed', label: 'ยืนยันแล้ว', sublabel: 'ร้านรับออเดอร์', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-100', ring: 'ring-blue-300' },
  { key: 'preparing', label: 'กำลังทำ', sublabel: 'ครัวกำลังเตรียม', icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-100', ring: 'ring-orange-300' },
  { key: 'ready_for_pickup', label: 'พร้อมรับ', sublabel: 'รอไรเดอร์มารับ', icon: Package, color: 'text-purple-500', bg: 'bg-purple-100', ring: 'ring-purple-300' },
  { key: 'picked_up', label: 'ไรเดอร์รับแล้ว', sublabel: 'กำลังเดินทาง', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-100', ring: 'ring-indigo-300' },
  { key: 'delivering', label: 'กำลังจัดส่ง', sublabel: 'ใกล้ถึงแล้ว', icon: MapPin, color: 'text-cyan-500', bg: 'bg-cyan-100', ring: 'ring-cyan-300' },
  { key: 'delivered', label: 'ส่งแล้ว', sublabel: 'จัดส่งสำเร็จ', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', ring: 'ring-green-300' },
  { key: 'failed', label: 'จัดส่งไม่สำเร็จ', sublabel: '', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', ring: 'ring-red-300' },
  { key: 'cancelled', label: 'ยกเลิก', sublabel: '', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', ring: 'ring-red-300' },
];

const activeStatusKeys = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering', 'delivered'];

const getNextStatus = (current: string): string | null => {
  const idx = activeStatusKeys.indexOf(current);
  return idx >= 0 && idx < activeStatusKeys.length - 1 ? activeStatusKeys[idx + 1] : null;
};

const getStatusInfo = (status: string) => statusFlow.find(s => s.key === status) || statusFlow[0];

const getStatusIndex = (status: string) => activeStatusKeys.indexOf(status);

const DeliveryTracking = () => {
  const { toast } = useToast();
  const { shopId } = useCurrentShop();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filter, setFilter] = useState('active');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [statusNote, setStatusNote] = useState('');
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
    const channel = supabase.channel('delivery-tracking-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_tracking' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shopId, filter]);

  const advanceStatus = async (order: DeliveryOrder, note?: string) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    const updates: any = { status: next, updated_at: new Date().toISOString(), status_note: note || null };
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

  const getProgressPercent = (order: DeliveryOrder) => {
    const idx = getStatusIndex(order.status);
    if (idx < 0) return 0;
    return Math.round((idx / (activeStatusKeys.length - 1)) * 100);
  };

  const getEstimatedArrival = (order: DeliveryOrder) => {
    const created = new Date(order.created_at);
    const totalMin = (order.estimated_prep_time || 15) + (order.estimated_delivery_time || 30);
    const eta = new Date(created.getTime() + totalMin * 60000);
    const now = new Date();
    const remaining = Math.max(0, Math.floor((eta.getTime() - now.getTime()) / 60000));
    return remaining;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 md:ml-[56px] px-3 md:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">🏍️ ระบบเดลิเวอรี่</h1>
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
              { label: 'รอยืนยัน', count: orders.filter(o => o.status === 'pending').length, color: 'text-gray-600', emoji: '⏳' },
              { label: 'กำลังทำ', count: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length, color: 'text-orange-600', emoji: '🍳' },
              { label: 'กำลังจัดส่ง', count: orders.filter(o => ['ready_for_pickup', 'picked_up', 'delivering'].includes(o.status)).length, color: 'text-cyan-600', emoji: '🏍️' },
              { label: 'ส่งแล้ว', count: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600', emoji: '✅' },
            ].map(s => (
              <Card key={s.label}><CardContent className="p-3 md:p-4 text-center">
                <div className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.emoji} {s.count}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{s.label}</div>
              </CardContent></Card>
            ))}
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {orders.map(order => {
              const info = getStatusInfo(order.status);
              const Icon = info.icon;
              const nextStatus = getNextStatus(order.status);
              const nextInfo = nextStatus ? getStatusInfo(nextStatus) : null;
              const progress = getProgressPercent(order);
              const eta = getEstimatedArrival(order);
              const currentIdx = getStatusIndex(order.status);

              return (
                <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${info.bg} ring-2 ${info.ring}`}>
                          <Icon className={`w-5 h-5 ${info.color}`} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{order.customer_name || 'ลูกค้า'}</div>
                          <Badge variant="outline" className={`text-[10px] ${info.color} font-semibold`}>{info.label}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-foreground">฿{order.total_amount.toLocaleString()}</div>
                        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground justify-end">
                          <Timer className="w-3 h-3" />
                          {getTimeDiff(order.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[9px] text-muted-foreground">สั่งซื้อ</span>
                        {!['delivered', 'cancelled', 'failed'].includes(order.status) && eta > 0 && (
                          <span className="text-[9px] font-semibold text-primary">~{eta} นาที</span>
                        )}
                        <span className="text-[9px] text-muted-foreground">ส่งแล้ว</span>
                      </div>
                    </div>

                    {/* Lineman-style vertical timeline (compact) */}
                    <div className="space-y-0 mb-3">
                      {activeStatusKeys.slice(0, 7).map((stepKey, i) => {
                        const step = getStatusInfo(stepKey);
                        const StepIcon = step.icon;
                        const isCompleted = currentIdx > i;
                        const isCurrent = currentIdx === i;
                        const isFuture = currentIdx < i;

                        return (
                          <div key={stepKey} className="flex items-start gap-2">
                            {/* Vertical line + dot */}
                            <div className="flex flex-col items-center w-5 flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted ? 'bg-green-500' :
                                isCurrent ? `${step.color.replace('text-', 'bg-')} ring-2 ring-offset-1 ${step.ring}` :
                                'bg-gray-200'
                              }`}>
                                {isCompleted && <CheckCircle2 className="w-2 h-2 text-white" />}
                              </div>
                              {i < 6 && (
                                <div className={`w-0.5 h-3 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                              )}
                            </div>
                            {/* Label */}
                            <div className={`text-[10px] -mt-0.5 ${
                              isCurrent ? `font-bold ${step.color}` :
                              isCompleted ? 'text-green-600 font-medium' :
                              'text-muted-foreground'
                            }`}>
                              {step.label}
                              {isCurrent && order.status_note && (
                                <span className="ml-1 text-muted-foreground font-normal">— {order.status_note}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-3">
                      {order.customer_phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer_phone}</div>}
                      {order.delivery_address && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate">{order.delivery_address}</span></div>}
                      {order.driver_name && <div className="flex items-center gap-1 text-indigo-600 font-medium"><User className="w-3 h-3" />🏍️ {order.driver_name}</div>}
                      {order.delivery_fee > 0 && <div>ค่าส่ง: ฿{order.delivery_fee}</div>}
                    </div>

                    {/* Actions */}
                    {!['delivered', 'cancelled', 'failed'].includes(order.status) && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
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
                        {order.customer_feedback && (
                          <span className="text-xs text-muted-foreground ml-2">"{order.customer_feedback}"</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {orders.length === 0 && (
              <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">
                🏍️ ยังไม่มีออเดอร์เดลิเวอรี่ — กดปุ่ม "สร้างออเดอร์" เพื่อเริ่มต้น
              </CardContent></Card>
            )}
          </div>

          {/* Order Detail Modal (Lineman-style full timeline) */}
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              {selectedOrder && (() => {
                const info = getStatusInfo(selectedOrder.status);
                const Icon = info.icon;
                const currentIdx = getStatusIndex(selectedOrder.status);
                const nextStatus = getNextStatus(selectedOrder.status);
                const nextInfo = nextStatus ? getStatusInfo(nextStatus) : null;
                const progress = getProgressPercent(selectedOrder);
                const eta = getEstimatedArrival(selectedOrder);

                return (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${info.bg}`}><Icon className={`w-5 h-5 ${info.color}`} /></div>
                        {selectedOrder.customer_name || 'ลูกค้า'} — {info.label}
                      </DialogTitle>
                    </DialogHeader>

                    {/* ETA */}
                    {!['delivered', 'cancelled', 'failed'].includes(selectedOrder.status) && eta > 0 && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground">เวลาโดยประมาณที่จะถึง</p>
                        <p className="text-2xl font-bold text-primary">~{eta} นาที</p>
                      </div>
                    )}

                    {/* Progress */}
                    <div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-xs text-muted-foreground text-center mt-1">{progress}% เสร็จสิ้น</p>
                    </div>

                    {/* Full Vertical Timeline */}
                    <div className="space-y-0 pl-2">
                      {activeStatusKeys.map((stepKey, i) => {
                        const step = getStatusInfo(stepKey);
                        const StepIcon = step.icon;
                        const isCompleted = currentIdx > i;
                        const isCurrent = currentIdx === i;

                        let timestamp = '';
                        if (stepKey === 'pending') timestamp = new Date(selectedOrder.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                        if (stepKey === 'preparing' && selectedOrder.actual_prep_start) timestamp = new Date(selectedOrder.actual_prep_start).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                        if (stepKey === 'ready_for_pickup' && selectedOrder.actual_prep_end) timestamp = new Date(selectedOrder.actual_prep_end).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                        if (stepKey === 'picked_up' && selectedOrder.actual_pickup_time) timestamp = new Date(selectedOrder.actual_pickup_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                        if (stepKey === 'delivered' && selectedOrder.actual_delivery_time) timestamp = new Date(selectedOrder.actual_delivery_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

                        return (
                          <div key={stepKey} className="flex items-start gap-3">
                            <div className="flex flex-col items-center w-8 flex-shrink-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-500 text-white' :
                                isCurrent ? `${step.bg} ${step.color} ring-2 ring-offset-1 ${step.ring}` :
                                'bg-gray-100 text-gray-400'
                              }`}>
                                <StepIcon className="w-3 h-3" />
                              </div>
                              {i < activeStatusKeys.length - 1 && (
                                <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                              )}
                            </div>
                            <div className="pb-4 flex-1">
                              <div className={`text-sm font-semibold ${
                                isCurrent ? step.color : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </div>
                              <div className="text-xs text-muted-foreground">{step.sublabel}</div>
                              {timestamp && (
                                <div className="text-[10px] text-muted-foreground mt-0.5">🕐 {timestamp}</div>
                              )}
                              {isCurrent && selectedOrder.status_note && (
                                <div className="text-xs text-primary mt-0.5 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> {selectedOrder.status_note}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedOrder.customer_phone && (
                          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{selectedOrder.customer_phone}</div>
                        )}
                        {selectedOrder.driver_name && (
                          <div className="flex items-center gap-2 text-indigo-600 font-medium"><User className="w-4 h-4" />🏍️ {selectedOrder.driver_name}</div>
                        )}
                      </div>
                      {selectedOrder.delivery_address && (
                        <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" /><span>{selectedOrder.delivery_address}</span></div>
                      )}
                      <div className="flex justify-between font-medium">
                        <span>ยอดรวม</span><span>฿{selectedOrder.total_amount.toLocaleString()}</span>
                      </div>
                      {selectedOrder.delivery_fee > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>ค่าส่ง</span><span>฿{selectedOrder.delivery_fee.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Note + Advance */}
                    {!['delivered', 'cancelled', 'failed'].includes(selectedOrder.status) && nextInfo && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Input
                            placeholder="หมายเหตุสถานะ (เช่น ไรเดอร์กำลังมารับ)"
                            value={statusNote}
                            onChange={e => setStatusNote(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button className="flex-1" onClick={() => {
                              advanceStatus(selectedOrder, statusNote);
                              setStatusNote('');
                              setSelectedOrder(null);
                            }}>
                              <ArrowRight className="w-4 h-4 mr-1" /> {nextInfo.label}
                            </Button>
                            <Button variant="destructive" onClick={() => {
                              cancelOrder(selectedOrder.id);
                              setSelectedOrder(null);
                            }}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Rating */}
                    {selectedOrder.status === 'delivered' && selectedOrder.customer_rating && (
                      <div className="flex items-center justify-center gap-1 py-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-6 h-6 ${s <= selectedOrder.customer_rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

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
