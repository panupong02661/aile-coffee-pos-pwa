
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, DollarSign, Gift } from 'lucide-react';
import { PaymentMethod } from '@/types';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  onMethodChange: (value: string) => void;
}

const PaymentMethodSelector = ({ paymentMethod, onMethodChange }: PaymentMethodSelectorProps) => {
  return (
    <div>
      <Label className="text-base font-medium">เลือกวิธีการชำระเงิน</Label>
      <RadioGroup 
        value={paymentMethod} 
        onValueChange={onMethodChange}
        className="mt-3"
      >
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="flex items-center gap-1 cursor-pointer flex-1 text-sm">
              <DollarSign className="w-4 h-4" />
              เงินสด
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="qr" id="qr" />
            <Label htmlFor="qr" className="flex items-center gap-1 cursor-pointer flex-1 text-sm">
              <CreditCard className="w-4 h-4" />
              QR Code
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="points" id="points" />
            <Label htmlFor="points" className="flex items-center gap-1 cursor-pointer flex-1 text-sm">
              <Gift className="w-4 h-4" />
              แต้มสะสม
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
