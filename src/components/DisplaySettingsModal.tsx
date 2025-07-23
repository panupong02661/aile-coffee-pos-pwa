
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useEffect } from 'react';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridColumns: number;
  setGridColumns: (columns: number) => void;
  itemSize: 'small' | 'medium' | 'large';
  setItemSize: (size: 'small' | 'medium' | 'large') => void;
  page?: 'pos' | 'online' | 'dashboard' | 'qr-promptpay' | 'customer-online' | 'other';
}

const DisplaySettingsModal = ({
  isOpen,
  onClose,
  gridColumns,
  setGridColumns,
  itemSize,
  setItemSize,
  page = 'other'
}: DisplaySettingsModalProps) => {
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (page === 'online') {
      localStorage.setItem('online-grid-columns', gridColumns.toString());
      localStorage.setItem('online-item-size', itemSize);
    } else if (page === 'pos') {
      localStorage.setItem('pos-grid-columns', gridColumns.toString());
      localStorage.setItem('pos-item-size', itemSize);
    } else if (page === 'customer-online') {
      localStorage.setItem('customer-online-grid-columns', gridColumns.toString());
      localStorage.setItem('customer-online-item-size', itemSize);
    }
  }, [gridColumns, itemSize, page]);

  const handleGridColumnsChange = (value: number[]) => {
    setGridColumns(value[0]);
  };

  const sizeOptions = [
    { value: 'small' as const, label: 'เล็ก' },
    { value: 'medium' as const, label: 'กลาง' },
    { value: 'large' as const, label: 'ใหญ่' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            ตั้งค่าการแสดงผล
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              จำนวนคอลัมน์: {gridColumns}
            </Label>
            <Slider
              value={[gridColumns]}
              onValueChange={handleGridColumnsChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">ขนาดรายการ</Label>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={itemSize === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setItemSize(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettingsModal;
