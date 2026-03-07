
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table as TableIcon, Plus, Users, Utensils, Sparkles, Wrench, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentShop } from '@/hooks/useCurrentShop';

interface RestaurantTable {
  id: string;
  table_number: string;
  table_name: string | null;
  capacity: number;
  status: string;
  current_order_id: string | null;
  shape: string;
  is_active: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  available: { label: 'ว่าง', color: 'bg-green-500', icon: Sparkles },
  occupied: { label: 'มีลูกค้า', color: 'bg-red-500', icon: Utensils },
  reserved: { label: 'จอง', color: 'bg-yellow-500', icon: Users },
  cleaning: { label: 'ทำความสะอาด', color: 'bg-blue-500', icon: Sparkles },
  maintenance: { label: 'ซ่อมบำรุง', color: 'bg-gray-500', icon: Wrench },
};

const TableManagement = () => {
  const { toast } = useToast();
  const { shopId } = useCurrentShop();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [form, setForm] = useState({ table_number: '', table_name: '', capacity: '4', shape: 'square' });

  const fetchTables = async () => {
    let query = supabase.from('restaurant_tables').select('*').eq('is_active', true).order('table_number');
    if (shopId) query = query.eq('shop_id', shopId);
    const { data } = await query;
    setTables(data || []);
  };

  useEffect(() => { fetchTables(); }, [shopId]);

  useEffect(() => {
    const channel = supabase.channel('tables-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, () => fetchTables())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shopId]);

  const saveTable = async () => {
    const payload = {
      table_number: form.table_number,
      table_name: form.table_name || null,
      capacity: parseInt(form.capacity) || 4,
      shape: form.shape,
      shop_id: shopId,
    };

    if (editingTable) {
      const { error } = await supabase.from('restaurant_tables').update(payload).eq('id', editingTable.id);
      if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
      toast({ title: 'อัปเดตโต๊ะสำเร็จ' });
    } else {
      const { error } = await supabase.from('restaurant_tables').insert(payload);
      if (error) { toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' }); return; }
      toast({ title: `เพิ่มโต๊ะ ${form.table_number} สำเร็จ` });
    }
    setForm({ table_number: '', table_name: '', capacity: '4', shape: 'square' });
    setEditingTable(null);
    setIsDialogOpen(false);
    fetchTables();
  };

  const updateTableStatus = async (id: string, status: string) => {
    await supabase.from('restaurant_tables').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchTables();
  };

  const deleteTable = async (id: string) => {
    await supabase.from('restaurant_tables').update({ is_active: false }).eq('id', id);
    toast({ title: 'ลบโต๊ะสำเร็จ' });
    fetchTables();
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setForm({ table_number: table.table_number, table_name: table.table_name || '', capacity: String(table.capacity), shape: table.shape });
    setIsDialogOpen(true);
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 px-2 md:px-6 pb-6">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <TableIcon className="w-6 h-6 text-primary" /> จัดการโต๊ะ
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditingTable(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> เพิ่มโต๊ะ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingTable ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะใหม่'}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>หมายเลขโต๊ะ</Label><Input value={form.table_number} onChange={e => setForm(p => ({ ...p, table_number: e.target.value }))} placeholder="เช่น T1, A01" /></div>
                <div><Label>ชื่อโต๊ะ (ไม่บังคับ)</Label><Input value={form.table_name} onChange={e => setForm(p => ({ ...p, table_name: e.target.value }))} placeholder="เช่น ริมหน้าต่าง" /></div>
                <div><Label>ความจุ (คน)</Label><Input type="number" min="1" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
                <div><Label>รูปทรง</Label>
                  <Select value={form.shape} onValueChange={v => setForm(p => ({ ...p, shape: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">สี่เหลี่ยม</SelectItem>
                      <SelectItem value="round">กลม</SelectItem>
                      <SelectItem value="rectangle">สี่เหลี่ยมผืนผ้า</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={saveTable}>{editingTable ? 'บันทึก' : 'เพิ่มโต๊ะ'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">ทั้งหมด</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-green-600">{stats.available}</div><div className="text-xs text-muted-foreground">ว่าง</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-red-600">{stats.occupied}</div><div className="text-xs text-muted-foreground">มีลูกค้า</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div><div className="text-xs text-muted-foreground">จอง</div></CardContent></Card>
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tables.map(table => {
            const config = statusConfig[table.status] || statusConfig.available;
            return (
              <Card key={table.id} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className={`w-3 h-3 rounded-full ${config.color} absolute top-2 right-2`} />
                  <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-${table.shape === 'round' ? 'full' : 'lg'} border-2 border-dashed mb-2 ${
                    table.status === 'available' ? 'border-green-400 bg-green-50' :
                    table.status === 'occupied' ? 'border-red-400 bg-red-50' :
                    table.status === 'reserved' ? 'border-yellow-400 bg-yellow-50' :
                    'border-gray-400 bg-gray-50'
                  }`}>
                    <span className="text-lg font-bold">{table.table_number}</span>
                  </div>
                  {table.table_name && <p className="text-xs text-muted-foreground truncate">{table.table_name}</p>}
                  <Badge variant="outline" className="text-[10px] mt-1">{config.label} · {table.capacity}คน</Badge>

                  {/* Status Actions */}
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {table.status !== 'available' && (
                      <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateTableStatus(table.id, 'available')}>ว่าง</Button>
                    )}
                    {table.status === 'available' && (
                      <>
                        <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateTableStatus(table.id, 'occupied')}>มีลูกค้า</Button>
                        <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateTableStatus(table.id, 'reserved')}>จอง</Button>
                      </>
                    )}
                  </div>

                  {/* Edit/Delete */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex gap-1 justify-center">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEdit(table)}><Edit className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteTable(table.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {tables.length === 0 && (
            <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">
              ยังไม่มีโต๊ะ — กดปุ่ม "เพิ่มโต๊ะ" เพื่อเริ่มตั้งค่า
            </CardContent></Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TableManagement;
