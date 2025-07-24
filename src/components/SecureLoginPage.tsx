
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, Shield, Eye, EyeOff } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { SecureInput } from './SecureInput';
import { validatePassword } from '@/utils/inputValidation';

const SecureLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, loading } = useSecureAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    const success = await login(username, password);
    if (success) {
      // Check if this is the default admin account
      if (username === 'admin' && password === 'admin') {
        setIsChangingPassword(true);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    // Here you would call a function to update the password
    // For now, we'll just redirect to the main app
    setIsChangingPassword(false);
  };

  const passwordValidation = validatePassword(newPassword);

  if (isChangingPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-cream-50 to-coffee-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-coffee-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-coffee-800">
              เปลี่ยนรหัสผ่าน
            </CardTitle>
            <p className="text-coffee-600 mt-2">กรุณาเปลี่ยนรหัสผ่านเริ่มต้นเพื่อความปลอดภัย</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <SecureInput
                id="new-password"
                label="รหัสผ่านใหม่"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                validationType="general"
                required
                placeholder="กรอกรหัสผ่านใหม่"
              />
              
              {newPassword && (
                <div className="text-sm">
                  <p className={`${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    ความแข็งแกรง: {passwordValidation.strength === 'strong' ? 'แข็งแกรง' : passwordValidation.strength === 'medium' ? 'ปานกลาง' : 'อ่อนแอ'}
                  </p>
                  {!passwordValidation.isValid && (
                    <p className="text-red-600">{passwordValidation.error}</p>
                  )}
                </div>
              )}

              <SecureInput
                id="confirm-password"
                label="ยืนยันรหัสผ่าน"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                validationType="general"
                required
                placeholder="ยืนยันรหัสผ่านใหม่"
              />

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600">รหัสผ่านไม่ตรงกัน</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-coffee-600 hover:bg-coffee-700 text-white font-medium shadow-lg"
                disabled={!passwordValidation.isValid || newPassword !== confirmPassword}
              >
                เปลี่ยนรหัสผ่าน
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-cream-50 to-coffee-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-coffee-200 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-coffee-600 rounded-full flex items-center justify-center shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-coffee-800">
            Aile Coffee POS
          </CardTitle>
          <p className="text-coffee-600 mt-2">เข้าสู่ระบบจุดขาย (ปลอดภัย)</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">ระบบรักษาความปลอดภัยใหม่</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <SecureInput
              id="username"
              label="ชื่อผู้ใช้งาน"
              type="text"
              value={username}
              onChange={setUsername}
              validationType="username"
              required
              placeholder="กรอกชื่อผู้ใช้งาน"
            />

            <div className="space-y-2">
              <SecureInput
                id="password"
                label="รหัสผ่าน"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                validationType="general"
                required
                placeholder="กรอกรหัสผ่าน"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-2 text-sm text-coffee-600 hover:text-coffee-800"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-coffee-600 hover:bg-coffee-700 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-coffee-500">
            <div className="bg-coffee-50 p-3 rounded-lg border border-coffee-200">
              <p className="font-medium text-coffee-700 mb-2">ฟีเจอร์ความปลอดภัยใหม่:</p>
              <ul className="text-xs space-y-1">
                <li>• การตรวจสอบข้อมูลขั้นสูง</li>
                <li>• การเข้ารหัสรหัสผ่าน</li>
                <li>• การป้องกันการโจมตี</li>
                <li>• บันทึกการเข้าใช้งาน</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureLoginPage;
