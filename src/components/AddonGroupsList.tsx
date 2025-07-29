
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff } from 'lucide-react';

interface AddonGroupsListProps {
  addonGroups: any[];
  onEdit: (item: any) => void;
}

const AddonGroupsList: React.FC<AddonGroupsListProps> = ({ addonGroups, onEdit }) => {
  return (
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(group)}
              >
                <Edit className="w-4 h-4 mr-1" />
                แก้ไข
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AddonGroupsList;
