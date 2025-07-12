
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';

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
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            ตั้งค่าการแสดงผล
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Grid Columns Setting */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">จำนวนคอลัมน์ ({gridColumns} คอลัมน์)</Label>
            <Slider
              value={[gridColumns]}
              onValueChange={([value]) => setGridColumns(value)}
              min={1}
              max={10}
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
              <span>9</span>
              <span>10</span>
            </div>
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              <strong>แนะนำ:</strong> 2 คอลัมน์สำหรับมือถือ, 3-4 คอลัมน์สำหรับแท็บเล็ต, 6-10 คอลัมน์สำหรับเดสท็อป
            </div>
          </div>

          {/* Item Size Setting */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">ขนาดรายการ</Label>
            <Select 
              value={itemSize} 
              onValueChange={(value: 'small' | 'medium' | 'large') => setItemSize(value)}
            >
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

          {/* Quick Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">ตัวเลือกด่วน</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => setGridColumns(2)}
                variant={gridColumns === 2 ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                📱 มือถือ (2 คอลัมน์)
              </Button>
              <Button
                onClick={() => setGridColumns(3)}
                variant={gridColumns === 3 ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                📋 แท็บเล็ต (3 คอลัมน์)
              </Button>
              <Button
                onClick={() => setGridColumns(6)}
                variant={gridColumns === 6 ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                🖥️ เดสท็อป (6 คอลัมน์)
              </Button>
              <Button
                onClick={() => setGridColumns(10)}
                variant={gridColumns === 10 ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                🖥️ เดสท็อปใหญ่ (10 คอลัมน์)
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettingsModal;
