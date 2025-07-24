
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLogSecurityEvent } from './useSecurityLogs';

interface User {
  id: string;
  username: string;
  role: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  role?: string;
}

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const logSecurityEvent = useLogSecurityEvent();

  // Check for existing session on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check if we have a stored user session
      const storedUser = localStorage.getItem('pos_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Verify the session is still valid by making a test query
        const { error } = await supabase.from('users').select('id').limit(1);
        if (!error) {
          setUser(userData);
        } else {
          localStorage.removeItem('pos_user');
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('pos_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Input validation
      if (!username.trim() || !password.trim()) {
        toast({
          title: 'ข้อผิดพลาด',
          description: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
          variant: 'destructive'
        });
        return false;
      }

      // Use the secure authentication function
      const { data, error } = await supabase.rpc('authenticate_user', {
        username_input: username,
        password_input: password
      });

      if (error) {
        console.error('Authentication error:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
          variant: 'destructive'
        });
        return false;
      }

      // Type assertion for the response data
      const authResponse = data as AuthResponse;

      if (!authResponse.success) {
        toast({
          title: 'การเข้าสู่ระบบล้มเหลว',
          description: authResponse.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          variant: 'destructive'
        });

        // Log failed login attempt
        logSecurityEvent.mutate({
          event_type: 'login_failed',
          details: {
            username: username,
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent
          }
        });

        return false;
      }

      // Successful login
      const userData: User = {
        id: authResponse.user_id!,
        username: username,
        role: authResponse.role!
      };

      setUser(userData);
      localStorage.setItem('pos_user', JSON.stringify(userData));

      // Log successful login
      logSecurityEvent.mutate({
        event_type: 'login_success',
        user_id: authResponse.user_id!,
        details: {
          username: username,
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        }
      });

      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: `ยินดีต้อนรับ ${username}`
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Log logout event
      if (user) {
        logSecurityEvent.mutate({
          event_type: 'logout',
          user_id: user.id,
          details: {
            username: user.username,
            ip_address: await getClientIP()
          }
        });
      }

      setUser(null);
      localStorage.removeItem('pos_user');
      
      toast({
        title: 'ออกจากระบบสำเร็จ',
        description: 'ขอบคุณที่ใช้บริการ'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
