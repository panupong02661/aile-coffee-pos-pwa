
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
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  menuItems?: any[];
  onMenuItemSelect?: (menuItem: any) => void;
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
  onMenuItemSelect = () => {}
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
      {/* First Row: Menu button, Customer button, Categories, Member Name/Tier, Search, Settings */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>

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
          {/* Member Name and Tier - aligned to the right */}
          <div className="flex items-center justify-end min-w-[200px]">
            {selectedMember && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm">
                <span className="text-sm font-bold text-blue-900 tracking-wide">
                  {selectedMember.name}
                </span>
                <Badge className={`${getTierBadgeColor(selectedMember.tier)} text-xs px-2 py-0.5 font-bold shadow-sm`}>
                  <span className="flex items-center gap-1">
                    {getTierIcon(selectedMember.tier)}
                    {getTierName(selectedMember.tier)}
                  </span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveMember}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-5 h-5 p-0 ml-1 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

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
    </>
  );
};

export default Header;
