
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff, Trash2, LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AddonsListProps {
  addons: any[];
  addonGroups: any[];
  onEdit: (item: any) => void;
  onDelete?: () => void;
  onStatusChange?: () => void;
}

const AddonsList: React.FC<AddonsListProps> = ({ addons, addonGroups, onEdit, onDelete, onStatusChange }) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [localAddons, setLocalAddons] = React.useState(addons);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    setLocalAddons(addons);
  }, [addons]);

  const handleStatusToggle = async (addon: any) => {
    try {
      const newStatus = !addon.is_active;
      
      setLocalAddons(prevItems =>
        prevItems.map(a =>
          a.id === addon.id
            ? { ...a, is_active: newStatus }
            : a
        )
      );
      
      const { error } = await supabase
        .from('addons')
        .update({ is_active: newStatus })
        .eq('id', addon.id);

      if (error) {
        console.error('Error updating addon status:', error);
        setLocalAddons(prevItems =>
          prevItems.map(a =>
            a.id === addon.id
              ? { ...a, is_active: !newStatus }
              : a
          )
        );
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถอัปเดตสถานะได้',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'สำเร็จ',
        description: `${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} Add-on ${addon.name} แล้ว`,
      });
      
      setTimeout(() => {
        if (onStatusChange) {
          onStatusChange();
        }
      }, 300);
    } catch (error) {
      console.error('Error updating addon status:', error);
      setLocalAddons(addons);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const getGroupName = (groupId: string) => {
    const group = addonGroups.find(g => g.id === groupId);
    return group?.name || 'ไม่มีกลุ่ม';
  };

  const normalizeAndSwap = async (items: any[], indexA: number, indexB: number) => {
    // Create new array with swapped items
    const newItems = [...items];
    const temp = newItems[indexA];
    newItems[indexA] = newItems[indexB];
    newItems[indexB] = temp;
    
    // Assign sequential sort_order to ALL items to guarantee uniqueness
    const updatedItems = newItems.map((item, i) => ({ ...item, sort_order: i }));
    setLocalAddons(updatedItems);
    
    try {
      // Update all items' sort_order in DB
      const updates = updatedItems.map((item, i) =>
        supabase.from('addons').update({ sort_order: i }).eq('id', item.id)
      );
      const results = await Promise.all(updates);
      
      const hasError = results.some(r => r.error);
      if (hasError) throw new Error('DB update failed');
      
      toast({ title: 'สำเร็จ', description: 'เลื่อนลำดับสำเร็จ' });
    } catch (error) {
      console.error('Error moving item:', error);
      setLocalAddons(addons);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการเลื่อนลำดับ', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    await normalizeAndSwap(localAddons, index, index - 1);
  };

  const handleMoveDown = async (index: number) => {
    if (index === localAddons.length - 1) return;
    await normalizeAndSwap(localAddons, index, index + 1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('addons')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'ลบ Add-on สำเร็จ',
        description: 'ลบข้อมูล Add-on เรียบร้อยแล้ว',
      });

      onDelete?.();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'bg-coffee-600 hover:bg-coffee-700' : ''}
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'bg-coffee-600 hover:bg-coffee-700' : ''}
        >
          <List className="w-4 h-4 mr-1" />
          List
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localAddons.map((addon, index) => (
            <Card key={addon.id} className={`overflow-hidden ${!addon.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === localAddons.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg">{addon.name}</h3>
                  </div>
                  <Badge 
                    variant={addon.is_active ? 'default' : 'destructive'}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${
                      addon.is_active 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={() => handleStatusToggle(addon)}
                  >
                    {addon.is_active ? (
                      <Eye className="w-3 h-3 mr-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 mr-1" />
                    )}
                    {addon.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getGroupName(addon.addon_group_id)}
                  </Badge>
                </div>
                
                {addon.description && (
                  <p className="text-sm text-gray-600 mb-2">{addon.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-coffee-600">
                    {addon.price > 0 ? `+฿${addon.price.toFixed(2)}` : 'ฟรี'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(addon)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(addon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ลำดับ</TableHead>
                <TableHead>ชื่อ Add-on</TableHead>
                <TableHead>กลุ่ม</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localAddons.map((addon, index) => (
                <TableRow key={addon.id} className={!addon.is_active ? 'opacity-60 bg-gray-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === localAddons.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getGroupName(addon.addon_group_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-coffee-600">
                    {addon.price > 0 ? `+฿${addon.price.toFixed(2)}` : 'ฟรี'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={addon.is_active ? 'default' : 'destructive'}
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${
                        addon.is_active 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={() => handleStatusToggle(addon)}
                    >
                      {addon.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => onEdit(addon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(addon.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ Add-on นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddonsList;
