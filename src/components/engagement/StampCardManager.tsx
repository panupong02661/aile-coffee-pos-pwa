
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Stamp, Trash2, Edit, Award, Coffee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StampCard {
  id: string;
  name: string;
  description: string | null;
  total_stamps: number;
  is_active: boolean;
  min_purchase_per_stamp: number;
  allow_multiple_cards: boolean;
  auto_reset_on_complete: boolean;
}

interface Milestone {
  id: string;
  stamp_card_id: string;
  stamp_number: number;
  reward_type: string;
  reward_value: number;
  reward_description: string | null;
  is_active: boolean;
}

const rewardTypes = [
  { value: 'discount_percent', label: 'ส่วนลด %' },
  { value: 'discount_fixed', label: 'ส่วนลด (บาท)' },
  { value: 'free_item', label: 'แถมสินค้า' },
  { value: 'free_drink', label: 'แถมเครื่องดื่ม' },
  { value: 'bonus_points', label: 'แต้มโบนัส' },
  { value: 'custom', label: 'กำหนดเอง' },
];

const StampCardManager = () => {
  const [stampCards, setStampCards] = useState<StampCard[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<StampCard | null>(null);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    total_stamps: 10,
    min_purchase_per_stamp: 0,
    allow_multiple_cards: true,
    auto_reset_on_complete: true,
  });

  const [milestoneForm, setMilestoneForm] = useState({
    stamp_number: 5,
    reward_type: 'discount_percent',
    reward_value: 10,
    reward_description: '',
  });

  useEffect(() => {
    fetchStampCards();
  }, []);

  const fetchStampCards = async () => {
    const { data: cards } = await supabase.from('stamp_cards').select('*').order('created_at', { ascending: false });
    if (cards) {
      setStampCards(cards);
      // Fetch milestones for all cards
      const { data: allMilestones } = await supabase.from('stamp_card_milestones').select('*').order('stamp_number');
      if (allMilestones) {
        const grouped: Record<string, Milestone[]> = {};
        allMilestones.forEach((m: any) => {
          if (!grouped[m.stamp_card_id]) grouped[m.stamp_card_id] = [];
          grouped[m.stamp_card_id].push(m);
        });
        setMilestones(grouped);
      }
    }
    setLoading(false);
  };

  const handleCreateCard = async () => {
    const { error } = await supabase.from('stamp_cards').insert({
      name: form.name,
      description: form.description || null,
      total_stamps: form.total_stamps,
      min_purchase_per_stamp: form.min_purchase_per_stamp,
      allow_multiple_cards: form.allow_multiple_cards,
      auto_reset_on_complete: form.auto_reset_on_complete,
    });
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'สร้างบัตรสำเร็จ' });
      setShowCreateDialog(false);
      setForm({ name: '', description: '', total_stamps: 10, min_purchase_per_stamp: 0, allow_multiple_cards: true, auto_reset_on_complete: true });
      fetchStampCards();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('stamp_cards').update({ is_active: isActive }).eq('id', id);
    fetchStampCards();
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('ยืนยันลบบัตรสะสมนี้?')) return;
    await supabase.from('stamp_cards').delete().eq('id', id);
    toast({ title: 'ลบบัตรสำเร็จ' });
    fetchStampCards();
  };

  const handleAddMilestone = async () => {
    if (!selectedCardId) return;
    const { error } = await supabase.from('stamp_card_milestones').insert({
      stamp_card_id: selectedCardId,
      stamp_number: milestoneForm.stamp_number,
      reward_type: milestoneForm.reward_type,
      reward_value: milestoneForm.reward_value,
      reward_description: milestoneForm.reward_description || null,
    });
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'เพิ่มรางวัลสำเร็จ' });
      setShowMilestoneDialog(false);
      setMilestoneForm({ stamp_number: 5, reward_type: 'discount_percent', reward_value: 10, reward_description: '' });
      fetchStampCards();
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    await supabase.from('stamp_card_milestones').delete().eq('id', id);
    toast({ title: 'ลบรางวัลสำเร็จ' });
    fetchStampCards();
  };

  const getRewardLabel = (type: string) => rewardTypes.find(r => r.value === type)?.label || type;

  if (loading) return <div className="text-center py-8">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Stamp className="w-5 h-5" /> บัตรสะสมแสตมป์
          </h3>
          <p className="text-sm text-muted-foreground">สร้างและจัดการบัตรสะสมแสตมป์พร้อมรางวัลตาม milestone</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-coffee-600 hover:bg-coffee-700">
              <Plus className="w-4 h-4 mr-2" /> สร้างบัตรใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>สร้างบัตรสะสมแสตมป์</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>ชื่อบัตร</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น Coffee Lover Card" />
              </div>
              <div>
                <Label>คำอธิบาย</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียดเพิ่มเติม" />
              </div>
              <div>
                <Label>จำนวนแสตมป์ทั้งหมด</Label>
                <Input type="number" value={form.total_stamps} onChange={(e) => setForm({ ...form, total_stamps: parseInt(e.target.value) || 10 })} />
              </div>
              <div>
                <Label>ยอดซื้อขั้นต่ำต่อ 1 แสตมป์ (บาท)</Label>
                <Input type="number" value={form.min_purchase_per_stamp} onChange={(e) => setForm({ ...form, min_purchase_per_stamp: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>อนุญาตหลายบัตรพร้อมกัน</Label>
                <Switch checked={form.allow_multiple_cards} onCheckedChange={(v) => setForm({ ...form, allow_multiple_cards: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>รีเซ็ตอัตโนมัติเมื่อครบ</Label>
                <Switch checked={form.auto_reset_on_complete} onCheckedChange={(v) => setForm({ ...form, auto_reset_on_complete: v })} />
              </div>
              <Button onClick={handleCreateCard} className="w-full bg-coffee-600 hover:bg-coffee-700">สร้างบัตร</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stampCards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Coffee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ยังไม่มีบัตรสะสมแสตมป์ กดปุ่ม "สร้างบัตรใหม่" เพื่อเริ่มต้น</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stampCards.map((card) => (
            <Card key={card.id} className={!card.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <Badge variant={card.is_active ? 'default' : 'secondary'}>
                      {card.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={card.is_active} onCheckedChange={(v) => handleToggleActive(card.id, v)} />
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {card.description && <p className="text-sm text-muted-foreground">{card.description}</p>}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-coffee-50 rounded">
                    <p className="text-2xl font-bold text-coffee-800">{card.total_stamps}</p>
                    <p className="text-xs text-muted-foreground">แสตมป์ทั้งหมด</p>
                  </div>
                  <div className="text-center p-2 bg-coffee-50 rounded">
                    <p className="text-2xl font-bold text-coffee-800">฿{card.min_purchase_per_stamp}</p>
                    <p className="text-xs text-muted-foreground">ขั้นต่ำ/แสตมป์</p>
                  </div>
                  <div className="text-center p-2 bg-coffee-50 rounded">
                    <p className="text-2xl font-bold text-coffee-800">{milestones[card.id]?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">รางวัล</p>
                  </div>
                </div>

                {/* Milestones visualization */}
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
                  {Array.from({ length: card.total_stamps }, (_, i) => {
                    const milestone = milestones[card.id]?.find(m => m.stamp_number === i + 1);
                    return (
                      <div key={i} className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        milestone ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-coffee-200 bg-white text-coffee-400'
                      }`}>
                        {milestone ? <Award className="w-4 h-4" /> : i + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Milestones list */}
                {milestones[card.id]?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {milestones[card.id].map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 bg-amber-50 rounded text-sm">
                        <span>
                          แสตมป์ที่ {m.stamp_number}: <strong>{getRewardLabel(m.reward_type)}</strong>
                          {m.reward_value > 0 && ` ${m.reward_value}${m.reward_type.includes('percent') ? '%' : ' บาท'}`}
                          {m.reward_description && ` — ${m.reward_description}`}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMilestone(m.id)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedCardId(card.id); setShowMilestoneDialog(true); }}
                >
                  <Plus className="w-4 h-4 mr-1" /> เพิ่มรางวัล
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มรางวัล Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>แสตมป์ที่ (ได้รางวัลเมื่อถึงดวงนี้)</Label>
              <Input type="number" value={milestoneForm.stamp_number} onChange={(e) => setMilestoneForm({ ...milestoneForm, stamp_number: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <Label>ประเภทรางวัล</Label>
              <Select value={milestoneForm.reward_type} onValueChange={(v) => setMilestoneForm({ ...milestoneForm, reward_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {rewardTypes.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ค่ารางวัล</Label>
              <Input type="number" value={milestoneForm.reward_value} onChange={(e) => setMilestoneForm({ ...milestoneForm, reward_value: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>คำอธิบายรางวัล</Label>
              <Input value={milestoneForm.reward_description} onChange={(e) => setMilestoneForm({ ...milestoneForm, reward_description: e.target.value })} placeholder="เช่น ชาเขียวฟรี 1 แก้ว" />
            </div>
            <Button onClick={handleAddMilestone} className="w-full bg-coffee-600 hover:bg-coffee-700">เพิ่มรางวัล</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StampCardManager;
