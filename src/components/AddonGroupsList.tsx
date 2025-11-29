
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
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

interface AddonGroupsListProps {
  addonGroups: any[];
  onEdit: (item: any) => void;
  onDelete?: () => void;
}

const AddonGroupsList: React.FC<AddonGroupsListProps> = ({ addonGroups, onEdit, onDelete }) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addonGroups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <Badge variant={group.is_active ? 'default' : 'secondary'}>
                {group.is_active ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {group.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
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
