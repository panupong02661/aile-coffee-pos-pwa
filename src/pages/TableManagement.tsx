
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TableManagement from '@/components/tables/TableManagement';
import { MapPin } from 'lucide-react';

const TableManagementPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <MapPin className="w-6 h-6 mr-3 text-primary" />
          <h1 className="text-2xl font-bold">จัดการโต้ะและพื้นที่</h1>
        </div>
        <p className="text-muted-foreground">
          จัดการโต้ะ พื้นที่ และการจองโต้ะในร้านอาหาร
        </p>
      </div>
      
      <TableManagement />
    </div>
  );
};

export default TableManagementPage;
