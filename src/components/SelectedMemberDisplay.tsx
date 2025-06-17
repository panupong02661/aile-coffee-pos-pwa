
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Star, Award, X } from 'lucide-react';

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

  return (
    <Card className="mb-4 border-coffee-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-coffee-800">{member.name}</h3>
              <Badge className={getTierBadgeColor(member.tier)}>
                <span className="flex items-center gap-1">
                  {getTierIcon(member.tier)}
                  {getTierName(member.tier)}
                </span>
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{member.phone}</p>
            <p className="text-sm text-coffee-600 font-medium">
              {member.points.toLocaleString()} แต้ม
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-gray-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedMemberDisplay;
