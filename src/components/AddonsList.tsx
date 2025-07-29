
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff } from 'lucide-react';

interface AddonsListProps {
  addons: any[];
  addonGroups: any[];
  onEdit: (item: any) => void;
}

const AddonsList: React.FC<AddonsListProps> = ({ addons, addonGroups, onEdit }) => {
  const getGroupName = (groupId: string) => {
    const group = addonGroups.find(g => g.id === groupId);
    return group?.name || 'ไม่มีกลุ่ม';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {addons.map((addon) => (
        <Card key={addon.id} className="overflow-hidden">
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(addon)}
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

export default AddonsList;
