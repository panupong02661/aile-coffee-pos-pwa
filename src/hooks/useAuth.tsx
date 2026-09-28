
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

export interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
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

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      let data: unknown;
      let error: { message?: string; status?: number; context?: Response } | null;

      try {
        const invokeRequest = supabase.functions.invoke('staff-auth', {
          body: { action: 'login', username: username.trim(), password },
        });
        const timeoutRequest = new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('login_timeout')), { once: true });
        });
        const response = await Promise.race([invokeRequest, timeoutRequest]);
        data = response.data;
        error = response.error;
      } finally {
        window.clearTimeout(timeout);
      }

      if (error) {
        console.error('Auth RPC error:', error);
        let serverMessage = '';
        try {
          const body = await error.context?.clone().json() as { message?: string } | undefined;
          serverMessage = body?.message ?? '';
        } catch {
          // The response may not contain JSON when the device is offline.
        }
        if (serverMessage === 'Invalid credentials') {
          return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
        }
        if (serverMessage === 'Account temporarily locked') {
          return { success: false, message: 'บัญชีถูกล็อกชั่วคราว กรุณารอ 15 นาทีแล้วลองใหม่' };
        }

        const raw = `${error.message ?? ''} ${error.status ?? ''}`.toLowerCase();
        const unavailable = raw.includes('404')
          || raw.includes('pgrst202')
          || raw.includes('not found')
          || raw.includes('permission denied');
        if (unavailable) {
          return {
            success: false,
            message: 'แอปเชื่อมต่อระบบล็อกอินไม่ได้ กรุณาอัปเดตแอปหรือเปิดผ่านเบราว์เซอร์ชั่วคราว',
          };
        }
        return { success: false, message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง' };
      }

      const result = data as { success?: boolean; session?: { access_token: string; refresh_token: string }; message?: string };
      if (!result?.success || !result.session) {
        const message = result?.message === 'Account temporarily locked'
          ? 'บัญชีถูกล็อกชั่วคราว กรุณารอ 15 นาทีแล้วลองใหม่'
          : 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        return { success: false, message };
      }
      const { error: sessionError } = await supabase.auth.setSession(result.session);
      if (sessionError) throw sessionError;
      showToast('สำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' };
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
