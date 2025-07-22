
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';

interface DisplaySettingsProps {
  gridColumns: number;
  itemSize: 'small' | 'medium' | 'large';
  onGridColumnsChange: (columns: number) => void;
  onItemSizeChange: (size: 'small' | 'medium' | 'large') => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  gridColumns,
  itemSize,
  onGridColumnsChange,
  onItemSizeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('customerAppDisplaySettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        onGridColumnsChange(settings.gridColumns || 2);
        onItemSizeChange(settings.itemSize || 'medium');
      } catch (error) {
        console.error('Error loading display settings:', error);
      }
    }
  }, [onGridColumnsChange, onItemSizeChange]);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      gridColumns,
      itemSize
    };
    localStorage.setItem('customerAppDisplaySettings', JSON.stringify(settings));
  }, [gridColumns, itemSize]);

  const handleGridColumnsChange = (value: number[]) => {
    onGridColumnsChange(value[0]);
  };

  const handleItemSizeChange = (size: 'small' | 'medium' | 'large') => {
    onItemSizeChange(size);
  };

  const getSizeButtonClass = (size: 'small' | 'medium' | 'large') => {
    return `px-4 py-2 rounded ${
      itemSize === size 
        ? 'bg-coffee-600 text-white' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-coffee-600 border-coffee-300">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            ตั้งค่าการแสดงผล
          </DialogTitle>
        </DialogHeader>
        <CardContent className="space-y-6 p-0">
          <div className="space-y-3">
            <Label className="text-sm font-medium">จำนวนคอลัมน์: {gridColumns}</Label>
            <Slider
              value={[gridColumns]}
              onValueChange={handleGridColumnsChange}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">ขนาดรายการ</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => handleItemSizeChange('small')}
                className={getSizeButtonClass('small')}
                size="sm"
              >
                เล็ก
              </Button>
              <Button
                type="button"
                onClick={() => handleItemSizeChange('medium')}
                className={getSizeButtonClass('medium')}
                size="sm"
              >
                กลาง
              </Button>
              <Button
                type="button"
                onClick={() => handleItemSizeChange('large')}
                className={getSizeButtonClass('large')}
                size="sm"
              >
                ใหญ่
              </Button>
            </div>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default DisplaySettings;
