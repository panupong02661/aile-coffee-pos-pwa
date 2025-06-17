
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Calculator } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const RecipeManagement = () => {
  const { menuItems, ingredients, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">จัดการสูตรและต้นทุน</h2>
        <div className="text-sm text-gray-600">
          รวม {menuItems.length} เมนู
        </div>
      </div>

      {menuItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <p>ยังไม่มีเมนู</p>
            <p className="text-sm mt-2">กรุณาเพิ่มเมนูในหน้าจัดการเมนูก่อน</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {menuItems.map((menu) => (
            <Card key={menu.id} className="border-coffee-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-coffee-800 mb-2">{menu.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-coffee-700">ราคาขาย:</span>
                        <p className="text-coffee-600">฿{menu.price}</p>
                      </div>
                      <div>
                        <span className="font-medium text-coffee-700">ต้นทุน:</span>
                        <p className="text-coffee-600">฿{menu.cost_price}</p>
                      </div>
                      <div>
                        <span className="font-medium text-coffee-700">กำไร:</span>
                        <p className="text-coffee-600">฿{(Number(menu.price) - Number(menu.cost_price)).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-coffee-700">% กำไร:</span>
                        <p className="text-coffee-600">
                          {menu.price > 0 ? (((Number(menu.price) - Number(menu.cost_price)) / Number(menu.price)) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" />
                      แก้ไขสูตร
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calculator className="w-3 h-3 mr-1" />
                      คำนวณ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;
