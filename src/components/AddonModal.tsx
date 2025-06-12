
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MenuItem, Addon } from '@/types';

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  addons: Addon[];
  onAddToCart: (menuItem: MenuItem, selectedAddons: Addon[]) => void;
}

const AddonModal = ({ isOpen, onClose, menuItem, addons, onAddToCart }: AddonModalProps) => {
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  if (!menuItem) return null;

  const addonGroups = [...new Set(addons.map(addon => addon.addon_groups?.name).filter(Boolean))];

  const handleAddonToggle = (addon: Addon, groupName: string) => {
    const groupAddons = addons.filter(a => a.addon_groups?.name === groupName);
    const allowMultiple = groupAddons[0]?.addon_groups?.allow_multiple || false;

    if (allowMultiple) {
      setSelectedAddons(prev => 
        prev.find(a => a.id === addon.id)
          ? prev.filter(a => a.id !== addon.id)
          : [...prev, addon]
      );
    } else {
      setSelectedAddons(prev => [
        ...prev.filter(a => a.addon_groups?.name !== groupName),
        addon
      ]);
    }
  };

  const isAddonSelected = (addon: Addon) => {
    return selectedAddons.some(a => a.id === addon.id);
  };

  const handleAddToCart = () => {
    onAddToCart(menuItem, selectedAddons);
    setSelectedAddons([]);
    onClose();
  };

  const totalPrice = menuItem.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เลือกตัวเลือกสำหรับ {menuItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {addonGroups.map(groupName => {
            if (!groupName) return null;
            const groupAddons = addons.filter(addon => addon.addon_groups?.name === groupName);
            const allowMultiple = groupAddons[0]?.addon_groups?.allow_multiple || false;
            
            return (
              <div key={groupName} className="space-y-3">
                <h3 className="font-medium text-coffee-800">
                  {groupName} {!allowMultiple && <span className="text-red-500">*</span>}
                </h3>
                
                <div className="space-y-2">
                  {groupAddons.map(addon => (
                    <Button
                      key={addon.id}
                      variant={isAddonSelected(addon) ? "default" : "outline"}
                      className={`w-full h-7 text-left justify-start ${
                        isAddonSelected(addon) 
                          ? 'bg-coffee-600 hover:bg-coffee-700 text-white' 
                          : 'hover:bg-coffee-50'
                      }`}
                      onClick={() => handleAddonToggle(addon, groupName)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>{addon.name}</span>
                        {addon.price > 0 && (
                          <span className="text-orange-600 font-medium">
                            +฿{addon.price}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">ราคารวม:</span>
              <span className="text-xl font-bold text-coffee-600">฿{totalPrice}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                ยกเลิก
              </Button>
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 bg-coffee-600 hover:bg-coffee-700"
              >
                เพิ่มลงตะกร้า
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddonModal;
