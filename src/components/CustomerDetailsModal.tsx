import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Calendar, Award, Star, Crown, TrendingUp, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
  birth_date?: string;
  gender?: string;
  join_date?: string;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

const CustomerDetailsModal = ({ isOpen, onClose, member }: CustomerDetailsModalProps) => {
  const [topItems, setTopItems] = useState<Array<{ name: string; count: number; total: number }>>([]);
  const [loadingTopItems, setLoadingTopItems] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      fetchTopItems();
    }
  }, [isOpen, member]);

  const fetchTopItems = async () => {
    if (!member) return;
    
    setLoadingTopItems(true);
    try {
      // Fetch all order IDs for this member first
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('member_id', member.id);

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setTopItems([]);
        setLoadingTopItems(false);
        return;
      }

      const orderIds = orders.map(o => o.id);

      // Fetch order_items for these orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('menu_item_name, quantity, total_price')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      // Count items
      const itemCounts: Record<string, { count: number; total: number }> = {};
      
      orderItems?.forEach((item: any) => {
        const name = item.menu_item_name;
        if (name) {
          if (!itemCounts[name]) {
            itemCounts[name] = { count: 0, total: 0 };
          }
          itemCounts[name].count += item.quantity || 1;
          itemCounts[name].total += (item.total_price || 0);
        }
      });

      // Sort by count and take top 5
      const sorted = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopItems(sorted);
    } catch (error) {
      console.error('Error fetching top items:', error);
      setTopItems([]);
    } finally {
      setLoadingTopItems(false);
    }
  };

  if (!member) return null;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-5 h-5" />;
      case 'gold': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'แพลตตินัม';
      case 'gold': return 'ทอง';
      default: return 'เงิน';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'male': return 'ชาย';
      case 'female': return 'หญิง';
      case 'other': return 'อื่นๆ';
      default: return 'ไม่ระบุ';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5" />
            ข้อมูลลูกค้า
          </DialogTitle>
          <DialogDescription className="text-xs">
            ดูรายละเอียดข้อมูลสมาชิกและสถิติการซื้อ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Tier Card */}
          <Card className={`border ${getTierColor(member.tier)}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTierIcon(member.tier)}
                  <div>
                    <p className="text-xs text-muted-foreground">ระดับสมาชิก</p>
                    <p className="text-base font-bold">{getTierName(member.tier)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">แต้มสะสม</p>
                  <p className="text-lg font-bold text-orange-600">
                    {member.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-2">ข้อมูลส่วนตัว</h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">ชื่อ</p>
                  <p className="font-medium">{member.name}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">เบอร์โทร</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {member.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">เพศ</p>
                  <p className="font-medium">{formatGender(member.gender)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">วันเกิด</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(member.birth_date)}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">วันที่สมัคร</p>
                  <p className="font-medium">{formatDate(member.join_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Stats */}
          <Card>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                สถิติการซื้อ
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-xs text-green-600">ยอดซื้อสะสม</p>
                  <p className="text-lg font-bold text-green-700">
                    ฿{member.total_spent.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-2 rounded-lg">
                  <p className="text-xs text-orange-600">แต้มคงเหลือ</p>
                  <p className="text-lg font-bold text-orange-700">
                    {member.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Popular Items */}
          <Card>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                เมนูยอดนิยม (Top 5)
              </h3>
              
              {loadingTopItems ? (
                <div className="text-center py-2 text-muted-foreground text-sm">กำลังโหลด...</div>
              ) : topItems.length > 0 ? (
                <div className="space-y-1.5">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 bg-accent/50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-primary">{item.count} ครั้ง</div>
                        <div className="text-xs text-muted-foreground">฿{item.total.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground text-sm">ยังไม่มีประวัติการสั่งซื้อ</div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
