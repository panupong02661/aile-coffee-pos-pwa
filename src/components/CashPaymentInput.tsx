
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CashPaymentInputProps {
  cashReceived: string;
  setCashReceived: (value: string) => void;
  total: number;
  change: number;
}

const CashPaymentInput = ({ cashReceived, setCashReceived, total, change }: CashPaymentInputProps) => {
  const banknotes = [20, 50, 100, 500, 1000];

  const handleBanknoteClick = (amount: number) => {
    const currentAmount = parseFloat(cashReceived || '0');
    const newAmount = currentAmount + amount;
    setCashReceived(newAmount.toString());
  };

  const handleExactPayment = () => {
    setCashReceived(total.toString());
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cash-received">จำนวนเงินที่รับ (บาท)</Label>
        <Input
          id="cash-received"
          type="number"
          value={cashReceived}
          onChange={(e) => setCashReceived(e.target.value)}
          min={total}
          step="0.01"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">ธนบัตร</Label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {banknotes.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => handleBanknoteClick(amount)}
              className="h-12 text-base font-medium"
            >
              ฿{amount}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExactPayment}
            className="flex-1 h-12 text-base font-medium border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
          >
            จ่ายพอดี (฿{total.toLocaleString()})
          </Button>
          
          {change > 0 && (
            <div className="flex-1 flex items-center justify-center p-3 bg-blue-50 rounded border">
              <span className="text-blue-700 font-medium">
                เงินทอน: ฿{change.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashPaymentInput;
