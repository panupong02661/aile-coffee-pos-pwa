
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseData, DatabaseTable, DatabaseTableArea } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, TableIcon, Users, Edit, Trash2, MapPin } from 'lucide-react';

const TableManagement = () => {
  const { tables, tableAreas, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DatabaseTable | null>(null);
  const [editingArea, setEditingArea] = useState<DatabaseTableArea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tableForm, setTableForm] = useState({
    table_number: '',
    area_id: '',
    capacity: 4,
    position_x: 0,
    position_y: 0,
  });

  const [areaForm, setAreaForm] = useState({
    name: '',
    description: '',
  });

  const resetTableForm = () => {
    setTableForm({
      table_number: '',
      area_id: '',
      capacity: 4,
      position_x: 0,
      position_y: 0,
    });
    setEditingTable(null);
  };

  const resetAreaForm = () => {
    setAreaForm({
      name: '',
      description: '',
    });
    setEditingArea(null);
  };

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTable) {
        const { error } = await supabase
          .from('tables')
          .update(tableForm)
          .eq('id', editingTable.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตข้อมูลโต๊ะแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('tables')
          .insert([tableForm]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'เพิ่มโต๊ะใหม่แล้ว',
        });
      }

      setIsTableOpen(false);
      resetTableForm();
      refetch.tables();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingArea) {
        const { error } = await supabase
          .from('table_areas')
          .update(areaForm)
          .eq('id', editingArea.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตข้อมูลพื้นที่แล้ว',
        });
      } else {
        const { error } = await supabase
          .from('table_areas')
          .insert([areaForm]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'เพิ่มพื้นที่ใหม่แล้ว',
        });
      }

      setIsAreaOpen(false);
      resetAreaForm();
      refetch.tableAreas();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTable = (table: DatabaseTable) => {
    setTableForm({
      table_number: table.table_number,
      area_id: table.area_id || '',
      capacity: table.capacity,
      position_x: table.position_x,
      position_y: table.position_y,
    });
    setEditingTable(table);
    setIsTableOpen(true);
  };

  const handleEditArea = (area: DatabaseTableArea) => {
    setAreaForm({
      name: area.name,
      description: area.description || '',
    });
    setEditingArea(area);
    setIsAreaOpen(true);
  };

  const updateTableStatus = async (table: DatabaseTable, status: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status })
        .eq('id', table.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: `อัปเดตสถานะโต๊ะ ${table.table_number} แล้ว`,
      });

      refetch.tables();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'ว่าง';
      case 'occupied': return 'มีลูกค้า';
      case 'reserved': return 'จอง';
      case 'maintenance': return 'ซ่อมแซม';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">จัดการโต๊ะ</h1>
        <div className="flex space-x-2">
          <Dialog open={isAreaOpen} onOpenChange={setIsAreaOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetAreaForm}>
                <MapPin className="w-4 h-4 mr-2" />
                จัดการพื้นที่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingArea ? 'แก้ไขพื้นที่' : 'เพิ่มพื้นที่ใหม่'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAreaSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="area-name">ชื่อพื้นที่ *</Label>
                  <Input
                    id="area-name"
                    value={areaForm.name}
                    onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                    required
                    placeholder="เช่น ชั้น 1, ระเบียง"
                  />
                </div>
                <div>
                  <Label htmlFor="area-description">คำอธิบาย</Label>
                  <Input
                    id="area-description"
                    value={areaForm.description}
                    onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
                    placeholder="คำอธิบายเพิ่มเติม"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAreaOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !areaForm.name}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isTableOpen} onOpenChange={setIsTableOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetTableForm}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มโต๊ะ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTable ? 'แก้ไขโต๊ะ' : 'เพิ่มโต๊ะใหม่'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTableSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="table-number">หมายเลขโต๊ะ *</Label>
                  <Input
                    id="table-number"
                    value={tableForm.table_number}
                    onChange={(e) => setTableForm({ ...tableForm, table_number: e.target.value })}
                    required
                    placeholder="เช่น A1, B2, 01"
                  />
                </div>
                <div>
                  <Label htmlFor="area">พื้นที่</Label>
                  <Select
                    value={tableForm.area_id}
                    onValueChange={(value) => setTableForm({ ...tableForm, area_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกพื้นที่" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">จำนวนที่นั่ง</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="20"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTableOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !tableForm.table_number}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {tableAreas.map((area) => {
          const areaTables = tables.filter(table => table.area_id === area.id);
          
          return (
            <Card key={area.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{area.name}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditArea(area)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                {area.description && (
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {areaTables.map((table) => (
                    <div
                      key={table.id}
                      className="relative border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEditTable(table)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{table.table_number}</span>
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}
                        />
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {table.capacity} ที่นั่ง
                      </div>
                      <Badge
                        variant="secondary"
                        className="absolute top-1 right-1 text-xs"
                      >
                        {getStatusText(table.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {areaTables.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    ยังไม่มีโต๊ะในพื้นที่นี้
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unassigned Tables */}
      {tables.filter(table => !table.area_id).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>โต๊ะที่ยังไม่ได้จัดพื้นที่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables
                .filter(table => !table.area_id)
                .map((table) => (
                  <div
                    key={table.id}
                    className="relative border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEditTable(table)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{table.table_number}</span>
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}
                      />
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      {table.capacity} ที่นั่ง
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute top-1 right-1 text-xs"
                    >
                      {getStatusText(table.status)}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableManagement;
