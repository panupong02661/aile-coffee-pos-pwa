import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Wallet, QrCode, Banknote, Clock, CheckCircle } from 'lucide-react';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'qr' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  customerName?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addOns: Array<{ id: string; name: string; price: number }>;
}

interface PaymentHandlingProps {
  order?: OrderItem[];
  total?: number;
  onPaymentComplete?: (payment: Payment) => void;
}

export const PaymentHandling: React.FC<PaymentHandlingProps> = ({ 
  order = [], 
  total = 0, 
  onPaymentComplete 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'qr' | 'transfer'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  const recentPayments: Payment[] = [
    { id: '1', orderId: 'ORD-001', amount: 125, method: 'cash', status: 'completed', timestamp: '2024-07-16 14:30', customerName: 'สมชาย ใจดี' },
    { id: '2', orderId: 'ORD-002', amount: 85, method: 'qr', status: 'completed', timestamp: '2024-07-16 14:25', customerName: 'สมหญิง รักกาแฟ' },
    { id: '3', orderId: 'ORD-003', amount: 200, method: 'card', status: 'pending', timestamp: '2024-07-16 14:20' },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'เงินสด', icon: Banknote, color: 'bg-green-500' },
    { id: 'card', name: 'บัตรเครดิต/เดบิต', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'qr', name: 'QR Code', icon: QrCode, color: 'bg-purple-500' },
    { id: 'transfer', name: 'โอนเงิน', icon: Wallet, color: 'bg-orange-500' },
  ];

  const calculateChange = () => {
    return selectedMethod === 'cash' ? Math.max(0, receivedAmount - total) : 0;
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const payment: Payment = {
      id: Date.now().toString(),
      orderId: `ORD-${String(Date.now()).slice(-3)}`,
      amount: total,
      method: selectedMethod,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    setIsProcessing(false);
    onPaymentComplete?.(payment);
  };

  const generateQRCode = () => {
    setQrCodeGenerated(true);
    // In real implementation, this would generate a QR code for payment
  };

  const getMethodIcon = (method: string) => {
    const methodConfig = paymentMethods.find(m => m.id === method);
    if (!methodConfig) return null;
    const Icon = methodConfig.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">สำเร็จ</Badge>;
      case 'pending':
        return <Badge variant="secondary">รอดำเนินการ</Badge>;
      case 'failed':
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      default:
        return <Badge variant="outline">ไม่ทราบสถานะ</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Handling</h2>
        <div className="text-lg font-semibold">
          ยอดรวม: ฿{total.toLocaleString()}
        </div>
      </div>

      <Tabs defaultValue="payment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payment">รับชำระเงิน</TabsTrigger>
          <TabsTrigger value="history">ประวัติการชำระ</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่าการชำระ</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>เลือกวิธีการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant={selectedMethod === method.id ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => setSelectedMethod(method.id as any)}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs">{method.name}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {selectedMethod === 'cash' && (
            <Card>
              <CardHeader>
                <CardTitle>การชำระด้วยเงินสด</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">จำนวนเงินที่รับ</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={receivedAmount || ''}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    className="text-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">ยอดรวม</div>
                    <div className="text-xl font-bold">฿{total}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">รับมา</div>
                    <div className="text-xl font-bold">฿{receivedAmount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">เงินทอน</div>
                    <div className="text-xl font-bold text-green-600">฿{calculateChange()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedMethod === 'qr' && (
            <Card>
              <CardHeader>
                <CardTitle>การชำระด้วย QR Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {!qrCodeGenerated ? (
                  <Button onClick={generateQRCode} size="lg">
                    <QrCode className="h-5 w-5 mr-2" />
                    สร้าง QR Code สำหรับชำระเงิน
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      แสกน QR Code เพื่อชำระเงิน ฿{total}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">รอการชำระเงิน...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(selectedMethod === 'card' || selectedMethod === 'transfer') && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMethod === 'card' ? 'การชำระด้วยบัตร' : 'การโอนเงิน'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  {selectedMethod === 'card' ? 
                    <CreditCard className="h-8 w-8 text-primary" /> :
                    <Wallet className="h-8 w-8 text-primary" />
                  }
                </div>
                <p className="text-muted-foreground">
                  {selectedMethod === 'card' ? 
                    'กรุณาเสียบบัตรหรือแตะบัตรที่เครื่องรูดบัตร' :
                    'กรุณาโอนเงินไปยังบัญชีของร้าน'
                  }
                </p>
                <div className="text-2xl font-bold">฿{total}</div>
              </CardContent>
            </Card>
          )}

          {/* Process Payment Button */}
          <Button 
            onClick={processPayment} 
            disabled={isProcessing || (selectedMethod === 'cash' && receivedAmount < total)}
            className="w-full h-12 text-lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังประมวลผล...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                ยืนยันการชำระเงิน
              </div>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการชำระเงินล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getMethodIcon(payment.method)}
                      </div>
                      <div>
                        <div className="font-medium">{payment.orderId}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.customerName || 'ลูกค้าทั่วไป'} • {payment.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">฿{payment.amount}</div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ตั้งค่าการชำระเงิน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">บัญชีธนาคารสำหรับโอนเงิน</label>
                  <Input placeholder="กรุงไทย 123-4-56789-0" />
                </div>
                <div>
                  <label className="text-sm font-medium">PromptPay ID</label>
                  <Input placeholder="0812345678" />
                </div>
                <div>
                  <label className="text-sm font-medium">Terminal ID สำหรับบัตรเครดิต</label>
                  <Input placeholder="TID123456" />
                </div>
              </div>
              <Button className="w-full">บันทึกการตั้งค่า</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};