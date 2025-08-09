
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Plus } from 'lucide-react';

const Tables = () => {
  const tables = [
    { id: 1, number: 'T01', capacity: 4, status: 'occupied', customer: 'คุณสมชาย', time: '10:30' },
    { id: 2, number: 'T02', capacity: 2, status: 'available', customer: null, time: null },
    { id: 3, number: 'T03', capacity: 6, status: 'reserved', customer: 'คุณมาลี', time: '11:00' },
    { id: 4, number: 'T04', capacity: 4, status: 'cleaning', customer: null, time: null },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Badge variant="destructive">ไม่ว่าง</Badge>;
      case 'available':
        return <Badge variant="default" className="bg-green-500">ว่าง</Badge>;
      case 'reserved':
        return <Badge variant="default" className="bg-blue-500">จอง</Badge>;
      case 'cleaning':
        return <Badge variant="secondary">ทำความสะอาด</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
    }
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการโต๊ะ</h1>
            <p className="text-gray-600">จัดการโต๊ะและการจองในร้าน</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มโต๊ะใหม่
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => (
            <Card key={table.id} className={`hover:shadow-lg transition-shadow ${
              table.status === 'available' ? 'border-green-200' : 
              table.status === 'occupied' ? 'border-red-200' : 
              table.status === 'reserved' ? 'border-blue-200' : 'border-gray-200'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{table.number}</CardTitle>
                  {getStatusBadge(table.status)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {table.capacity} ที่นั่ง
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {table.customer && (
                    <div>
                      <p className="text-sm font-medium">{table.customer}</p>
                      {table.time && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {table.time}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {table.status === 'available' && (
                      <Button size="sm" className="w-full">จองโต๊ะ</Button>
                    )}
                    {table.status === 'occupied' && (
                      <Button size="sm" variant="outline" className="w-full">เช็คบิล</Button>
                    )}
                    {table.status === 'reserved' && (
                      <Button size="sm" variant="secondary" className="w-full">รับลูกค้า</Button>
                    )}
                    {table.status === 'cleaning' && (
                      <Button size="sm" variant="outline" className="w-full">เสร็จแล้ว</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  );
};

export default Tables;
