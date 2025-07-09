
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Clock, FileText, Upload, X } from 'lucide-react';
import QRCodePromptPay from '@/components/QRCodePromptPay';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartModalProps) => {
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [defaultPhoneNumber, setDefaultPhoneNumber] = useState('');
  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  // Get saved phone number from localStorage (from QR Code PromptPay page)
  useEffect(() => {
    const savedPhoneNumbers = localStorage.getItem('promptpay-phone-numbers');
    if (savedPhoneNumbers) {
      try {
        const phoneNumbers = JSON.parse(savedPhoneNumbers);
        if (phoneNumbers.length > 0) {
          setDefaultPhoneNumber(phoneNumbers[0]); // Use the first saved phone number
        }
      } catch (error) {
        console.error('Error parsing saved phone numbers:', error);
      }
    }
  }, []);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPaymentSlip(file);
        toast({
          title: 'อัปโหลดสลีปสำเร็จ',
          description: 'ไฟล์สลีปการโอนเงินถูกแนบแล้ว',
        });
      } else {
        toast({
          title: 'ไฟล์ไม่ถูกต้อง',
          description: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
          variant: 'destructive',
        });
      }
    }
  };

  const handleConfirmOrder = () => {
    if (!pickupTime) {
      toast({
        title: 'กรุณาระบุเวลารับสินค้า',
        description: 'เวลารับสินค้าเป็นข้อมูลที่จำเป็น',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentSlip) {
      toast({
        title: 'กรุณาแนบสลีปการโอนเงิน',
        description: 'สลีปการโอนเงินเป็นข้อมูลที่จำเป็น',
        variant: 'destructive',
      });
      return;
    }

    // Here you would typically send the order to your backend
    toast({
      title: 'สั่งซื้อสำเร็จ',
      description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว',
    });
    
    onClose();
  };

  const removePaymentSlip = () => {
    setPaymentSlip(null);
  };

  if (cartItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">ตะกร้าสินค้า</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
            <Button onClick={onClose} className="mt-4">
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            รายละเอียดการสั่งซื้อ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">รายการสินค้า</h3>
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-orange-600 font-semibold">
                          ฿{item.price}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 w-8 h-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <span className="font-semibold text-lg">
                      ฿{item.price * item.quantity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">รายละเอียดการสั่งซื้อ</h3>
            
            {/* Pickup Time */}
            <div className="space-y-2">
              <Label htmlFor="pickup-time" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>เวลาที่ต้องการรับสินค้า *</span>
              </Label>
              <Input
                id="pickup-time"
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>หมายเหตุ</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="ระบุรายละเอียดเพิ่มเติม..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">สรุปการชำระเงิน</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวมย่อย:</span>
                <span>฿{subtotal}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>ยอดรวมทั้งหมด:</span>
                <span className="text-orange-600">฿{total}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section - Always show QR Code */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">การชำระเงิน</h3>
            <Card>
              <CardContent className="p-4">
                <QRCodePromptPay 
                  amount={total} 
                  defaultPhoneNumber={defaultPhoneNumber}
                  compact={true}
                />
                {defaultPhoneNumber && (
                  <div className="mt-4 text-center space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>เบอร์:</strong> {defaultPhoneNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>จำนวน:</strong> ฿{total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      แสกน QR Code ด้วยแอป Banking หรือ PromptPay
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Slip Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">แนบสลีปการโอนเงิน *</h3>
            
            {paymentSlip ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{paymentSlip.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removePaymentSlip}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {paymentSlip.type.startsWith('image/') && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(paymentSlip)}
                        alt="Payment slip preview"
                        className="max-w-full h-32 object-contain rounded"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  แนบสลีปการโอนเงิน
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="payment-slip"
                />
                <Label htmlFor="payment-slip" className="cursor-pointer">
                  <Button variant="outline" className="mt-2" asChild>
                    <span>เลือกไฟล์</span>
                  </Button>
                </Label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={!pickupTime || !paymentSlip}
            >
              ยืนยันการสั่งซื้อ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
