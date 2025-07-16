import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface AddOnManagerProps {
  item: MenuItem;
  onAdd: (item: MenuItem, addOns: AddOn[]) => void;
  onClose: () => void;
}

export const AddOnManager: React.FC<AddOnManagerProps> = ({ item, onAdd, onClose }) => {
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  const availableAddOns: AddOn[] = [
    { id: '1', name: 'Extra Shot', price: 15 },
    { id: '2', name: 'Decaf', price: 0 },
    { id: '3', name: 'Soy Milk', price: 10 },
    { id: '4', name: 'Almond Milk', price: 15 },
    { id: '5', name: 'Extra Hot', price: 0 },
    { id: '6', name: 'Extra Foam', price: 5 },
    { id: '7', name: 'Vanilla Syrup', price: 10 },
    { id: '8', name: 'Caramel Syrup', price: 10 },
  ];

  const handleAddOnToggle = (addOn: AddOn, checked: boolean) => {
    if (checked) {
      setSelectedAddOns(prev => [...prev, addOn]);
    } else {
      setSelectedAddOns(prev => prev.filter(item => item.id !== addOn.id));
    }
  };

  const calculatePrice = () => {
    return item.price + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
  };

  const handleConfirm = () => {
    onAdd(item, selectedAddOns);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เลือก Add-ons สำหรับ {item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add-ons ที่มีให้เลือก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableAddOns.map(addOn => (
                <div key={addOn.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={addOn.id}
                      checked={selectedAddOns.some(item => item.id === addOn.id)}
                      onCheckedChange={(checked) => handleAddOnToggle(addOn, checked as boolean)}
                    />
                    <label htmlFor={addOn.id} className="text-sm font-medium">
                      {addOn.name}
                    </label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {addOn.price > 0 ? `+฿${addOn.price}` : 'ฟรี'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>ราคารวม:</span>
              <span>฿{calculatePrice()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm}>
            เพิ่มในรายการ (฿{calculatePrice()})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};