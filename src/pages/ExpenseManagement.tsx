
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenseManagement from '@/components/financial/ExpenseManagement';
import { Receipt } from 'lucide-react';

const ExpenseManagementPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Receipt className="w-6 h-6 mr-3 text-primary" />
          <h1 className="text-2xl font-bold">จัดการค่าใช้จ่าย</h1>
        </div>
        <p className="text-muted-foreground">
          บันทึกและจัดการค่าใช้จ่ายทั้งหมดของร้าน
        </p>
      </div>
      
      <ExpenseManagement />
    </div>
  );
};

export default ExpenseManagementPage;
