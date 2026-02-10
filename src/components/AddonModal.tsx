
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MenuItem, Addon } from '@/types';
import { DatabaseAddon } from '@/hooks/useSupabaseData';

interface AddonDisplayConfig {
  fontSize: string;
  fontWeight: string;
  textColor: string;
  backgroundColor: string;
  selectedTextColor: string;
  selectedBackgroundColor: string;
  borderRadius: string;
  minHeight: string;
}

const defaultConfig: AddonDisplayConfig = {
  fontSize: '14',
  fontWeight: 'bold',
  textColor: '#5d4a3f',
  backgroundColor: '#ffffff',
  selectedTextColor: '#ffffff',
  selectedBackgroundColor: '#6f4e37',
  borderRadius: '8',
  minHeight: '52',
};

interface AddonModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  addons: DatabaseAddon[];
  onAddToCart: (menuItem: MenuItem, selectedAddons: DatabaseAddon[]) => void;
}

const AddonModal = ({ isOpen, onClose, menuItem, addons, onAddToCart }: AddonModalProps) => {
  const [selectedAddons, setSelectedAddons] = useState<DatabaseAddon[]>([]);
  const [displayConfig, setDisplayConfig] = useState<AddonDisplayConfig>(defaultConfig);

  useEffect(() => {
    const savedConfig = localStorage.getItem('addonDisplayConfig');
    if (savedConfig) {
      setDisplayConfig(JSON.parse(savedConfig));
    }
  }, [isOpen]);

  if (!menuItem) return null;

  // Group addons by addon group, sorted by sort_order
  const addonGroupsMap = new Map<string, { name: string; sort_order: number }>();
  addons.forEach(addon => {
    const group = addon.addon_groups;
    if (group?.name && !addonGroupsMap.has(group.name)) {
      addonGroupsMap.set(group.name, { name: group.name, sort_order: (group as any).sort_order ?? 0 });
    }
  });
  const addonGroups = [...addonGroupsMap.values()]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(g => g.name);

  const handleAddonToggle = (addon: DatabaseAddon, groupName: string) => {
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

  const isAddonSelected = (addon: DatabaseAddon) => {
    return selectedAddons.some(a => a.id === addon.id);
  };

  const handleAddToCart = () => {
    onAddToCart(menuItem, selectedAddons);
    setSelectedAddons([]);
    onClose();
  };

  const totalPrice = menuItem.price + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">เลือกตัวเลือกสำหรับ {menuItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addonGroups.map((groupName, groupIndex) => {
              if (!groupName) return null;
              const groupAddons = addons.filter(addon => addon.addon_groups?.name === groupName);
              const allowMultiple = groupAddons[0]?.addon_groups?.allow_multiple || false;
              const isRequired = groupAddons[0]?.addon_groups?.is_required || false;
              
              const groupColors = [
                { border: 'border-orange-200', bg: 'bg-orange-50/60' },
                { border: 'border-blue-200', bg: 'bg-blue-50/60' },
                { border: 'border-purple-200', bg: 'bg-purple-50/60' },
                { border: 'border-green-200', bg: 'bg-green-50/60' },
                { border: 'border-pink-200', bg: 'bg-pink-50/60' },
                { border: 'border-yellow-200', bg: 'bg-yellow-50/60' },
                { border: 'border-teal-200', bg: 'bg-teal-50/60' },
                { border: 'border-indigo-200', bg: 'bg-indigo-50/60' },
              ];
              const color = groupColors[groupIndex % groupColors.length];
              
              return (
                <div key={groupName} className={`space-y-2 border rounded-lg p-4 ${color.border} ${color.bg}`}>
                  <h3 className="font-bold text-lg text-coffee-800">
                    {groupName} {isRequired && <span className="text-red-500">*</span>}
                  </h3>
                  
                  {/* แสดง 3 addon ต่อบรรทัด */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {groupAddons.map(addon => {
                      const isSelected = isAddonSelected(addon);
                      const fontWeightValue = displayConfig.fontWeight === 'normal' ? 400 : displayConfig.fontWeight === 'medium' ? 500 : displayConfig.fontWeight === 'semibold' ? 600 : 700;
                      
                      return (
                        <button
                          key={addon.id}
                          className="text-center justify-center p-2 border transition-all hover:opacity-80"
                          style={{
                            minHeight: `${displayConfig.minHeight}px`,
                            fontSize: `${displayConfig.fontSize}px`,
                            fontWeight: fontWeightValue,
                            color: isSelected ? displayConfig.selectedTextColor : displayConfig.textColor,
                            backgroundColor: isSelected ? displayConfig.selectedBackgroundColor : displayConfig.backgroundColor,
                            borderRadius: `${displayConfig.borderRadius}px`,
                            borderColor: isSelected ? displayConfig.selectedBackgroundColor : '#e5e7eb',
                          }}
                          onClick={() => handleAddonToggle(addon, groupName)}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="truncate w-full text-center">{addon.name}</span>
                            <span 
                              className={`h-4 ${Number(addon.price) > 0 ? '' : 'invisible'}`}
                              style={{
                                fontSize: `${Math.max(parseInt(displayConfig.fontSize) - 2, 10)}px`,
                                fontWeight: 600,
                                color: isSelected ? '#fed7aa' : '#ea580c',
                              }}
                            >
                              {Number(addon.price) > 0 ? `+฿${Number(addon.price)}` : '-'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">ราคารวม:</span>
              <span className="text-2xl font-bold text-coffee-600">฿{totalPrice}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 font-bold text-lg h-12"
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={handleAddToCart} 
                className="flex-1 bg-coffee-600 hover:bg-coffee-700 font-bold text-lg h-12"
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
