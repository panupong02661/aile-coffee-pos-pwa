
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Menu, Search, Settings, User, Star, Award, Crown, X } from 'lucide-react';
import DisplaySettingsModal from './DisplaySettingsModal';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  onMemberClick?: () => void;
  categories?: { id: string; name: string }[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  gridColumns?: number;
  setGridColumns?: (columns: number) => void;
  itemSize?: 'small' | 'medium' | 'large';
  setItemSize?: (size: 'small' | 'medium' | 'large') => void;
  page?: 'pos' | 'online' | 'dashboard' | 'qr-promptpay' | 'other';
  selectedMember?: Member | null;
  onRemoveMember?: () => void;
  title?: string;
}

const Header = ({ 
  onToggleSidebar, 
  onMemberClick, 
  categories = [], 
  selectedCategory = '', 
  onCategorySelect = () => {},
  gridColumns = 4,
  setGridColumns = () => {},
  itemSize = 'medium',
  setItemSize = () => {},
  page = 'other',
  selectedMember,
  onRemoveMember = () => {},
  title
}: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white border-purple-300';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'แพลตินัม';
      case 'gold': return 'ทอง';
      case 'silver': return 'เงิน';
      default: return tier;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-3 h-3" />;
      case 'gold': return <Award className="w-3 h-3" />;
      case 'silver': return <Star className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between bg-card p-4 border-b border-border">
        <div className="flex items-center">
          {/* Hamburger menu button - always visible */}
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-3">
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page title */}
          {title && (
            <h1 className="text-xl font-semibold text-foreground mr-6">{title}</h1>
          )}

          {onMemberClick && (
            <Button variant="outline" size="sm" className="ml-2" onClick={onMemberClick}>
              <User className="w-4 h-4 mr-2" />
              ลูกค้า
            </Button>
          )}
          
          <div className="hidden md:flex items-center ml-6">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="mr-2"
                onClick={() => onCategorySelect(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Enhanced Member Display - Moved before search and settings buttons */}
          {selectedMember && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm mr-3">
              <div className="flex flex-col gap-0.5">
                {/* Line 1: Name and Tier Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-900 tracking-wide">
                    {selectedMember.name}
                  </span>
                  <Badge className={`${getTierBadgeColor(selectedMember.tier)} text-xs px-2 py-0.5 font-bold shadow-sm`}>
                    <span className="flex items-center gap-1">
                      {getTierIcon(selectedMember.tier)}
                      {getTierName(selectedMember.tier)}
                    </span>
                  </Badge>
                </div>
                
                {/* Line 2: Points Display */}
                <div className="flex items-center">
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    ⭐ {selectedMember.points.toLocaleString()} แต้ม
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveMember}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-6 h-6 p-0 ml-2 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="bg-background">
          <SheetHeader>
            <SheetTitle>ค้นหาสินค้า</SheetTitle>
            <SheetDescription>
              ป้อนชื่อสินค้าที่คุณต้องการค้นหา
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search" className="text-right">
                คำค้นหา
              </Label>
              <Input id="search" className="col-span-3" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Settings Modal */}
      <DisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        itemSize={itemSize}
        setItemSize={setItemSize}
        page={page}
      />
    </>
  );
};

export default Header;
