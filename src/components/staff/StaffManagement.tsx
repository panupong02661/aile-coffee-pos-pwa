
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, User, Clock, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StaffList from '@/components/staff/StaffList';
import TimeAttendance from '@/components/staff/TimeAttendance';
import PermissionManagement from '@/components/staff/PermissionManagement';

interface Staff {
  id: string;
  name: string;
  phone: string;
  email?: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('staff-list');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staff-list" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            รายชื่อพนักงาน
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            เวลาทำงาน
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            สิทธิ์การเข้าถึง
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff-list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                จัดการข้อมูลพนักงาน
              </CardTitle>
              <CardDescription>จัดการข้อมูลส่วนตัวและการทำงานของพนักงาน</CardDescription>
            </CardHeader>
            <CardContent>
              <StaffList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                บันทึกเวลาทำงาน
              </CardTitle>
              <CardDescription>จัดการการลงเวลาและการคำนวณชั่วโมงทำงาน</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeAttendance />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManagement;
