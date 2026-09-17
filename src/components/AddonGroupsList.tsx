
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
import { AddonMedia } from './AddonMediaField';

interface AddonGroupsListProps {
  addonGroups: any[];
  onEdit: (item: any) => void;
  onDelete?: () => void;
  onStatusChange?: () => void;
}

const AddonGroupsList: React.FC<AddonGroupsListProps> = ({ addonGroups, onEdit, onDelete, onStatusChange }) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [localGroups, setLocalGroups] = React.useState(addonGroups);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    setLocalGroups(addonGroups);
  }, [addonGroups]);

  const handleStatusToggle = async (group: any) => {
    try {
      const newStatus = !group.is_active;
      
      setLocalGroups(prevItems =>
        prevItems.map(g =>
          g.id === group.id
            ? { ...g, is_active: newStatus }
            : g
        )
      );
      
      const { error } = await supabase
        .from('addon_groups')
        .update({ is_active: newStatus })
        .eq('id', group.id);

      if (error) {
        console.error('Error updating addon group status:', error);
        setLocalGroups(prevItems =>
          prevItems.map(g =>
            g.id === group.id
              ? { ...g, is_active: !newStatus }
              : g
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
        description: `${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}กลุ่ม Add-on ${group.name} แล้ว`,
      });
      
      setTimeout(() => {
        if (onStatusChange) {
          onStatusChange();
        }
      }, 300);
    } catch (error) {
      console.error('Error updating addon group status:', error);
      setLocalGroups(addonGroups);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const normalizeAndSwap = async (items: any[], indexA: number, indexB: number) => {
    const newItems = [...items];
    const temp = newItems[indexA];
    newItems[indexA] = newItems[indexB];
    newItems[indexB] = temp;
    
    const updatedItems = newItems.map((item, i) => ({ ...item, sort_order: i }));
    setLocalGroups(updatedItems);
    
    try {
      const updates = updatedItems.map((item, i) =>
        supabase.from('addon_groups').update({ sort_order: i }).eq('id', item.id)
      );
      const results = await Promise.all(updates);
      
      const hasError = results.some(r => r.error);
      if (hasError) throw new Error('DB update failed');
      
      toast({ title: 'สำเร็จ', description: 'เลื่อนลำดับสำเร็จ' });
    } catch (error) {
      console.error('Error moving item:', error);
      setLocalGroups(addonGroups);
      toast({ title: 'เกิดข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการเลื่อนลำดับ', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    await normalizeAndSwap(localGroups, index, index - 1);
  };

  const handleMoveDown = async (index: number) => {
    if (index === localGroups.length - 1) return;
    await normalizeAndSwap(localGroups, index, index + 1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // ลบ addons ในกลุ่มก่อน
      await supabase
        .from('addons')
        .delete()
        .eq('addon_group_id', deleteId);

      // ลบความสัมพันธ์ในตาราง menu_addon_groups
      await supabase
        .from('menu_addon_groups')
        .delete()
        .eq('addon_group_id', deleteId);

      // ลบความสัมพันธ์ในตาราง category_addon_groups
      await supabase
        .from('category_addon_groups')
        .delete()
        .eq('addon_group_id', deleteId);

      // ลบกลุ่ม addon
      const { error } = await supabase
        .from('addon_groups')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'ลบกลุ่ม Add-on สำเร็จ',
        description: 'ลบข้อมูลกลุ่ม Add-on และ Add-on ทั้งหมดในกลุ่มเรียบร้อยแล้ว',
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
          className={viewMode === 'grid' ? 'bg-primary hover:bg-primary/90' : ''}
        >
          <LayoutGrid className="w-4 h-4 mr-1" />
          Grid
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : ''}
        >
          <List className="w-4 h-4 mr-1" />
          List
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localGroups.map((group, index) => (
            <Card key={group.id} className={`overflow-hidden ${!group.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
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
                        disabled={index === localGroups.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <AddonMedia mediaType={group.media_type} iconName={group.icon_name} imageUrl={group.image_url} imageClassName="h-10 w-10 rounded-md" />
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                  </div>
                  <Badge 
                    variant={group.is_active ? 'default' : 'destructive'}
                    className={`cursor-pointer hover:opacity-80 transition-opacity ${
                      group.is_active 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={() => handleStatusToggle(group)}
                  >
                    {group.is_active ? (
                      <Eye className="w-3 h-3 mr-1" />
                    ) : (
                      <EyeOff className="w-3 h-3 mr-1" />
                    )}
                    {group.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
                
                {group.description && (
                  <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="font-medium">ขั้นต่ำ:</span> {group.min_selection || 0}
                  </div>
                  <div>
                    <span className="font-medium">สูงสุด:</span> {group.max_selection || 'ไม่จำกัด'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant={group.is_required ? 'destructive' : 'outline'}>
                    {group.is_required ? 'จำเป็น' : 'เสริม'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(group)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(group.id)}
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
                <TableHead>ชื่อกลุ่ม</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localGroups.map((group, index) => (
                <TableRow key={group.id} className={!group.is_active ? 'opacity-60 bg-gray-50' : ''}>
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
                        disabled={index === localGroups.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><AddonMedia mediaType={group.media_type} iconName={group.icon_name} imageUrl={group.image_url} imageClassName="h-8 w-8 rounded-md" />{group.name}</div></TableCell>
                  <TableCell>
                    <Badge variant={group.is_required ? 'destructive' : 'outline'}>
                      {group.is_required ? 'จำเป็น' : 'เสริม'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={group.is_active ? 'default' : 'destructive'}
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${
                        group.is_active 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={() => handleStatusToggle(group)}
                    >
                      {group.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => onEdit(group)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(group.id)}>
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
            <AlertDialogTitle>ยืนยันการลบกลุ่ม Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบกลุ่ม Add-on นี้? การลบจะรวมถึง Add-on ทั้งหมดในกลุ่ม และไม่สามารถย้อนกลับได้
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

export default AddonGroupsList;
