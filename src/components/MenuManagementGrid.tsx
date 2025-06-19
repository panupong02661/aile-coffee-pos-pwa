
import { useState } from 'react';
import { DatabaseMenuItem } from '@/hooks/useSupabaseData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ImageIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MenuManagementGridProps {
  menuItems: DatabaseMenuItem[];
  onEdit: (item: DatabaseMenuItem) => void;
  onDelete: (item: DatabaseMenuItem) => void;
  onAddImage: (item: DatabaseMenuItem) => void;
}

const MenuManagementGrid = ({ 
  menuItems, 
  onEdit, 
  onDelete,
  onAddImage 
}: MenuManagementGridProps) => {
  const isMobile = useIsMobile();

  const getGridStyle = () => {
    if (isMobile) {
      return 'grid-cols-2';
    }
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  };

  return (
    <div className={`grid ${getGridStyle()} gap-4`}>
      {menuItems.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-3">
            <div className="space-y-3">
              {/* รูปภาพเมนู */}
              <div className="relative aspect-square w-full bg-gray-100 rounded-md overflow-hidden">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">ไม่มีรูปภาพ</span>
                  </div>
                )}
                
                {/* ปุ่มเพิ่มรูปภาพ */}
                {!item.image_url && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onAddImage(item)}
                      className="text-xs"
                    >
                      <ImageIcon className="w-3 h-3 mr-1" />
                      เพิ่มรูป
                    </Button>
                  </div>
                )}
              </div>

              {/* ข้อมูลเมนู */}
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm line-clamp-2 text-coffee-800">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    หมวด: {item.categories?.name || 'ไม่ระบุ'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-coffee-600">
                    ฿{item.price}
                  </span>
                  <Badge 
                    variant={item.is_available ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.is_available ? "พร้อมขาย" : "หมด"}
                  </Badge>
                </div>

                {/* ปุ่มจัดการ */}
                <div className="flex gap-1 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    className="flex-1 text-xs h-8"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(item)}
                    className="flex-1 text-xs h-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    ลบ
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuManagementGrid;
