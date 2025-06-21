
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
      case 'platinum': return <Crown className="w-4 h-4" />;
      case 'gold': return <Award className="w-4 h-4" />;
      case 'silver': return <Star className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`mb-4 border-2 ${getCardBorderColor(member.tier)} shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Member info centered */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-coffee-800">{member.name}</h3>
                <Badge className={`${getTierBadgeColor(member.tier)} shadow-sm`}>
                  <span className="flex items-center gap-1">
                    {getTierIcon(member.tier)}
                    สมาชิก{getTierName(member.tier)}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{member.phone}</p>
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-coffee-600">
                    {member.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">แต้มสะสม</p>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    ฿{member.total_spent.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">ยอดใช้จ่าย</p>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedMemberDisplay;
