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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table as TableIcon, Plus, Users, Utensils, Sparkles, Wrench, Edit, Trash2, ArrowRight, Merge, LayoutGrid, Map } from 'lucide-react';
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
  pos_x: number;
  pos_y: number;
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
  const [viewMode, setViewMode] = useState<'grid' | 'floorplan'>('grid');

  // Merge & Move state
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeFrom, setMergeFrom] = useState('');
  const [mergeTo, setMergeTo] = useState('');
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState('');

  // Floor plan drag state
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fetchTables = async () => {
    let query = supabase.from('restaurant_tables').select('*').eq('is_active', true).order('table_number');
    if (shopId) query = query.eq('shop_id', shopId);
    const { data } = await query;
    setTables((data as any[])?.map(d => ({ ...d, pos_x: d.pos_x || 0, pos_y: d.pos_y || 0 })) || []);
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

  // Merge tables: combine orders from two occupied tables into one
  const handleMergeTables = async () => {
    if (!mergeFrom || !mergeTo || mergeFrom === mergeTo) {
      toast({ title: 'กรุณาเลือกโต๊ะที่ต่างกัน', variant: 'destructive' });
      return;
    }
    try {
      // Move all table_orders from mergeFrom to mergeTo
      await supabase
        .from('table_orders')
        .update({ table_id: mergeTo })
        .eq('table_id', mergeFrom);

      // Set source table to available
      await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', mergeFrom);
      // Set target table to occupied
      await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', mergeTo);

      toast({ title: 'รวมโต๊ะสำเร็จ', description: 'ย้ายออเดอร์ทั้งหมดไปยังโต๊ะปลายทางแล้ว' });
      setIsMergeOpen(false);
      setMergeFrom('');
      setMergeTo('');
      fetchTables();
    } catch (error) {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  // Move specific items from one table to another
  const handleMoveTables = async () => {
    if (!moveFrom || !moveTo || moveFrom === moveTo) {
      toast({ title: 'กรุณาเลือกโต๊ะที่ต่างกัน', variant: 'destructive' });
      return;
    }
    try {
      await supabase
        .from('table_orders')
        .update({ table_id: moveTo })
        .eq('table_id', moveFrom);

      await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', moveFrom);
      await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', moveTo);

      toast({ title: 'ย้ายโต๊ะสำเร็จ', description: 'ย้ายรายการทั้งหมดไปยังโต๊ะใหม่แล้ว' });
      setIsMoveOpen(false);
      setMoveFrom('');
      setMoveTo('');
      fetchTables();
    } catch (error) {
      toast({ title: 'เกิดข้อผิดพลาด', variant: 'destructive' });
    }
  };

  // Floor plan drag
  const handleFloorMouseDown = (tableId: string, e: React.MouseEvent) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    setDragging(tableId);
    setDragOffset({ x: e.clientX - table.pos_x, y: e.clientY - table.pos_y });
  };

  const handleFloorMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const container = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - container.left - dragOffset.x + (tables.find(t => t.id === dragging)?.pos_x || 0), container.width - 100));
    const newY = Math.max(0, Math.min(e.clientY - container.top - dragOffset.y + (tables.find(t => t.id === dragging)?.pos_y || 0), container.height - 80));
    setTables(prev => prev.map(t => t.id === dragging ? { ...t, pos_x: e.clientX - container.left - 50, pos_y: e.clientY - container.top - 40 } : t));
  };

  const handleFloorMouseUp = async () => {
    if (!dragging) return;
    const table = tables.find(t => t.id === dragging);
    if (table) {
      await supabase.from('restaurant_tables').update({ pos_x: table.pos_x, pos_y: table.pos_y }).eq('id', table.id);
    }
    setDragging(null);
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  const occupiedTables = tables.filter(t => t.status === 'occupied');

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 md:ml-[56px] px-3 md:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 mt-4 flex-wrap gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">จัดการโต๊ะ</h1>
            <div className="flex gap-2 flex-wrap">
              {/* Merge */}
              <Dialog open={isMergeOpen} onOpenChange={setIsMergeOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Merge className="w-4 h-4 mr-1" /> รวมโต๊ะ</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>รวมโต๊ะ</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">ย้ายออเดอร์ทั้งหมดจากโต๊ะต้นทางไปรวมที่โต๊ะปลายทาง</p>
                  <div className="space-y-3">
                    <div>
                      <Label>จากโต๊ะ</Label>
                      <Select value={mergeFrom} onValueChange={setMergeFrom}>
                        <SelectTrigger><SelectValue placeholder="เลือกโต๊ะต้นทาง" /></SelectTrigger>
                        <SelectContent>
                          {occupiedTables.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.table_number} {t.table_name ? `(${t.table_name})` : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-muted-foreground" /></div>
                    <div>
                      <Label>ไปรวมที่โต๊ะ</Label>
                      <Select value={mergeTo} onValueChange={setMergeTo}>
                        <SelectTrigger><SelectValue placeholder="เลือกโต๊ะปลายทาง" /></SelectTrigger>
                        <SelectContent>
                          {tables.filter(t => t.id !== mergeFrom).map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.table_number} {t.table_name ? `(${t.table_name})` : ''} — {statusConfig[t.status]?.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={handleMergeTables}>รวมโต๊ะ</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Move */}
              <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><ArrowRight className="w-4 h-4 mr-1" /> ย้ายโต๊ะ</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>ย้ายโต๊ะ</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">ย้ายลูกค้าและออเดอร์ทั้งหมดไปโต๊ะอื่น</p>
                  <div className="space-y-3">
                    <div>
                      <Label>จากโต๊ะ</Label>
                      <Select value={moveFrom} onValueChange={setMoveFrom}>
                        <SelectTrigger><SelectValue placeholder="เลือกโต๊ะเดิม" /></SelectTrigger>
                        <SelectContent>
                          {occupiedTables.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.table_number} {t.table_name ? `(${t.table_name})` : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-muted-foreground" /></div>
                    <div>
                      <Label>ไปโต๊ะ</Label>
                      <Select value={moveTo} onValueChange={setMoveTo}>
                        <SelectTrigger><SelectValue placeholder="เลือกโต๊ะใหม่" /></SelectTrigger>
                        <SelectContent>
                          {tables.filter(t => t.status === 'available' && t.id !== moveFrom).map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.table_number} {t.table_name ? `(${t.table_name})` : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={handleMoveTables}>ย้ายโต๊ะ</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* View toggle */}
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'floorplan' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('floorplan')}
              >
                <Map className="w-4 h-4" />
              </Button>

              {/* Add */}
              <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditingTable(null); }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> เพิ่มโต๊ะ</Button>
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
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card><CardContent className="p-4 text-center"><div className="text-2xl md:text-3xl font-bold">{stats.total}</div><div className="text-xs md:text-sm text-muted-foreground">ทั้งหมด</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-green-600">{stats.available}</div><div className="text-xs md:text-sm text-muted-foreground">ว่าง</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-red-600">{stats.occupied}</div><div className="text-xs md:text-sm text-muted-foreground">มีลูกค้า</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.reserved}</div><div className="text-xs md:text-sm text-muted-foreground">จอง</div></CardContent></Card>
          </div>

          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {tables.map(table => {
                const config = statusConfig[table.status] || statusConfig.available;
                return (
                  <Card key={table.id} className="relative group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className={`w-3 h-3 rounded-full ${config.color} absolute top-2 right-2`} />
                      <div className={`mx-auto w-16 h-16 flex items-center justify-center ${table.shape === 'round' ? 'rounded-full' : 'rounded-lg'} border-2 border-dashed mb-2 ${
                        table.status === 'available' ? 'border-green-400 bg-green-50' :
                        table.status === 'occupied' ? 'border-red-400 bg-red-50' :
                        table.status === 'reserved' ? 'border-yellow-400 bg-yellow-50' :
                        'border-muted bg-muted/30'
                      }`}>
                        <span className="text-lg font-bold">{table.table_number}</span>
                      </div>
                      {table.table_name && <p className="text-xs text-muted-foreground truncate">{table.table_name}</p>}
                      <Badge variant="outline" className="text-[10px] mt-1">{config.label} · {table.capacity}คน</Badge>
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
          ) : (
            /* Floor Plan View */
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">ลากโต๊ะเพื่อจัดตำแหน่งตามผังร้านจริง</p>
                <div
                  className="relative bg-muted/20 border-2 border-dashed rounded-lg"
                  style={{ height: 500 }}
                  onMouseMove={handleFloorMouseMove}
                  onMouseUp={handleFloorMouseUp}
                  onMouseLeave={handleFloorMouseUp}
                >
                  {tables.map(table => {
                    const config = statusConfig[table.status] || statusConfig.available;
                    return (
                      <div
                        key={table.id}
                        className={`absolute cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center border-2 shadow-md ${
                          table.shape === 'round' ? 'rounded-full' : table.shape === 'rectangle' ? 'rounded-lg' : 'rounded-lg'
                        } ${
                          table.status === 'available' ? 'border-green-400 bg-green-50' :
                          table.status === 'occupied' ? 'border-red-400 bg-red-50' :
                          table.status === 'reserved' ? 'border-yellow-400 bg-yellow-50' :
                          'border-muted bg-muted/30'
                        }`}
                        style={{
                          left: table.pos_x,
                          top: table.pos_y,
                          width: table.shape === 'rectangle' ? 120 : 80,
                          height: 80,
                          zIndex: dragging === table.id ? 50 : 10,
                        }}
                        onMouseDown={e => handleFloorMouseDown(table.id, e)}
                      >
                        <span className="font-bold text-sm">{table.table_number}</span>
                        <span className="text-[10px] text-muted-foreground">{config.label}</span>
                        <span className="text-[10px]">{table.capacity}คน</span>
                      </div>
                    );
                  })}
                  {tables.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      เพิ่มโต๊ะก่อนเพื่อเริ่มจัดผัง
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TableManagement;
