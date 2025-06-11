
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MenuItem, Addon, AddonCategory } from '@/types';

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  addons: Addon[];
  onConfirm: (selectedAddons: Addon[]) => void;
}

const AddonModal = ({ isOpen, onClose, menuItem, addons, onConfirm }: AddonModalProps) => {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Auto-select required single-choice addons with default options
      const defaultSelections: string[] = [];
      const addonsByCategory = groupAddonsByCategory(addons);
      
      Object.entries(addonsByCategory).forEach(([category, categoryAddons]) => {
        const requiredSingleChoice = categoryAddons.find(addon => 
          addon.is_required && !addon.allow_multiple
        );
        if (requiredSingleChoice) {
          // Select the first option as default for required single-choice
          defaultSelections.push(categoryAddons[0].id);
        }
      });
      
      setSelectedAddons(defaultSelections);
    } else {
      setSelectedAddons([]);
    }
  }, [isOpen, addons]);

  const groupAddonsByCategory = (addons: Addon[]) => {
    return addons.reduce((groups, addon) => {
      if (!groups[addon.category]) {
        groups[addon.category] = [];
      }
      groups[addon.category].push(addon);
      return groups;
    }, {} as Record<AddonCategory, Addon[]>);
  };

  const handleSingleChoiceChange = (categoryAddons: Addon[], selectedAddonId: string) => {
    setSelectedAddons(prev => {
      // Remove all addons from this category
      const filtered = prev.filter(id => 
        !categoryAddons.some(addon => addon.id === id)
      );
      // Add the new selection
      return [...filtered, selectedAddonId];
    });
  };

  const handleMultipleChoiceChange = (addonId: string, checked: boolean) => {
    setSelectedAddons(prev => 
      checked 
        ? [...prev, addonId]
        : prev.filter(id => id !== addonId)
    );
  };

  const handleConfirm = () => {
    // Validate required addons
    const addonsByCategory = groupAddonsByCategory(addons);
    const isValid = Object.entries(addonsByCategory).every(([category, categoryAddons]) => {
      const hasRequired = categoryAddons.some(addon => addon.is_required);
      if (!hasRequired) return true;
      
      const hasSelection = categoryAddons.some(addon => 
        selectedAddons.includes(addon.id)
      );
      return hasSelection;
    });

    if (!isValid) {
      alert('กรุณาเลือกตัวเลือกที่จำเป็น');
      return;
    }

    const selectedAddonObjects = addons.filter(addon => 
      selectedAddons.includes(addon.id)
    );
    onConfirm(selectedAddonObjects);
  };

  const calculateTotal = () => {
    if (!menuItem) return 0;
    const addonTotal = addons
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    return menuItem.price + addonTotal;
  };

  const addonsByCategory = groupAddonsByCategory(addons);
  const categoryNames = {
    shot: 'ชอต',
    sweetness: 'ความหวาน',
    topping: 'ท็อปปิ้ง',
    size: 'ขนาด',
    other: 'อื่นๆ'
  };

  if (!menuItem) return null;

  const categoryEntries = Object.entries(addonsByCategory);
  const leftCategories = categoryEntries.slice(0, Math.ceil(categoryEntries.length / 2));
  const rightCategories = categoryEntries.slice(Math.ceil(categoryEntries.length / 2));

  const renderCategorySection = (categories: [string, Addon[]][]) => (
    <div className="space-y-6">
      {categories.map(([category, categoryAddons]) => {
        const isMultipleChoice = categoryAddons[0]?.allow_multiple;
        const isRequired = categoryAddons.some(addon => addon.is_required);

        return (
          <div key={category} className="space-y-3">
            <h3 className="font-medium text-coffee-700">
              {categoryNames[category as AddonCategory]}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </h3>

            {isMultipleChoice ? (
              <div className="space-y-2">
                {categoryAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={addon.id}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={(checked) => 
                        handleMultipleChoiceChange(addon.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={addon.id} className="flex-1 cursor-pointer text-sm">
                      <span>{addon.name}</span>
                      {addon.price !== 0 && (
                        <span className="ml-2 text-coffee-600">
                          ({addon.price > 0 ? '+' : ''}฿{addon.price})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                value={selectedAddons.find(id => 
                  categoryAddons.some(addon => addon.id === id)
                ) || ''}
                onValueChange={(value) => handleSingleChoiceChange(categoryAddons, value)}
              >
                {categoryAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={addon.id} id={addon.id} />
                    <Label htmlFor={addon.id} className="flex-1 cursor-pointer text-sm">
                      <span>{addon.name}</span>
                      {addon.price !== 0 && (
                        <span className="ml-2 text-coffee-600">
                          ({addon.price > 0 ? '+' : ''}฿{addon.price})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-coffee-200">
        <DialogHeader>
          <DialogTitle className="text-coffee-800">
            เลือกตัวเลือกสำหรับ {menuItem.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {renderCategorySection(leftCategories)}
          {renderCategorySection(rightCategories)}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-coffee-700">ราคารวม:</span>
            <span className="text-xl font-bold text-coffee-600">
              ฿{calculateTotal()}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-coffee-300 text-coffee-700">
            ยกเลิก
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-coffee-600 hover:bg-coffee-700"
          >
            เพิ่มลงตะกร้า
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddonModal;
