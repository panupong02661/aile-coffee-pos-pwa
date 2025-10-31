import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Phone, ShoppingBag, DollarSign, Calendar, Receipt } from 'lucide-react';
import MemberPurchaseHistoryModal from './MemberPurchaseHistoryModal';

interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
  total_spent: number;
  tier: string;
  created_at: string;
}

const CustomerPurchaseHistory = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('total_spent', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลลูกค้าได้",
          variant: "destructive"
        });
        return;
      }

      setMembers(data || []);
      setFilteredMembers(data || []);
    } catch (error) {
      console.error('Error in fetchMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      platinum: { label: 'แพลตตินัม', className: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white' },
      gold: { label: 'โกลด์', className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' },
      silver: { label: 'ซิลเวอร์', className: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' }
    };
    return tierConfig[tier as keyof typeof tierConfig] || tierConfig.silver;
  };

  const handleViewHistory = (member: Member) => {
    setSelectedMember({ id: member.id, name: member.name });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              ประวัติการซื้อของลูกค้า
            </span>
            <Badge variant="secondary">{filteredMembers.length} รายการ</Badge>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลลูกค้า'}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const tierInfo = getTierBadge(member.tier);
                return (
                  <Card 
                    key={member.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
                    onClick={() => handleViewHistory(member)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-base">{member.name}</h4>
                                <Badge className={tierInfo.className}>
                                  {tierInfo.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{member.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-muted-foreground">ยอดซื้อสะสม</p>
                                <p className="font-semibold">฿{member.total_spent.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <ShoppingBag className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-muted-foreground">แต้มสะสม</p>
                                <p className="font-semibold">{member.points.toLocaleString()} แต้ม</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-muted-foreground">สมัครเมื่อ</p>
                                <p className="font-semibold">
                                  {new Date(member.created_at).toLocaleDateString('th-TH', { 
                                    year: '2-digit', 
                                    month: 'short' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className="ml-4">
                          <Receipt className="w-4 h-4 mr-2" />
                          ดูประวัติ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMember && (
        <MemberPurchaseHistoryModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          memberId={selectedMember.id}
          memberName={selectedMember.name}
        />
      )}
    </>
  );
};

export default CustomerPurchaseHistory;
