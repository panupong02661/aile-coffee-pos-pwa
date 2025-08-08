
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTableManagement, Table } from '@/hooks/useTableManagement';
import { Plus, Users, Clock, Edit3, Trash2 } from 'lucide-react';

interface TableLayoutProps {
  onEditTable: (table: Table) => void;
  onDeleteTable: (tableId: string) => void;
  onCreateReservation: (tableId: string) => void;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  onEditTable,
  onDeleteTable,
  onCreateReservation
}) => {
  const { tables, updateTableStatus, getTableReservations } = useTableManagement();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'maintenance': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'ว่าง';
      case 'occupied': return 'ใช้งาน';
      case 'reserved': return 'จอง';
      case 'maintenance': return 'ซ่อม';
      default: return 'ไม่ทราบ';
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleStatusChange = async (tableId: string, newStatus: Table['status']) => {
    try {
      await updateTableStatus(tableId, newStatus);
      setSelectedTable(null);
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">แผนผังโต๊ะ</h3>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">ว่าง</Badge>
          <Badge className="bg-red-100 text-red-800">ใช้งาน</Badge>
          <Badge className="bg-blue-100 text-blue-800">จอง</Badge>
          <Badge className="bg-gray-100 text-gray-800">ซ่อม</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative bg-gray-50 rounded-lg p-8 min-h-[400px] border-2 border-dashed border-gray-300">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-2 p-4">
              {tables.filter(table => table.is_active).map((table, index) => {
                const reservations = getTableReservations(table.id);
                const hasReservation = reservations.some(r => 
                  r.reservation_date === new Date().toISOString().split('T')[0] &&
                  r.status === 'confirmed'
                );

                return (
                  <div
                    key={table.id}
                    className={`
                      relative cursor-pointer transition-all duration-200 rounded-lg p-3 border-2 
                      ${getStatusColor(table.status)}
                      hover:shadow-lg hover:scale-105
                    `}
                    style={{
                      gridColumn: `${(index % 8) + 1}`,
                      gridRow: `${Math.floor(index / 8) + 1}`
                    }}
                    onClick={() => handleTableClick(table)}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold mb-1">
                        {table.table_number}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        {table.capacity}
                      </div>
                      {hasReservation && (
                        <div className="absolute -top-1 -right-1">
                          <Clock className="w-3 h-3 text-blue-600 bg-white rounded-full p-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Details Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>โต๊ะ {selectedTable?.table_number}</DialogTitle>
          </DialogHeader>
          
          {selectedTable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ความจุ</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedTable.capacity} ที่นั่ง
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">สถานะ</p>
                  <Badge className={getStatusColor(selectedTable.status)}>
                    {getStatusText(selectedTable.status)}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">เปลี่ยนสถานะ</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={selectedTable.status === 'available' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedTable.id, 'available')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ว่าง
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTable.status === 'occupied' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedTable.id, 'occupied')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    ใช้งาน
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTable.status === 'reserved' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedTable.id, 'reserved')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    จอง
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTable.status === 'maintenance' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedTable.id, 'maintenance')}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    ซ่อม
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">การจัดการ</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCreateReservation(selectedTable.id)}
                    className="flex-1"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    จองโต๊ะ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditTable(selectedTable)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteTable(selectedTable.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableLayout;
