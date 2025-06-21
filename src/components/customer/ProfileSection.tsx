
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { formatDateToThai, formatDateForDisplay, parseThaiDateInput } from '@/utils/dateUtils';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  tier: string;
  points: number;
  total_spent: number;
}

interface ProfileSectionProps {
  currentUser: CustomerProfile | null;
  setCurrentUser: (user: CustomerProfile | null) => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onUpdateProfile: () => void;
}

const ProfileSection = ({
  currentUser,
  setCurrentUser,
  editMode,
  setEditMode,
  onUpdateProfile
}: ProfileSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          ข้อมูลส่วนตัว
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => editMode ? onUpdateProfile() : setEditMode(true)}
        >
          {editMode ? 'บันทึก' : 'แก้ไข'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>ชื่อ</Label>
          <Input
            value={currentUser?.name || ''}
            onChange={(e) => setCurrentUser(prev => prev ? {...prev, name: e.target.value} : null)}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label>เบอร์โทร</Label>
          <Input
            value={currentUser?.phone || ''}
            onChange={(e) => setCurrentUser(prev => prev ? {...prev, phone: e.target.value} : null)}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label>วันเดือนปีเกิด</Label>
          {editMode ? (
            <Input
              value={currentUser?.birth_date ? formatDateForDisplay(currentUser.birth_date) : ''}
              onChange={(e) => {
                const convertedDate = parseThaiDateInput(e.target.value);
                setCurrentUser(prev => prev ? {...prev, birth_date: convertedDate} : null);
              }}
              placeholder="22/10/2535"
            />
          ) : (
            <Input
              value={currentUser?.birth_date ? formatDateToThai(currentUser.birth_date) : ''}
              disabled={true}
            />
          )}
        </div>
        <div>
          <Label>เพศ</Label>
          <Select 
            value={currentUser?.gender || ''} 
            onValueChange={(value) => setCurrentUser(prev => prev ? {...prev, gender: value} : null)}
            disabled={!editMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกเพศ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ชาย</SelectItem>
              <SelectItem value="female">หญิง</SelectItem>
              <SelectItem value="other">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
