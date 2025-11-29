import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Calendar, Award, Star, Crown, TrendingUp } from 'lucide-react';

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            ข้อมูลลูกค้า
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tier Card */}
          <Card className={`border-2 ${getTierColor(member.tier)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTierIcon(member.tier)}
                  <div>
                    <p className="text-sm text-muted-foreground">ระดับสมาชิก</p>
                    <p className="text-xl font-bold">{getTierName(member.tier)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">แต้มสะสม</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {member.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg mb-3">ข้อมูลส่วนตัว</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ชื่อ</p>
                  <p className="font-medium">{member.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">เบอร์โทร</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {member.phone}
                  </p>
                </div>

                {member.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">อีเมล</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">เพศ</p>
                  <p className="font-medium">{formatGender(member.gender)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">วันเกิด</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(member.birth_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">วันที่สมัคร</p>
                  <p className="font-medium">{formatDate(member.join_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                สถิติการซื้อ
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">ยอดซื้อสะสม</p>
                  <p className="text-2xl font-bold text-green-700">
                    ฿{member.total_spent.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-600">แต้มคงเหลือ</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {member.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
