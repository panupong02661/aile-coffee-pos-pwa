
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MenuItem, Addon } from '@/types';
import { DatabaseAddon } from '@/hooks/useSupabaseData';
import AddonOption, { getSavedAddonStyleId, ADDON_STYLE_STORAGE_KEY } from './AddonOption';

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
  const [styleId, setStyleId] = useState<number>(1);

  useEffect(() => {
    const savedConfig = localStorage.getItem('addonDisplayConfig');
    if (savedConfig) {
      setDisplayConfig(JSON.parse(savedConfig));
    }
    setStyleId(getSavedAddonStyleId());
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
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] p-0 flex flex-col overflow-hidden gap-0">
        <DialogHeader className="flex-shrink-0 border-b px-4 py-3 bg-background">
          <DialogTitle className="text-xl font-bold">เลือกตัวเลือกสำหรับ {menuItem.name}</DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div key={groupName} className={`space-y-1.5 border rounded-lg p-3 ${color.border} ${color.bg}`}>
                  <h3 className="font-bold text-base text-coffee-800">
                    {groupName} {isRequired && <span className="text-red-500">*</span>}
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {groupAddons.map(addon => (
                      <AddonOption
                        key={addon.id}
                        name={addon.name}
                        price={Number(addon.price)}
                        selected={isAddonSelected(addon)}
                        onClick={() => handleAddonToggle(addon, groupName)}
                        styleId={styleId}
                        config={displayConfig}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between items-center mb-3">
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
      </DialogContent>
    </Dialog>
  );
};

export default AddonModal;

