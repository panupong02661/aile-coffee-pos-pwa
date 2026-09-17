
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Simple types to avoid conflicts
type UserRole = 'admin' | 'manager' | 'staff';

// Renamed to avoid any conflicts with built-in types
interface AuthUser {
  id: string;
  username: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) { setUser(null); setLoading(false); }
        return;
      }
      const { data } = await supabase.from('users').select('id, username, full_name, role').eq('auth_user_id', session.user.id).maybeSingle();
      if (!active) return;
      if (data) {
        const profile = data as AuthUser;
        setUser(profile);
        localStorage.setItem('currentUser', JSON.stringify(profile));
      } else {
        setUser(null);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    };
    void loadProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void loadProfile(); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    // Simple console log for now to avoid toast dependency issues
    console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('staff-auth', {
        body: { action: 'login', username, password },
      });

      if (error) {
        console.error('Auth RPC error:', error);
        showToast('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'destructive');
        return false;
      }

      const result = data as { success?: boolean; session?: { access_token: string; refresh_token: string }; message?: string };
      if (!result?.success || !result.session) {
        showToast('ข้อผิดพลาด', result?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'destructive');
        return false;
      }
      const { error: sessionError } = await supabase.auth.setSession(result.session);
      if (sessionError) throw sessionError;
      showToast('สำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      showToast('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'destructive');
      return false;
    }
  };

  const logout = () => {
    void supabase.auth.signOut();
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
