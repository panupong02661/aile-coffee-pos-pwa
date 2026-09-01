import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Star, Award } from 'lucide-react';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
  is_favorite?: boolean;
}

interface MemberSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: Member) => void;
}

const MemberSearchModal = ({ isOpen, onClose, onSelectMember }: MemberSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [favoriteMembers, setFavoriteMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลสมาชิกได้', variant: 'destructive' });
      return;
    }
    
    const typedMembers = (data || []).map(member => ({
      ...member,
      tier: member.tier as 'silver' | 'gold' | 'platinum'
    }));
    
    setMembers(typedMembers);
    setFilteredMembers(typedMembers);
    setFavoriteMembers(typedMembers.filter(m => m.is_favorite));
    setLoading(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter(member => 
      member.name.toLowerCase().includes(term.toLowerCase()) ||
      member.phone.includes(term)
    );
    setFilteredMembers(filtered);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'platinum': return <Award className="w-4 h-4" />;
      case 'gold': return <Star className="w-4 h-4" />;
      case 'silver': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const handleSelectMember = (member: Member) => {
    onSelectMember(member);
    onClose();
    setSearchTerm('');
  };

  const hasFavorites = favoriteMembers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${hasFavorites ? 'max-w-3xl' : 'max-w-md'} max-h-[80vh] overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            ค้นหาสมาชิก
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูลสมาชิก...</div>
          ) : (
            <div className={`flex-1 overflow-hidden ${hasFavorites ? 'grid grid-cols-2 gap-4' : ''}`}>
              {/* All Members List */}
              <div className="overflow-y-auto space-y-2 pr-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">รายชื่อสมาชิก</h3>
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-3" onClick={() => handleSelectMember(member)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{member.name}</h3>
                            {member.is_favorite && (
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                            <Badge className={`text-xs ${getTierBadgeColor(member.tier)}`}>
                              <span className="flex items-center gap-1">
                                {getTierIcon(member.tier)}
                                {getTierName(member.tier)}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{member.phone}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {member.points.toLocaleString()} แต้ม
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredMembers.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'ไม่พบสมาชิกที่ค้นหา' : 'ไม่มีข้อมูลสมาชิก'}
                  </div>
                )}
              </div>

              {/* Favorite Members Section */}
              {hasFavorites && (
                <div className="overflow-y-auto space-y-2 pl-2 border-l">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    รายการโปรด
                  </h3>
                  {favoriteMembers.map((member) => (
                    <Card key={member.id} className="cursor-pointer hover:bg-yellow-50 transition-colors border-yellow-200">
                      <CardContent className="p-3" onClick={() => handleSelectMember(member)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{member.name}</h3>
                              <Badge className={`text-xs ${getTierBadgeColor(member.tier)}`}>
                                <span className="flex items-center gap-1">
                                  {getTierIcon(member.tier)}
                                  {getTierName(member.tier)}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">{member.phone}</p>
                            <p className="text-xs text-muted-foreground font-medium">
                              {member.points.toLocaleString()} แต้ม
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <Button variant="outline" onClick={onClose} className="w-full">
            ยกเลิก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberSearchModal;
