
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Grid, Settings } from 'lucide-react';

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
  const handleSaveSettings = () => {
    // บันทึกการตั้งค่าใน localStorage
    localStorage.setItem('displaySettings', JSON.stringify({
      gridColumns,
      itemSize
    }));
    onClose();
  };

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
            <Label className="text-sm font-medium">จำนวนคอลัมน์</Label>
            <div className="space-y-2">
              <Slider
                value={[gridColumns]}
                onValueChange={(value) => setGridColumns(value[0])}
                max={6}
                min={2}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
              <div className="text-center text-sm text-gray-600">
                {gridColumns} คอลัมน์
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">ขนาดรายการ</Label>
            <Select value={itemSize} onValueChange={setItemSize}>
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

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Grid className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">ตัวอย่าง</span>
            </div>
            <div 
              className={`grid gap-2`}
              style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
            >
              {Array.from({ length: Math.min(gridColumns * 2, 6) }).map((_, index) => (
                <div
                  key={index}
                  className={`bg-white border rounded-lg p-2 text-center ${
                    itemSize === 'small' ? 'h-16' :
                    itemSize === 'medium' ? 'h-20' : 'h-24'
                  }`}
                >
                  <div className="w-full bg-gray-200 rounded mb-1" 
                       style={{ height: itemSize === 'small' ? '24px' : itemSize === 'medium' ? '32px' : '40px' }}>
                  </div>
                  <div className={`text-gray-600 ${
                    itemSize === 'small' ? 'text-xs' :
                    itemSize === 'medium' ? 'text-sm' : 'text-base'
                  }`}>
                    รายการ {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            ยกเลิก
          </Button>
          <Button onClick={handleSaveSettings} className="flex-1">
            บันทึกการตั้งค่า
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettingsModal;
