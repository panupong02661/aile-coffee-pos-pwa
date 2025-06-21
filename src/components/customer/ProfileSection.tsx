
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
            onChange={(e) => {
              if (currentUser) {
                setCurrentUser({...currentUser, name: e.target.value});
              }
            }}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label>เบอร์โทร</Label>
          <Input
            value={currentUser?.phone || ''}
            onChange={(e) => {
              if (currentUser) {
                setCurrentUser({...currentUser, phone: e.target.value});
              }
            }}
            disabled={!editMode}
          />
        </div>
        <div>
          <Label>วันเดือนปีเกิด</Label>
          {editMode ? (
            <Input
              value={currentUser?.birth_date ? formatDateForDisplay(currentUser.birth_date) : ''}
              onChange={(e) => {
                if (currentUser) {
                  const convertedDate = parseThaiDateInput(e.target.value);
                  setCurrentUser({...currentUser, birth_date: convertedDate});
                }
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
            onValueChange={(value) => {
              if (currentUser) {
                setCurrentUser({...currentUser, gender: value});
              }
            }}
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
