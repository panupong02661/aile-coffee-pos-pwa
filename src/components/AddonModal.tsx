
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MenuItem, Addon } from '@/types';
import { DatabaseAddon } from '@/hooks/useSupabaseData';
import AddonOption, { getSavedAddonStyleId, ADDON_STYLE_STORAGE_KEY } from './AddonOption';
import { cn } from '@/lib/utils';
import { AddonMedia } from './AddonMediaField';

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
  styleIdOverride?: number;
  previewMode?: boolean;
}

const AddonModal = ({ isOpen, onClose, menuItem, addons, onAddToCart, styleIdOverride, previewMode = false }: AddonModalProps) => {
  const [selectedAddons, setSelectedAddons] = useState<DatabaseAddon[]>([]);
  const [displayConfig, setDisplayConfig] = useState<AddonDisplayConfig>(defaultConfig);
  const [styleId, setStyleId] = useState<number>(1);

  useEffect(() => {
    const savedConfig = localStorage.getItem('addonDisplayConfig');
    if (savedConfig) {
      setDisplayConfig(JSON.parse(savedConfig));
    }
    setStyleId(styleIdOverride ?? getSavedAddonStyleId());
  }, [isOpen, styleIdOverride]);

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
    if (previewMode) return;
    onAddToCart(menuItem, selectedAddons);
    setSelectedAddons([]);
    onClose();
  };

  const totalPrice = menuItem.price + selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
  const isClassic = styleId === 22;
  const isPixel = styleId === 23;
  const isFloating = styleId === 24;
  const isLeftLabel = styleId === 25;
  const isMagazine = styleId === 26;
  const isReferenceTemplate = styleId >= 22;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'max-w-4xl max-h-[90vh] h-[90vh] p-0 flex flex-col overflow-hidden gap-0',
        isClassic && 'border-[3px] border-[hsl(var(--addon-classic-ink))] bg-[hsl(var(--addon-classic-paper))]',
        isPixel && 'border-4 border-[hsl(var(--addon-pixel-ink))] bg-[hsl(var(--addon-pixel-yellow)/0.16)] rounded-md',
        isFloating && 'max-w-2xl border-0 bg-[hsl(var(--addon-float-surface))] rounded-[28px] shadow-2xl',
        isLeftLabel && 'bg-[hsl(var(--addon-left-surface))] rounded-2xl',
        isMagazine && 'max-w-5xl bg-[hsl(var(--addon-magazine-paper))] rounded-2xl'
      )}>
        <DialogHeader className={cn('flex-shrink-0 border-b px-4 py-3 bg-background', isClassic && 'bg-transparent text-center py-5', isPixel && 'bg-[hsl(var(--addon-pixel-ink))] text-[hsl(var(--addon-classic-cream))] border-0 text-center', isFloating && 'bg-transparent border-0 px-8 pt-7 pb-2', isLeftLabel && 'bg-transparent px-6 py-5', isMagazine && 'bg-foreground text-background text-center py-4')}>
          {menuItem.image && !isMagazine && (
            <img
              src={menuItem.image}
              alt={menuItem.name}
              className={cn(
                'object-cover',
                !isClassic && !isFloating && !isLeftLabel && 'mx-auto mb-2 h-24 w-full max-w-sm rounded-lg',
                isClassic && 'mx-auto mb-2 h-28 w-28 rounded-full border-4 border-[hsl(var(--addon-classic-cream))] shadow-md',
                isFloating && 'absolute right-10 top-10 h-44 w-44 rounded-full shadow-2xl',
                isLeftLabel && 'h-32 w-32 rounded-xl float-left mr-5'
              )}
            />
          )}
          <DialogTitle className={cn('text-xl font-bold', isClassic && 'text-2xl', isPixel && 'font-mono text-2xl', isFloating && 'text-3xl', isMagazine && 'text-2xl')}>
            {isPixel ? 'เพิ่มตัวเลือก' : isMagazine ? 'ปรับแต่งเครื่องดื่ม' : isReferenceTemplate ? menuItem.name : `เลือกตัวเลือกสำหรับ ${menuItem.name}`}
          </DialogTitle>
          {isReferenceTemplate && <p className={cn('text-sm', isPixel ? 'text-[hsl(var(--addon-classic-cream))]' : 'text-muted-foreground')}>฿{menuItem.price}</p>}
        </DialogHeader>

        {isMagazine && menuItem.image && (
          <img src={menuItem.image} alt={menuItem.name} className="absolute bottom-0 left-0 top-[72px] hidden h-[calc(100%-72px)] w-[42%] object-cover md:block" />
        )}

        {/* Scrollable Body */}
        <div className={cn('flex-1 overflow-y-auto px-4 py-3', isClassic && 'px-6', isFloating && 'px-8 pt-3', isLeftLabel && 'px-6', isMagazine && 'md:ml-[42%] px-5')}>
          <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-3', isReferenceTemplate && 'md:grid-cols-1')}>
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
                <div key={groupName} className={cn(`space-y-1.5 border rounded-lg p-3 ${color.border} ${color.bg}`, isClassic && 'border-0 border-t border-dotted rounded-none bg-transparent py-4', isPixel && 'border-0 border-t-4 rounded-none bg-transparent', isFloating && 'border-0 bg-transparent px-0 py-3', isLeftLabel && 'grid grid-cols-[125px_1fr] items-center border-0 border-b rounded-none bg-transparent px-0 py-4', isMagazine && 'border-0 border-b rounded-none bg-transparent px-0 py-4')}>
                  <h3 className={cn('flex items-center gap-2 font-bold text-base text-foreground', isPixel && 'inline-flex w-fit bg-[hsl(var(--addon-pixel-ink))] text-[hsl(var(--addon-classic-cream))] px-3 py-1 font-mono', isMagazine && 'border-l-4 border-[hsl(var(--addon-magazine-accent))] pl-3')}>
                    <AddonMedia mediaType={groupAddons[0]?.addon_groups?.media_type} iconName={groupAddons[0]?.addon_groups?.icon_name} imageUrl={groupAddons[0]?.addon_groups?.image_url} imageClassName="h-8 w-8 rounded-md" />
                    {groupName} {isRequired && <span className="text-destructive">*</span>}
                  </h3>
                  <div className={cn('grid grid-cols-3 gap-1.5', isClassic && 'grid-cols-4', isPixel && 'gap-3', isFloating && 'gap-4', isLeftLabel && 'grid-cols-4', isMagazine && 'gap-2')}>
                    {groupAddons.map(addon => (
                      <AddonOption
                        key={addon.id}
                        name={addon.name}
                        price={Number(addon.price)}
                        selected={isAddonSelected(addon)}
                        onClick={() => handleAddonToggle(addon, groupName)}
                        styleId={styleId}
                        config={displayConfig}
                        mediaType={addon.media_type}
                        iconName={addon.icon_name}
                        imageUrl={addon.image_url}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className={cn('flex-shrink-0 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]', isClassic && 'bg-transparent', isPixel && 'bg-transparent border-0', isFloating && 'bg-transparent border-0 px-8 pb-6', isMagazine && 'md:ml-[42%] bg-transparent')}>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-lg">ราคารวม:</span>
            <span className="text-2xl font-bold text-muted-foreground">฿{totalPrice}</span>
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
              className={cn('flex-1 bg-primary hover:bg-primary/90 font-bold text-lg h-12', isClassic && 'rounded-xl bg-[hsl(var(--addon-classic-ink))] text-[hsl(var(--addon-classic-cream))]', isPixel && 'rounded-md border-4 border-[hsl(var(--addon-pixel-ink))] bg-[hsl(var(--addon-pixel-green))] font-mono shadow-[4px_4px_0_hsl(var(--addon-pixel-ink))]', isFloating && 'rounded-full bg-[hsl(var(--addon-float-accent))]', isMagazine && 'bg-[hsl(var(--addon-magazine-accent))] rounded-xl')}
            >
              {previewMode ? 'ปุ่มเพิ่มลงตะกร้า' : 'เพิ่มลงตะกร้า'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddonModal;

