
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Users, DollarSign, Calendar, Edit, AlertTriangle } from 'lucide-react';

const CreditManagement = () => {
  const { members, creditCustomers, creditSales, refetch } = useSupabaseData();
  const { toast } = useToast();
  
  // Customer management state
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isCustomerSubmitting, setIsCustomerSubmitting] = useState(false);
  
  const [customerForm, setCustomerForm] = useState({
    member_id: '',
    credit_limit: 0,
    payment_terms: 30,
  });

  // Sale management state
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [isSaleSubmitting, setIsSaleSubmitting] = useState(false);
  
  const [saleForm, setSaleForm] = useState({
    credit_customer_id: '',
    amount: 0,
    due_date: '',
    notes: '',
  });

  const resetCustomerForm = () => {
    setCustomerForm({
      member_id: '',
      credit_limit: 0,
      payment_terms: 30,
    });
    setEditingCustomer(null);
  };

  const resetSaleForm = () => {
    setSaleForm({
      credit_customer_id: '',
      amount: 0,
      due_date: '',
      notes: '',
    });
    setEditingSale(null);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setIsCustomerSubmitting(true);

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('credit_customers')
          .update(customerForm)
          .eq('id', editingCustomer.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตข้อมูลลูกค้าเครดิตแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('credit_customers')
          .insert([customerForm]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'เพิ่มลูกค้าเครดิตใหม่แล้ว',
        });
      }

      setIsCustomerOpen(false);
      resetCustomerForm();
      refetch.creditCustomers();
    } catch (error) {
      console.error('Credit customer error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsCustomerSubmitting(false);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setIsSaleSubmitting(true);

    try {
      if (editingSale) {
        const { error } = await supabase
          .from('credit_sales')
          .update(saleForm)
          .eq('id', editingSale.id);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตการขายเครดิตแล้ว',
        });
      } else {
        const { error } = await supabase
          .from('credit_sales')
          .insert([saleForm]);

        if (error) throw error;

        toast({
          title: 'สำเร็จ',
          description: 'สร้างการขายเครดิตใหม่แล้ว',
        });
      }

      setIsSaleOpen(false);
      resetSaleForm();
      refetch.creditSales();
    } catch (error) {
      console.error('Credit sale error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    } finally {
      setIsSaleSubmitting(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setCustomerForm({
      member_id: customer.member_id || '',
      credit_limit: customer.credit_limit,
      payment_terms: customer.payment_terms,
    });
    setEditingCustomer(customer);
    setIsCustomerOpen(true);
  };

  const handleEditSale = (sale) => {
    setSaleForm({
      credit_customer_id: sale.credit_customer_id || '',
      amount: sale.amount,
      due_date: sale.due_date,
      notes: sale.notes || '',
    });
    setEditingSale(sale);
    setIsSaleOpen(true);
  };

  const updateSaleStatus = async (sale, status, paidAmount = null) => {
    try {
      const updateData = { status };
      
      if (status === 'paid' && paidAmount !== null) {
        updateData.paid_amount = paidAmount;
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('credit_sales')
        .update(updateData)
        .eq('id', sale.id);

      if (error) throw error;

      // Update credit customer balance
      if (status === 'paid') {
        const { error: balanceError } = await supabase
          .from('credit_customers')
          .update({ 
            current_balance: (sale.credit_customers?.current_balance || 0) - sale.amount 
          })
          .eq('id', sale.credit_customer_id);

        if (balanceError) throw balanceError;
      }

      toast({
        title: 'สำเร็จ',
        description: 'อัปเดตสถานะการขายแล้ว',
      });

      refetch.creditSales();
      refetch.creditCustomers();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตสถานะได้',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอชำระ';
      case 'paid': return 'ชำระแล้ว';
      case 'overdue': return 'เกินกำหนด';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const calculateDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">จัดการเครดิต</h1>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">ลูกค้าเครดิต</TabsTrigger>
          <TabsTrigger value="sales">การขายเครดิต</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetCustomerForm}>
                    <Users className="w-4 h-4 mr-2" />
                    เพิ่มลูกค้าเครดิต
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCustomer ? 'แก้ไขลูกค้าเครดิต' : 'เพิ่มลูกค้าเครดิตใหม่'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="member_id">สมาชิก *</Label>
                      <Select
                        value={customerForm.member_id}
                        onValueChange={(value) => setCustomerForm({ ...customerForm, member_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสมาชิก" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="credit_limit">วงเงินเครดิต *</Label>
                      <Input
                        id="credit_limit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={customerForm.credit_limit}
                        onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_terms">เงื่อนไขการชำระ (วัน)</Label>
                      <Input
                        id="payment_terms"
                        type="number"
                        min="1"
                        value={customerForm.payment_terms}
                        onChange={(e) => setCustomerForm({ ...customerForm, payment_terms: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCustomerOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button type="submit" disabled={isCustomerSubmitting || !customerForm.member_id}>
                        {isCustomerSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creditCustomers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">ยังไม่มีลูกค้าเครดิต</p>
                </div>
              ) : (
                creditCustomers.map((customer) => (
                  <Card key={customer.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {customer.members?.name || 'ไม่ระบุชื่อ'}
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {!customer.is_active && (
                        <Badge variant="secondary">ปิดใช้งาน</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>เบอร์โทร:</strong> {customer.members?.phone || 'ไม่ระบุ'}
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>วงเงิน: ฿{customer.credit_limit.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>ยอดค้างชำระ: ฿{customer.current_balance.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <strong>เงื่อนไขชำระ:</strong> {customer.payment_terms} วัน
                      </div>
                      
                      {customer.current_balance > customer.credit_limit * 0.8 && (
                        <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          ใกล้เต็มวงเงิน
                        </div>
                      )}
                      
                      {customer.current_balance > customer.credit_limit && (
                        <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          เกินวงเงินเครดิต
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetSaleForm}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    สร้างการขายเครดิต
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSale ? 'แก้ไขการขายเครดิต' : 'สร้างการขายเครดิตใหม่'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="credit_customer_id">ลูกค้าเครดิต *</Label>
                      <Select
                        value={saleForm.credit_customer_id}
                        onValueChange={(value) => setSaleForm({ ...saleForm, credit_customer_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกลูกค้าเครดิต" />
                        </SelectTrigger>
                        <SelectContent>
                          {creditCustomers
                            .filter(customer => customer.is_active)
                            .map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.members?.name} (วงเงิน: ฿{customer.credit_limit.toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">จำนวนเงิน *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={saleForm.amount}
                        onChange={(e) => setSaleForm({ ...saleForm, amount: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="due_date">กำหนดชำระ *</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={saleForm.due_date}
                        onChange={(e) => setSaleForm({ ...saleForm, due_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sale_notes">หมายเหตุ</Label>
                      <Textarea
                        id="sale_notes"
                        value={saleForm.notes}
                        onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                        placeholder="หมายเหตุเพิ่มเติม..."
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSaleOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSaleSubmitting || !saleForm.credit_customer_id || saleForm.amount <= 0}
                      >
                        {isSaleSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creditSales.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">ยังไม่มีการขายเครดิต</p>
                </div>
              ) : (
                creditSales.map((sale) => (
                  <Card key={sale.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          ฿{sale.amount.toLocaleString()}
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSale(sale)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge 
                        className={`${getStatusColor(sale.status)} text-white w-fit`}
                      >
                        {getStatusText(sale.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>ลูกค้า:</strong> {sale.credit_customers?.members?.name || 'ไม่ระบุ'}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        กำหนดชำระ: {new Date(sale.due_date).toLocaleDateString('th-TH')}
                      </div>
                      
                      {sale.status === 'pending' && isOverdue(sale.due_date) && (
                        <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          เกินกำหนด {calculateDaysOverdue(sale.due_date)} วัน
                        </div>
                      )}
                      
                      {sale.paid_date && (
                        <div className="flex items-center text-sm text-green-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          ชำระแล้วเมื่อ: {new Date(sale.paid_date).toLocaleDateString('th-TH')}
                        </div>
                      )}
                      
                      {sale.paid_amount > 0 && (
                        <div className="text-sm">
                          <strong>จำนวนที่ชำระ:</strong> ฿{sale.paid_amount.toLocaleString()}
                        </div>
                      )}
                      
                      {sale.notes && (
                        <div className="text-sm text-muted-foreground">
                          {sale.notes}
                        </div>
                      )}
                      
                      {sale.status === 'pending' && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => updateSaleStatus(sale, 'paid', sale.amount)}
                          >
                            ชำระแล้ว
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSaleStatus(sale, 'cancelled')}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditManagement;
