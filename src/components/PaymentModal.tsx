
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethod } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPayment: (method: PaymentMethod, cashReceived?: number) => void;
}

const PaymentModal = ({ isOpen, onClose, total, onPayment }: PaymentModalProps) => {
  const [cashReceived, setCashReceived] = useState(0);

  const handleCashPayment = () => {
    if (cashReceived < total) {
      alert('จำนวนเงินที่รับไม่เพียงพอ');
      return;
    }
    onPayment('cash', cashReceived);
  };

  const handleQRPayment = () => {
    onPayment('qr');
  };

  const handlePointsPayment = () => {
    onPayment('points');
  };

  const change = Math.max(0, cashReceived - total);

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-coffee-800">ชำระเงิน</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-coffee-50 rounded-lg">
            <p className="text-sm text-coffee-600">ยอดที่ต้องชำระ</p>
            <p className="text-2xl font-bold text-coffee-800">฿{total}</p>
          </div>

          <Tabs defaultValue="cash" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cash">เงินสด</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
              <TabsTrigger value="points">แต้ม</TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4">
              <div>
                <Label htmlFor="cashAmount">จำนวนเงินที่รับ</Label>
                <Input
                  id="cashAmount"
                  type="number"
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="text-lg text-center"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setCashReceived(amount)}
                    className="h-12"
                  >
                    ฿{amount}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCashReceived(total)}
                className="w-full h-12 border-coffee-300"
              >
                จ่ายพอดี (฿{total})
              </Button>

              {cashReceived > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>เงินทอน:</span>
                    <span className="font-bold text-lg">฿{change}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-coffee-600 hover:bg-coffee-700"
                onClick={handleCashPayment}
                disabled={cashReceived < total}
              >
                ชำระด้วยเงินสด
              </Button>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center py-8">
                <div className="w-48 h-48 bg-gray-200 mx-auto rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-500">QR Code</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  แสกน QR Code เพื่อชำระเงิน
                </p>
              </div>

              <Button 
                className="w-full bg-coffee-600 hover:bg-coffee-700"
                onClick={handleQRPayment}
              >
                ยืนยันการชำระ QR
              </Button>
            </TabsContent>

            <TabsContent value="points" className="space-y-4">
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">ต้องการแต้ม</p>
                <p className="text-2xl font-bold">{total * 10} แต้ม</p>
                <p className="text-sm text-muted-foreground mt-2">
                  (1 บาท = 10 แต้ม)
                </p>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 ต้องเลือกสมาชิกก่อนใช้แต้ม
                </p>
              </div>

              <Button 
                className="w-full bg-coffee-600 hover:bg-coffee-700"
                onClick={handlePointsPayment}
              >
                ใช้แต้มชำระ
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
