
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Volume2, Check, X, Clock, UserCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface QueueTicket {
  id: string;
  queue_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  party_size: number;
  status: string;
  notes: string | null;
  called_at: string | null;
  seated_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  called: 'bg-blue-50 text-blue-800 border-blue-300',
  seated: 'bg-green-50 text-green-800 border-green-300',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-red-50 text-red-800 border-red-300',
};

const statusLabels: Record<string, string> = {
  waiting: 'รอคิว',
  called: 'เรียกแล้ว',
  seated: 'นั่งแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

const QueueManagement = () => {
  const { toast } = useToast();
  const { shopId } = useCurrentShop();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>('active');
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', party_size: '1', notes: '' });

  const fetchTickets = async () => {
    let query = supabase
      .from('queue_tickets')
      .select('*')
      .order('queue_number', { ascending: true });

    if (shopId) query = query.eq('shop_id', shopId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte('created_at', today.toISOString());

    if (filter === 'active') {
      query = query.in('status', ['waiting', 'called', 'seated']);
    }

    const { data, error } = await query;
    if (error) { console.error(error); return; }
    setTickets(data || []);
  };

  useEffect(() => { fetchTickets(); }, [shopId, filter]);

  useEffect(() => {
    const channel = supabase.channel('queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shopId, filter]);

  const getNextQueueNumber = (): number => {
    const todayTickets = tickets.filter(t => t.status !== 'cancelled');
    return todayTickets.length > 0 ? Math.max(...todayTickets.map(t => t.queue_number)) + 1 : 1;
  };

  const createTicket = async () => {
    const nextNum = getNextQueueNumber();
    const { error } = await supabase.from('queue_tickets').insert({
      queue_number: nextNum,
      customer_name: form.customer_name || null,
      customer_phone: form.customer_phone || null,
      party_size: parseInt(form.party_size) || 1,
      notes: form.notes || null,
      shop_id: shopId,
      status: 'waiting',
    });
    if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
    toast({ title: `สร้างคิว #${nextNum} สำเร็จ` });
    setForm({ customer_name: '', customer_phone: '', party_size: '1', notes: '' });
    setIsDialogOpen(false);
    fetchTickets();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'called') updates.called_at = new Date().toISOString();
    if (newStatus === 'seated') updates.seated_at = new Date().toISOString();
    if (newStatus === 'completed') updates.completed_at = new Date().toISOString();

    const { error } = await supabase.from('queue_tickets').update(updates).eq('id', id);
    if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }

    if (newStatus === 'called') {
      const ticket = tickets.find(t => t.id === id);
      toast({ title: `📢 เรียกคิว #${ticket?.queue_number}`, description: ticket?.customer_name || '' });
      try { new Audio('/sounds/default-notification.mp3').play(); } catch {}
    }
    fetchTickets();
  };

  const waiting = tickets.filter(t => t.status === 'waiting');
  const called = tickets.filter(t => t.status === 'called');
  const seated = tickets.filter(t => t.status === 'seated');

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 md:ml-[56px] px-3 md:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 mt-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">ระบบจัดการคิว</h1>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">กำลังใช้งาน</SelectItem>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-1" /> เพิ่มคิว</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>สร้างคิวใหม่</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>ชื่อลูกค้า</Label><Input value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
                    <div><Label>เบอร์โทร</Label><Input value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))} /></div>
                    <div><Label>จำนวนคน</Label><Input type="number" min="1" value={form.party_size} onChange={e => setForm(p => ({ ...p, party_size: e.target.value }))} /></div>
                    <div><Label>หมายเหตุ</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                    <Button className="w-full" onClick={createTicket}>สร้างคิว #{getNextQueueNumber()}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <Card><CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-600">{waiting.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">รอคิว</div>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">{called.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">เรียกแล้ว</div>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">{seated.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">นั่งแล้ว</div>
            </CardContent></Card>
          </div>

          {/* Queue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {tickets.map(ticket => (
              <Card key={ticket.id} className={`border-2 ${statusColors[ticket.status] || ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold">#{ticket.queue_number}</span>
                    <Badge variant="outline" className={statusColors[ticket.status]}>
                      {statusLabels[ticket.status]}
                    </Badge>
                  </div>
                  {ticket.customer_name && <p className="text-sm font-medium">{ticket.customer_name}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Users className="w-3 h-3" /> {ticket.party_size} คน
                    <Clock className="w-3 h-3 ml-2" /> {new Date(ticket.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {ticket.notes && <p className="text-xs text-muted-foreground mt-1 italic">{ticket.notes}</p>}

                  <div className="flex gap-1 mt-3">
                    {ticket.status === 'waiting' && (
                      <>
                        <Button size="sm" className="flex-1" onClick={() => updateStatus(ticket.id, 'called')}>
                          <Volume2 className="w-3 h-3 mr-1" /> เรียกคิว
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(ticket.id, 'cancelled')}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {ticket.status === 'called' && (
                      <>
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => updateStatus(ticket.id, 'seated')}>
                          <UserCheck className="w-3 h-3 mr-1" /> นั่งแล้ว
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(ticket.id, 'waiting')}>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {ticket.status === 'seated' && (
                      <Button size="sm" className="flex-1" variant="outline" onClick={() => updateStatus(ticket.id, 'completed')}>
                        <Check className="w-3 h-3 mr-1" /> เสร็จสิ้น
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {tickets.length === 0 && (
              <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">
                ยังไม่มีคิววันนี้ — กดปุ่ม "เพิ่มคิว" เพื่อเริ่มต้น
              </CardContent></Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueueManagement;
