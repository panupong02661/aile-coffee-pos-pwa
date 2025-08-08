
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTableManagement, Table as TableType } from '@/hooks/useTableManagement';
import { Edit3, Trash2, Users } from 'lucide-react';

interface TableListProps {
  onEditTable: (table: TableType) => void;
  onDeleteTable: (tableId: string) => void;
}

const TableList: React.FC<TableListProps> = ({ onEditTable, onDeleteTable }) => {
  const { tables, loading } = useTableManagement();

  const getStatusColor = (status: TableType['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TableType['status']) => {
    switch (status) {
      case 'available': return 'ว่าง';
      case 'occupied': return 'ใช้งาน';
      case 'reserved': return 'จอง';
      case 'maintenance': return 'ซ่อม';
      default: return 'ไม่ทราบ';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลด...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายการโต๊ะทั้งหมด</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>หมายเลขโต๊ะ</TableHead>
              <TableHead>ความจุ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>สถานะการใช้งาน</TableHead>
              <TableHead>จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">
                  {table.table_number}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {table.capacity} ที่นั่ง
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(table.status)}>
                    {getStatusText(table.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={table.is_active ? 'default' : 'secondary'}>
                    {table.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditTable(table)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteTable(table.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ยังไม่มีโต๊ะในระบบ
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableList;
