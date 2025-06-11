
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridColumns: number;
  setGridColumns: (columns: number) => void;
  itemSize: 'small' | 'medium' | 'large';
  setItemSize: (size: 'small' | 'medium' | 'large') => void;
}

const DisplaySettingsModal = ({
  isOpen,
  onClose,
  gridColumns,
  setGridColumns,
  itemSize,
  setItemSize
}: DisplaySettingsModalProps) => {
  const columnOptions = [3, 4, 5, 6];
  const sizeOptions: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
  
  const getSizeLabel = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'เล็ก';
      case 'medium': return 'กลาง';
      case 'large': return 'ใหญ่';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-coffee-200">
        <DialogHeader>
          <DialogTitle className="text-coffee-800">ตั้งค่าการแสดงผล</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-coffee-700">จำนวนเมนูต่อแถว</h4>
            <div className="grid grid-cols-4 gap-2">
              {columnOptions.map((option) => (
                <Button
                  key={option}
                  variant={gridColumns === option ? "default" : "outline"}
                  onClick={() => setGridColumns(option)}
                  className={`${
                    gridColumns === option
                      ? 'bg-coffee-600 hover:bg-coffee-700 text-white'
                      : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-coffee-700">ขนาดเมนู</h4>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((option) => (
                <Button
                  key={option}
                  variant={itemSize === option ? "default" : "outline"}
                  onClick={() => setItemSize(option)}
                  className={`${
                    itemSize === option
                      ? 'bg-coffee-600 hover:bg-coffee-700 text-white'
                      : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
                  }`}
                >
                  {getSizeLabel(option)}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-coffee-600 hover:bg-coffee-700"
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettingsModal;
