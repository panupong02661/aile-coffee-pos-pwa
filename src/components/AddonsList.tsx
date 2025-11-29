
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

interface AddonsListProps {
  addons: any[];
  addonGroups: any[];
  onEdit: (item: any) => void;
  onDelete?: () => void;
}

const AddonsList: React.FC<AddonsListProps> = ({ addons, addonGroups, onEdit, onDelete }) => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const getGroupName = (groupId: string) => {
    const group = addonGroups.find(g => g.id === groupId);
    return group?.name || 'ไม่มีกลุ่ม';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((addon) => (
          <Card key={addon.id} className={`overflow-hidden ${!addon.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{addon.name}</h3>
              <Badge variant={addon.is_active ? 'default' : 'secondary'}>
                {addon.is_active ? (
                  <Eye className="w-3 h-3 mr-1" />
                ) : (
                  <EyeOff className="w-3 h-3 mr-1" />
                )}
                {addon.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
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
