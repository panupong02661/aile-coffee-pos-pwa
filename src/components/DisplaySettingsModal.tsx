
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, X } from 'lucide-react';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              ตั้งค่าการแสดงผล
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Grid Columns Setting */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">จำนวนคอลัมน์ ({gridColumns} คอลัมน์)</Label>
            <Slider
              value={[gridColumns]}
              onValueChange={([value]) => setGridColumns(value)}
              min={1}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
            </div>
          </div>

          {/* Item Size Setting */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">ขนาดรายการ</Label>
            <Select value={itemSize} onValueChange={(value: 'small' | 'medium' | 'large') => setItemSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">เล็ก</SelectItem>
                <SelectItem value="medium">กลาง</SelectItem>
                <SelectItem value="large">ใหญ่</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700">
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettingsModal;
