
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoginFormProps {
  isRegistering: boolean;
  setIsRegistering: (value: boolean) => void;
  loginForm: { phone: string; birth_date: string };
  setLoginForm: (form: { phone: string; birth_date: string }) => void;
  registerForm: { name: string; phone: string; birth_date: string; gender: string };
  setRegisterForm: (form: { name: string; phone: string; birth_date: string; gender: string }) => void;
  isLoading: boolean;
  onLogin: () => void;
  onRegister: () => void;
}

const LoginForm = ({
  isRegistering,
  setIsRegistering,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  isLoading,
  onLogin,
  onRegister
}: LoginFormProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">แอปสั่งอาหาร</h1>
          <p className="text-gray-600">ยินดีต้อนรับสู่แอปสั่งอาหารออนไลน์</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isRegistering ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRegistering ? (
              <>
                <div>
                  <Label htmlFor="register-name">ชื่อ *</Label>
                  <Input
                    id="register-name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div>
                  <Label htmlFor="register-phone">เบอร์โทร *</Label>
                  <Input
                    id="register-phone"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                    placeholder="08xxxxxxxx"
                  />
                </div>
                <div>
                  <Label htmlFor="register-birth">วันเดือนปีเกิด * (รูปแบบไทย พ.ศ.)</Label>
                  <Input
                    id="register-birth"
                    value={registerForm.birth_date}
                    onChange={(e) => setRegisterForm({...registerForm, birth_date: e.target.value})}
                    placeholder="22/10/2535"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    กรอกรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535) รูปแบบไทย พ.ศ.
                  </p>
                </div>
                <div>
                  <Label htmlFor="register-gender">เพศ</Label>
                  <Select value={registerForm.gender} onValueChange={(value) => setRegisterForm({...registerForm, gender: value})}>
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
                <Button onClick={onRegister} className="w-full" disabled={isLoading}>
                  {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRegistering(false)} 
                  className="w-full"
                  disabled={isLoading}
                >
                  มีบัญชีแล้ว? เข้าสู่ระบบ
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="login-phone">เบอร์โทร</Label>
                  <Input
                    id="login-phone"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                    placeholder="08xxxxxxxx"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-birth">วันเดือนปีเกิด (รูปแบบไทย พ.ศ.)</Label>
                  <Input
                    id="login-birth"
                    value={loginForm.birth_date}
                    onChange={(e) => setLoginForm({...loginForm, birth_date: e.target.value})}
                    placeholder="22/10/2535"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    กรอกรูปแบบ วว/ดด/ปปปป (เช่น 22/10/2535) รูปแบบไทย พ.ศ.
                  </p>
                </div>
                
                <Button 
                  onClick={onLogin} 
                  className="w-full"
                  disabled={!loginForm.phone || !loginForm.birth_date || isLoading}
                >
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRegistering(true)} 
                  className="w-full"
                  disabled={isLoading}
                >
                  ยังไม่มีบัญชี? สมัครสมาชิก
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>เข้าสู่ระบบด้วยเบอร์โทรและวันเดือนปีเกิด</p>
          <p className="text-xs mt-1">รูปแบบไทย พ.ศ. เช่น 22/10/2535</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
