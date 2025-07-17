
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridColumns: number;
  setGridColumns: (columns: number) => void;
  itemSize: 'small' | 'medium' | 'large';
  setItemSize: (size: 'small' | 'medium' | 'large') => void;
  page: 'pos' | 'online' | 'dashboard' | 'qr-promptpay' | 'menu' | 'customer-app' | 'other';
}

const DisplaySettingsModal = ({
  isOpen,
  onClose,
  gridColumns,
  setGridColumns,
  itemSize,
  setItemSize,
  page
}: DisplaySettingsModalProps) => {
  const handleGridColumnsChange = (value: number[]) => {
    setGridColumns(value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cream-100">
        <DialogHeader>
          <DialogTitle>ตั้งค่าการแสดงผล</DialogTitle>
          <DialogDescription>
            ปรับแต่งการแสดงผลของรายการสินค้า
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {(page === 'pos' || page === 'menu') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grid-columns" className="text-right">
                จำนวนคอลัมน์
              </Label>
              <div className="col-span-3">
                <Slider
                  id="grid-columns"
                  min={2}
                  max={6}
                  step={1}
                  value={[gridColumns]}
                  onValueChange={handleGridColumnsChange}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {gridColumns} คอลัมน์
                </div>
              </div>
            </div>
          )}

          {(page === 'pos' || page === 'menu') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-size" className="text-right">
                ขนาดรายการ
              </Label>
              <div className="col-span-3">
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
            </div>
          )}

          {page === 'other' && (
            <div className="text-center text-gray-500">
              ไม่มีการตั้งค่าสำหรับหน้านี้
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettingsModal;
