
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Menu, Search, Settings, User, Star, Award, Crown, X, Bug } from 'lucide-react';
import DisplaySettingsModal from './DisplaySettingsModal';
import { cn } from '@/lib/utils';

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
  onMemberInfoClick?: () => void;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  menuItems?: any[];
  onMenuItemSelect?: (menuItem: any) => void;
  showDebug?: boolean;
  onToggleDebug?: () => void;
  onSearchOpen?: () => void;
  onSettingsOpen?: () => void;
  trailing?: React.ReactNode;
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
  searchTerm = '',
  onSearchChange = () => {},
  menuItems = [],
  onMenuItemSelect = () => {},
  showDebug,
  onToggleDebug,
  onSearchOpen,
  onSettingsOpen,
  onMemberInfoClick,
  trailing
}: HeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

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

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  const handleMenuItemClick = (menuItem: any) => {
    onMenuItemSelect(menuItem);
    setIsSearchOpen(false);
    setLocalSearchTerm('');
  };

  return (
    <>
      {/* First Row: Menu button, Customer button, Categories, Member Name/Tier */}
      <div className={cn('flex w-full justify-between', trailing ? 'items-start gap-2' : 'items-center overflow-hidden')}>
        <div className={cn('flex items-center', trailing ? 'flex-shrink-0' : 'flex-1 min-w-0 overflow-hidden')}>
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="flex-shrink-0 hidden">
            <Menu className="w-5 h-5" />
          </Button>

          {onMemberClick && (
            <Button variant="outline" size="icon" className="ml-2 flex-shrink-0" onClick={onMemberClick}>
              <User className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center ml-2 md:ml-6 flex-shrink min-w-0 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="mr-2 flex-shrink-0"
                onClick={() => onCategorySelect(category.id)}
              >
                {category.name}
              </Button>
            ))}
            
            {onToggleDebug && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleDebug}
                className="ml-2 flex-shrink-0"
              >
                <Bug className="w-5 h-5" />
              </Button>
            )}
            
            {onSearchOpen && (
              <Button variant="ghost" size="icon" onClick={onSearchOpen} className="flex-shrink-0">
                <Search className="w-5 h-5" />
              </Button>
            )}
            
            {onSettingsOpen && (
              <Button variant="ghost" size="icon" onClick={onSettingsOpen} className="flex-shrink-0">
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>

          {trailing && (
            <div className="ml-2 flex-1 min-w-0">
              {trailing}
            </div>
          )}
        </div>

        {/* Member display - height matches category buttons */}
        {selectedMember && (
          <div 
            onClick={() => onMemberInfoClick?.()}
            className="flex items-center gap-1.5 px-3 h-9 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 ml-2"
            style={{ maxWidth: '180px' }}
          >
            <span className="text-sm font-bold text-blue-900 truncate" style={{ maxWidth: '70px' }}>
              {selectedMember.name}
            </span>
            <Badge className={`${getTierBadgeColor(selectedMember.tier)} text-[10px] px-1.5 py-0.5 font-bold shadow-sm flex-shrink-0`}>
              <span className="flex items-center gap-0.5">
                {getTierIcon(selectedMember.tier)}
                {getTierName(selectedMember.tier)}
              </span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveMember();
              }}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-5 h-5 p-0 rounded-full flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="bg-background max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>ค้นหาสินค้า</SheetTitle>
            <SheetDescription>
              ป้อนชื่อสินค้าที่คุณต้องการค้นหา
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search">คำค้นหา</Label>
              <Input 
                id="search" 
                placeholder="พิมพ์ชื่อเมนูที่ต้องการค้นหา..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* Search Results */}
            {localSearchTerm && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">ผลการค้นหา ({filteredMenuItems.length} รายการ)</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredMenuItems.length > 0 ? (
                    filteredMenuItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleMenuItemClick(item)}
                      >
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ฿{Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">เลือก</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      ไม่พบเมนูที่ตรงกับการค้นหา
                    </div>
                  )}
                </div>
              </div>
            )}
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

      {/* Return search and settings button functions for parent component */}
      <div style={{ display: 'none' }}>
        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </>
  );
};

export { Header as default };
