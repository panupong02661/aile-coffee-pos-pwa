
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Palette, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FestivalThemeManager = () => {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '',
    primary_color: '#FF0000', secondary_color: '#FFD700', accent_color: '#FFFFFF',
    background_gradient: 'linear-gradient(135deg, #FF0000, #FFD700)',
    icon_set: 'default',
    start_date: '', end_date: '',
  });

  useEffect(() => { fetchThemes(); }, []);

  const fetchThemes = async () => {
    const { data } = await supabase.from('festival_themes').select('*').order('created_at', { ascending: false });
    if (data) setThemes(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    const { error } = await supabase.from('festival_themes').insert({
      name: form.name,
      description: form.description || null,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      accent_color: form.accent_color,
      background_gradient: form.background_gradient || null,
      icon_set: form.icon_set,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
    if (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'สร้างธีมสำเร็จ' });
      setShowCreateDialog(false);
      fetchThemes();
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    // Deactivate all others first if activating
    if (isActive) {
      await supabase.from('festival_themes').update({ is_active: false }).neq('id', id);
    }
    await supabase.from('festival_themes').update({ is_active: isActive }).eq('id', id);
    fetchThemes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันลบธีมนี้?')) return;
    await supabase.from('festival_themes').delete().eq('id', id);
    toast({ title: 'ลบธีมสำเร็จ' });
    fetchThemes();
  };

  const presets = [
    { name: '🧧 ตรุษจีน', primary: '#CC0000', secondary: '#FFD700', accent: '#FFFFFF', gradient: 'linear-gradient(135deg, #CC0000, #FFD700)' },
    { name: '🎄 คริสต์มาส', primary: '#006400', secondary: '#CC0000', accent: '#FFFFFF', gradient: 'linear-gradient(135deg, #006400, #CC0000)' },
    { name: '💦 สงกรานต์', primary: '#0099CC', secondary: '#FFD700', accent: '#FFFFFF', gradient: 'linear-gradient(135deg, #0099CC, #FFD700)' },
    { name: '🎃 ฮาโลวีน', primary: '#FF6600', secondary: '#333333', accent: '#FFFFFF', gradient: 'linear-gradient(135deg, #FF6600, #333333)' },
    { name: '💕 วาเลนไทน์', primary: '#FF1493', secondary: '#FF69B4', accent: '#FFFFFF', gradient: 'linear-gradient(135deg, #FF1493, #FF69B4)' },
  ];

  if (loading) return <div className="text-center py-8">กำลังโหลด...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" /> ธีมเทศกาล
          </h3>
          <p className="text-sm text-muted-foreground">เปลี่ยนหน้าตาแอปลูกค้าตามเทศกาล</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> สร้างธีม</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>สร้างธีมใหม่</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <Label>เทมเพลตสำเร็จรูป</Label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {presets.map((p) => (
                    <Button key={p.name} variant="outline" size="sm" onClick={() => setForm({
                      ...form, name: p.name, primary_color: p.primary, secondary_color: p.secondary,
                      accent_color: p.accent, background_gradient: p.gradient,
                    })}>
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>ชื่อธีม</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>คำอธิบาย</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>สีหลัก</Label>
                  <Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
                </div>
                <div>
                  <Label>สีรอง</Label>
                  <Input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} />
                </div>
                <div>
                  <Label>สี Accent</Label>
                  <Input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
                </div>
              </div>
              {/* Preview */}
              <div>
                <Label>ตัวอย่าง</Label>
                <div className="rounded-lg p-6 text-center mt-1" style={{ background: form.background_gradient, color: form.accent_color }}>
                  <p className="text-lg font-bold">{form.name || 'ชื่อธีม'}</p>
                  <p className="text-sm opacity-80">{form.description || 'คำอธิบาย'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>วันเริ่ม</Label>
                  <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>วันสิ้นสุด</Label>
                  <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-primary hover:bg-primary/90">สร้างธีม</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {themes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ยังไม่มีธีม กดสร้างธีมใหม่หรือเลือกจากเทมเพลต</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {themes.map((theme) => (
            <Card key={theme.id} className={!theme.is_active ? 'opacity-60' : ''}>
              <div className="h-24 rounded-t-lg" style={{ background: theme.background_gradient || `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})` }}>
                <div className="h-full flex items-center justify-center" style={{ color: theme.accent_color }}>
                  <p className="text-xl font-bold">{theme.name}</p>
                </div>
              </div>
              <CardContent className="pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={theme.is_active ? 'default' : 'secondary'}>
                      {theme.is_active ? 'ใช้งานอยู่' : 'ปิด'}
                    </Badge>
                    {theme.start_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(theme.start_date).toLocaleDateString('th-TH')} — {theme.end_date ? new Date(theme.end_date).toLocaleDateString('th-TH') : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={theme.is_active} onCheckedChange={(v) => handleToggle(theme.id, v)} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(theme.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FestivalThemeManager;
