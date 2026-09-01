
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, PartyPopper, RotateCcw, Calendar, Gift, Award, Percent } from 'lucide-react';

const eventTypes = [
  { value: 'lucky_envelope', label: '🧧 อั่งเปาสุ่มรางวัล', icon: PartyPopper },
  { value: 'spin_wheel', label: '🎡 วงล้อนำโชค', icon: RotateCcw },
  { value: 'advent_calendar', label: '🎄 Advent Calendar', icon: Calendar },
  { value: 'gift_box', label: '🎁 สุ่มกล่องของขวัญ', icon: Gift },
];

const prizeTypes = [
  { value: 'discount_percent', label: 'ส่วนลด %' },
  { value: 'discount_fixed', label: 'ส่วนลด (บาท)' },
  { value: 'free_item', label: 'แถมสินค้า' },
  { value: 'free_drink', label: 'แถมเครื่องดื่ม' },
  { value: 'bonus_points', label: 'แต้มโบนัส' },
  { value: 'coupon', label: 'คูปอง' },
  { value: 'custom', label: 'กำหนดเอง' },
  { value: 'no_prize', label: 'ไม่ได้รางวัล' },
];

const FestivalEventManager = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPrizeDialog, setShowPrizeDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    name: '', description: '', event_type: 'lucky_envelope',
    start_date: '', end_date: '', theme_color: '#FF0000',
    theme_secondary_color: '#FFD700', max_claims_per_customer: 1,
    min_tier: 'silver', advent_total_days: 25, gift_box_choices: 3,
  });

  const [prizeForm, setPrizeForm] = useState({
    name: '', description: '', prize_type: 'discount_percent',
    prize_value: 10, probability_weight: 10, total_quantity: 100,
    min_tier: 'silver', advent_day: 1,
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('festival_events').select('*').order('created_at', { ascending: false });
    if (data) {
      setEvents(data);
      const { data: allPrizes } = await supabase.from('festival_prizes').select('*').order('probability_weight', { ascending: false });
      if (allPrizes) {
        const grouped: Record<string, any[]> = {};
        allPrizes.forEach((p: any) => {
          if (!grouped[p.festival_event_id]) grouped[p.festival_event_id] = [];
          grouped[p.festival_event_id].push(p);
        });
        setPrizes(grouped);
      }
    }
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    const { error } = await supabase.from('festival_events').insert({
      name: eventForm.name,
      description: eventForm.description || null,
      event_type: eventForm.event_type,
      start_date: eventForm.start_date || new Date().toISOString(),
      end_date: eventForm.end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
      theme_color: eventForm.theme_color,
      theme_secondary_color: eventForm.theme_secondary_color,
      max_claims_per_customer: eventForm.max_claims_per_customer,
      min_tier: eventForm.min_tier,
      advent_total_days: eventForm.advent_total_days,
      gift_box_choices: eventForm.gift_box_choices,
    });
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'สร้างกิจกรรมสำเร็จ' });
      setShowCreateDialog(false);
      fetchEvents();
    }
  };

  const handleToggleEvent = async (id: string, isActive: boolean) => {
    await supabase.from('festival_events').update({ is_active: isActive }).eq('id', id);
    fetchEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('ยืนยันลบกิจกรรมนี้?')) return;
    await supabase.from('festival_events').delete().eq('id', id);
    toast({ title: 'ลบกิจกรรมสำเร็จ' });
    fetchEvents();
  };

  const handleAddPrize = async () => {
    if (!selectedEventId) return;
    const { error } = await supabase.from('festival_prizes').insert({
      festival_event_id: selectedEventId,
      name: prizeForm.name,
      description: prizeForm.description || null,
      prize_type: prizeForm.prize_type,
      prize_value: prizeForm.prize_value,
      probability_weight: prizeForm.probability_weight,
      total_quantity: prizeForm.total_quantity || null,
      min_tier: prizeForm.min_tier,
      advent_day: prizeForm.advent_day || null,
    });
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'เพิ่มรางวัลสำเร็จ' });
      setShowPrizeDialog(false);
      fetchEvents();
    }
  };

  const handleDeletePrize = async (id: string) => {
    await supabase.from('festival_prizes').delete().eq('id', id);
    toast({ title: 'ลบรางวัลสำเร็จ' });
    fetchEvents();
  };

  const getEventIcon = (type: string) => eventTypes.find(e => e.value === type)?.label || type;
  const getPrizeLabel = (type: string) => prizeTypes.find(p => p.value === type)?.label || type;

  const getTotalProbability = (eventId: string) => {
    return prizes[eventId]?.reduce((sum, p) => sum + (p.probability_weight || 0), 0) || 0;
  };

  if (loading) return <div className="text-center py-8">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <PartyPopper className="w-5 h-5" /> กิจกรรมเทศกาล
          </h3>
          <p className="text-sm text-muted-foreground">สร้างกิจกรรมสุ่มรางวัล อั่งเปา วงล้อ Advent Calendar กล่องสุ่ม</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> สร้างกิจกรรม</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>สร้างกิจกรรมใหม่</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>ชื่อกิจกรรม</Label>
                <Input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} placeholder="เช่น ตรุษจีน 2026" />
              </div>
              <div>
                <Label>ประเภทกิจกรรม</Label>
                <Select value={eventForm.event_type} onValueChange={(v) => setEventForm({ ...eventForm, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>คำอธิบาย</Label>
                <Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>วันเริ่ม</Label>
                  <Input type="datetime-local" value={eventForm.start_date} onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>วันสิ้นสุด</Label>
                  <Input type="datetime-local" value={eventForm.end_date} onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>สีหลัก</Label>
                  <Input type="color" value={eventForm.theme_color} onChange={(e) => setEventForm({ ...eventForm, theme_color: e.target.value })} />
                </div>
                <div>
                  <Label>สีรอง</Label>
                  <Input type="color" value={eventForm.theme_secondary_color} onChange={(e) => setEventForm({ ...eventForm, theme_secondary_color: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>จำนวนครั้งที่ลูกค้ารับได้</Label>
                <Input type="number" value={eventForm.max_claims_per_customer} onChange={(e) => setEventForm({ ...eventForm, max_claims_per_customer: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>ระดับสมาชิกขั้นต่ำ</Label>
                <Select value={eventForm.min_tier} onValueChange={(v) => setEventForm({ ...eventForm, min_tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {eventForm.event_type === 'advent_calendar' && (
                <div>
                  <Label>จำนวนวัน Advent</Label>
                  <Input type="number" value={eventForm.advent_total_days} onChange={(e) => setEventForm({ ...eventForm, advent_total_days: parseInt(e.target.value) || 25 })} />
                </div>
              )}
              {eventForm.event_type === 'gift_box' && (
                <div>
                  <Label>จำนวนกล่องให้เลือก</Label>
                  <Input type="number" value={eventForm.gift_box_choices} onChange={(e) => setEventForm({ ...eventForm, gift_box_choices: parseInt(e.target.value) || 3 })} />
                </div>
              )}
              <Button onClick={handleCreateEvent} className="w-full bg-primary hover:bg-primary/90">สร้างกิจกรรม</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <PartyPopper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ยังไม่มีกิจกรรม กดสร้างกิจกรรมใหม่เพื่อเริ่มต้น</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const totalProb = getTotalProbability(event.id);
            return (
              <Card key={event.id} className={!event.is_active ? 'opacity-60' : ''} style={{ borderLeft: `4px solid ${event.theme_color}` }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getEventIcon(event.event_type)?.slice(0, 2)}</span>
                      <div>
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString('th-TH')} — {new Date(event.end_date).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <Badge variant={event.is_active ? 'default' : 'secondary'}>
                        {event.is_active ? 'เปิดใช้งาน' : 'ปิด'}
                      </Badge>
                      <Badge variant="outline">Tier ขั้นต่ำ: {event.min_tier}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={event.is_active} onCheckedChange={(v) => handleToggleEvent(event.id, v)} />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                </CardHeader>
                <CardContent>
                  {/* Prizes */}
                  {prizes[event.id]?.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium">รางวัล ({prizes[event.id].length} รายการ) — น้ำหนักรวม: {totalProb}</h4>
                      {prizes[event.id].map((prize) => {
                        const prob = totalProb > 0 ? ((prize.probability_weight / totalProb) * 100).toFixed(1) : 0;
                        return (
                          <div key={prize.id} className="flex items-center justify-between p-2 rounded text-sm" style={{ backgroundColor: `${event.theme_color}10` }}>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              <span><strong>{prize.name}</strong> — {getPrizeLabel(prize.prize_type)} {prize.prize_value > 0 && `${prize.prize_value}`}</span>
                              <Badge variant="outline" className="text-xs">{prob}%</Badge>
                              {prize.total_quantity && (
                                <Badge variant="secondary" className="text-xs">{prize.claimed_quantity}/{prize.total_quantity}</Badge>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePrize(prize.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => { setSelectedEventId(event.id); setShowPrizeDialog(true); }}>
                    <Plus className="w-4 h-4 mr-1" /> เพิ่มรางวัล
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Prize Dialog */}
      <Dialog open={showPrizeDialog} onOpenChange={setShowPrizeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>เพิ่มรางวัล</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ชื่อรางวัล</Label>
              <Input value={prizeForm.name} onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })} placeholder="เช่น ส่วนลด 10%" />
            </div>
            <div>
              <Label>ประเภท</Label>
              <Select value={prizeForm.prize_type} onValueChange={(v) => setPrizeForm({ ...prizeForm, prize_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {prizeTypes.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ค่ารางวัล</Label>
              <Input type="number" value={prizeForm.prize_value} onChange={(e) => setPrizeForm({ ...prizeForm, prize_value: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>น้ำหนักความน่าจะเป็น (ยิ่งสูง ยิ่งมีโอกาสได้มาก)</Label>
              <Input type="number" value={prizeForm.probability_weight} onChange={(e) => setPrizeForm({ ...prizeForm, probability_weight: parseFloat(e.target.value) || 1 })} />
            </div>
            <div>
              <Label>จำนวนจำกัด (เว้นว่างถ้าไม่จำกัด)</Label>
              <Input type="number" value={prizeForm.total_quantity} onChange={(e) => setPrizeForm({ ...prizeForm, total_quantity: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>ระดับสมาชิกขั้นต่ำ</Label>
              <Select value={prizeForm.min_tier} onValueChange={(v) => setPrizeForm({ ...prizeForm, min_tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddPrize} className="w-full bg-primary hover:bg-primary/90">เพิ่มรางวัล</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FestivalEventManager;
