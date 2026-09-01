
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Coffee, User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
      // No navigate needed - ProtectedRoute will automatically show children when user state updates
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
    
    setLoading(false);
  };

  const bgPattern = "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0Z' fill='%23f5f5f0' opacity='0.1'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-cream-50 to-muted/40 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-repeat opacity-20"
        style={{ backgroundImage: `url("${bgPattern}")` }}
      ></div>
      
      <Card className="w-full max-w-md shadow-2xl border-border bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            POS System
          </CardTitle>
          <p className="text-muted-foreground mt-2">เข้าสู่ระบบจุดขาย</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
                ชื่อผู้ใช้งาน
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 border-border focus:border-primary focus:ring-coffee-200"
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                รหัสผ่าน
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-border focus:border-primary focus:ring-coffee-200"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">ระดับผู้ใช้งาน:</p>
            <div className="space-y-1">
              <p><span className="font-medium text-foreground">Admin:</span> ผู้ดูแลระบบ</p>
              <p><span className="font-medium text-foreground">Manager:</span> ผู้จัดการ</p>
              <p><span className="font-medium text-foreground">Staff:</span> พนักงาน</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
