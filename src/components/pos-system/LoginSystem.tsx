import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';

interface LoginSystemProps {
  onLogin: (user: { id: string; role: string; name: string }) => void;
}

export const LoginSystem: React.FC<LoginSystemProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = () => {
    // User login simulation
    onLogin({
      id: '1',
      role: 'admin',
      name: 'ผู้ดูแลระบบ'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">POS System</CardTitle>
          <p className="text-muted-foreground">เข้าสู่ระบบจุดขาย</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                className="pl-10"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                className="pl-10"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full">
            เข้าสู่ระบบ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};