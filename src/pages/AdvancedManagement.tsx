
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shell } from '@/components/Shell';
import ShiftManagement from '@/components/shifts/ShiftManagement';
import SupplierManagement from '@/components/suppliers/SupplierManagement';
import TableManagement from '@/components/tables/TableManagement';
import TableReservations from '@/components/reservations/TableReservations';
import ProductReservations from '@/components/reservations/ProductReservations';
import DeliveryManagement from '@/components/delivery/DeliveryManagement';
import PurchaseOrderManagement from '@/components/purchases/PurchaseOrderManagement';
import CreditManagement from '@/components/credit/CreditManagement';

const AdvancedManagement = () => {
  return (
    <Shell>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ระบบจัดการขั้นสูง</h1>
          <p className="text-muted-foreground">
            จัดการระบบต่างๆ ของร้านในที่เดียว
          </p>
        </div>
        
        <Tabs defaultValue="shifts" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="shifts">เวรทำงาน</TabsTrigger>
            <TabsTrigger value="suppliers">ผู้จำหน่าย</TabsTrigger>
            <TabsTrigger value="tables">โต๊ะ</TabsTrigger>
            <TabsTrigger value="table-reservations">จองโต๊ะ</TabsTrigger>
            <TabsTrigger value="product-reservations">จองสินค้า</TabsTrigger>
            <TabsTrigger value="delivery">จัดส่ง</TabsTrigger>
            <TabsTrigger value="purchases">ใบสั่งซื้อ</TabsTrigger>
            <TabsTrigger value="credit">เครดิต</TabsTrigger>
          </TabsList>

          <TabsContent value="shifts">
            <ShiftManagement />
          </TabsContent>

          <TabsContent value="suppliers">
            <SupplierManagement />
          </TabsContent>

          <TabsContent value="tables">
            <TableManagement />
          </TabsContent>

          <TabsContent value="table-reservations">
            <TableReservations />
          </TabsContent>

          <TabsContent value="product-reservations">
            <ProductReservations />
          </TabsContent>

          <TabsContent value="delivery">
            <DeliveryManagement />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchaseOrderManagement />
          </TabsContent>

          <TabsContent value="credit">
            <CreditManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default AdvancedManagement;
