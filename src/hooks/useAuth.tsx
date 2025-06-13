
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'staff';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, we'll use a simple authentication
      // In production, you'd want to hash passwords properly
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, password_hash')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 
          variant: 'destructive' 
        });
        return false;
      }

      // Simple password check (in production, use proper password hashing)
      if (password !== 'admin') {
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 
          variant: 'destructive' 
        });
        return false;
      }

      const userData: User = {
        id: data.id,
        username: data.username,
        full_name: getLevelDisplayName(data.role),
        role: data.role,
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      toast({ 
        title: 'สำเร็จ', 
        description: 'เข้าสู่ระบบเรียบร้อยแล้ว' 
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 
        variant: 'destructive' 
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({ 
      title: 'สำเร็จ', 
      description: 'ออกจากระบบเรียบร้อยแล้ว' 
    });
  };

  const getLevelDisplayName = (role: string) => {
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
