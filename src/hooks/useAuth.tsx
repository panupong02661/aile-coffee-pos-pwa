
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define types explicitly to avoid circular references
type UserRole = 'admin' | 'manager' | 'staff';

interface AppUser {
  id: string;
  username: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    // Simple console log for now to avoid toast dependency issues
    console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll use a simple authentication
      // In production, you'd want to hash passwords properly
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, password_hash')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        showToast('ข้อผิดพลาด', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'destructive');
        return false;
      }

      // Simple password check (in production, use proper password hashing)
      if (password !== 'admin') {
        showToast('ข้อผิดพลาด', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'destructive');
        return false;
      }

      const userData: AppUser = {
        id: data.id,
        username: data.username,
        full_name: getLevelDisplayName(data.role as UserRole),
        role: data.role as UserRole,
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      showToast('สำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      showToast('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'destructive');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    showToast('สำเร็จ', 'ออกจากระบบเรียบร้อยแล้ว');
  };

  const getLevelDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'manager': return 'ผู้จัดการ';
      case 'staff': return 'พนักงาน';
      default: return 'ผู้ใช้งาน';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
