import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Equal, Pencil, Plus, Minus } from 'lucide-react';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (splits: number[]) => void;
}

const SplitBillModal = ({ isOpen, onClose, total, onConfirm }: SplitBillModalProps) => {
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [customAmounts, setCustomAmounts] = useState<number[]>([]);

  const equalAmount = Math.ceil(total / numberOfPeople);
  const lastPersonAmount = total - equalAmount * (numberOfPeople - 1);

  const handleEqualSplit = () => {
    const splits = Array(numberOfPeople - 1).fill(equalAmount);
    splits.push(lastPersonAmount);
    onConfirm(splits);
    onClose();
  };

  const handleCustomSplit = () => {
    onConfirm(customAmounts);
    onClose();
  };

  const initCustomAmounts = (count: number) => {
    const base = Math.floor(total / count);
    const amounts = Array(count).fill(base);
    amounts[0] = total - base * (count - 1);
    setCustomAmounts(amounts);
  };

  const updateCustomAmount = (index: number, value: number) => {
    const newAmounts = [...customAmounts];
    newAmounts[index] = value;
    setCustomAmounts(newAmounts);
  };

  const customTotal = customAmounts.reduce((sum, a) => sum + a, 0);
  const customDiff = total - customTotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            แยกบิล — ฿{total.toLocaleString()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Split Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSplitType('equal')}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                splitType === 'equal'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Equal className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-semibold">แบ่งเท่าๆ กัน</span>
            </button>
            <button
              onClick={() => {
                setSplitType('custom');
                initCustomAmounts(numberOfPeople);
              }}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                splitType === 'custom'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Pencil className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-semibold">กำหนดเอง</span>
            </button>
          </div>

          {/* Number of people */}
          <div>
            <Label className="text-sm font-semibold">จำนวนคน</Label>
            <div className="flex items-center gap-3 mt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const n = Math.max(2, numberOfPeople - 1);
                  setNumberOfPeople(n);
                  if (splitType === 'custom') initCustomAmounts(n);
                }}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold text-foreground w-12 text-center">{numberOfPeople}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const n = Math.min(10, numberOfPeople + 1);
                  setNumberOfPeople(n);
                  if (splitType === 'custom') initCustomAmounts(n);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {splitType === 'equal' ? (
            <div className="space-y-2">
              {Array.from({ length: numberOfPeople }).map((_, i) => {
                const amt = i < numberOfPeople - 1 ? equalAmount : lastPersonAmount;
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium text-foreground">คนที่ {i + 1}</span>
                    <span className="text-sm font-bold text-primary">฿{amt.toLocaleString()}</span>
                  </div>
                );
              })}
              <Button onClick={handleEqualSplit} className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80">
                ยืนยันแยกบิล
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {customAmounts.map((amt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground w-16">คนที่ {i + 1}</span>
                  <Input
                    type="number"
                    value={amt}
                    onChange={(e) => updateCustomAmount(i, parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                </div>
              ))}
              {customDiff !== 0 && (
                <p className={`text-xs font-semibold ${customDiff > 0 ? 'text-destructive' : 'text-orange-600'}`}>
                  {customDiff > 0 ? `ยังขาดอีก ฿${customDiff.toLocaleString()}` : `เกินมา ฿${Math.abs(customDiff).toLocaleString()}`}
                </p>
              )}
              <Button
                onClick={handleCustomSplit}
                disabled={customDiff !== 0}
                className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80"
              >
                ยืนยันแยกบิล
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SplitBillModal;
