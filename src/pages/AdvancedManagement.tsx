
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ShiftManagement from '@/components/shifts/ShiftManagement';
import SupplierManagement from '@/components/suppliers/SupplierManagement';
import TableManagement from '@/components/tables/TableManagement';
import { Clock, Building, TableIcon, CreditCard, DollarSign, Truck, Calendar, Settings } from 'lucide-react';

const AdvancedManagement = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ระบบจัดการขั้นสูง</h1>
        <p className="text-muted-foreground">
          จัดการเวรทำงาน ผู้จำหน่าย โต๊ะ และระบบอื่นๆ
        </p>
      </div>

      <Tabs defaultValue="shifts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="shifts" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>เวรทำงาน</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>ผู้จำหน่าย</span>
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center space-x-2">
            <TableIcon className="w-4 h-4" />
            <span>โต๊ะ</span>
          </TabsTrigger>
          <TabsTrigger value="credit" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>เครดิต</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>ราคา</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>จัดส่ง</span>
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>จอง</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>ตั้งค่า</span>
          </TabsTrigger>
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

        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>ระบบเครดิต/หนี้สิน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">กำลังพัฒนาระบบเครดิต/หนี้สิน</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>ระบบจัดการราคา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">กำลังพัฒนาระบบจัดการราคา</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>ระบบจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">กำลังพัฒนาระบบจัดส่ง</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle>ระบบจองสินค้า</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">กำลังพัฒนาระบบจองสินค้า</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าขั้นสูง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">กำลังพัฒนาการตั้งค่าขั้นสูง</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedManagement;
