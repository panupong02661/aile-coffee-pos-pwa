
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Star, Award, X, Crown } from 'lucide-react';

interface Member {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tier: 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
}

interface SelectedMemberDisplayProps {
  member: Member;
  onRemove: () => void;
}

const SelectedMemberDisplay = ({ member, onRemove }: SelectedMemberDisplayProps) => {
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white border-purple-300';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-300';
    }
  };

  const getCardBorderColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100';
      case 'gold': return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'silver': return 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100';
      default: return 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100';
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
    <Card className={`border ${getCardBorderColor(member.tier)} shadow-sm relative overflow-hidden`}>
      <CardContent className="p-2">
        <div className="flex items-center justify-between gap-2">
          {/* ชื่อและเบอร์โทร */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-foreground truncate">{member.name}</h3>
            <span className="text-xs text-gray-500 flex-shrink-0">({member.phone})</span>
          </div>
          
          {/* Tier Badge */}
          <Badge className={`${getTierBadgeColor(member.tier)} text-[10px] px-1.5 py-0 flex-shrink-0`}>
            <span className="flex items-center gap-0.5">
              {getTierIcon(member.tier)}
              {getTierName(member.tier)}
            </span>
          </Badge>
          
          {/* แต้มและยอดใช้จ่าย */}
          <div className="flex items-center gap-2 text-[10px] flex-shrink-0">
            <span className="font-bold text-muted-foreground">{member.points.toLocaleString()} แต้ม</span>
            <span className="text-gray-400">|</span>
            <span className="font-bold text-green-600">฿{member.total_spent.toLocaleString()}</span>
          </div>
          
          {/* ปุ่มลบ */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-5 h-5 p-0 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedMemberDisplay;
