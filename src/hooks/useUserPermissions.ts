
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserPermissionMap {
  [key: string]: boolean;
}

// Map routes to permission keys
const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/': 'pos',
  '/pos': 'pos',
  '/dashboard': 'dashboard',
  '/menu': 'menu',
  '/members': 'members',
  '/member-registration': 'members',
  '/reports': 'reports',
  '/shop-settings': 'shop-settings',
  '/business-settings': 'business-settings',
  '/promotions': 'promotions',
  '/menu-promotions': 'menu-promotions',
  '/customer-mobile-app': 'customer-mobile-app',
  '/customer-app-management': 'customer-app-management',
  '/qr-promptpay': 'qr-promptpay',
  '/inventory': 'inventory',
  '/printer-settings': 'printer-settings',
  '/online-orders': 'online-orders',
  '/security-recommendations': 'security-recommendations',
  '/delivery-integration': 'delivery-integration',
  '/notifications': 'notifications',
  '/line-messaging': 'line-messaging',
  '/cost-analysis': 'cost-analysis',
  '/coupon-management': 'coupon-management',
  '/review-management': 'review-management',
  '/delivery-management': 'delivery-management',
  '/app-build-guide': 'app-build-guide',
  '/wifi-vouchers': 'wifi-vouchers',
  '/customer-display': 'customer-display',
  '/kitchen-display': 'kitchen-display',
  '/security-dashboard': 'security-dashboard',
  '/analytics-dashboard': 'analytics-dashboard',
  '/financial-dashboard': 'financial-dashboard',
  '/advanced-reports': 'advanced-reports',
  '/sales-reports': 'sales-reports',
  '/product-reports': 'product-reports',
  '/customer-analytics': 'customer-analytics',
  '/staff': 'staff',
  '/time-attendance': 'time-attendance',
  '/permissions': 'permissions',
  '/branch-management': 'branch-management',
  '/accounting': 'accounting',
  '/income-expense': 'income-expense',
  '/profit-loss': 'profit-loss',
  '/tax-system': 'tax-system',
  '/vat-calculation': 'vat-calculation',
  '/tax-invoice': 'tax-invoice',
  '/credit-system': 'credit-system',
  '/crm': 'crm',
  '/customer-data': 'customer-data',
  '/purchase-history': 'purchase-history',
  '/marketing': 'marketing',
  '/sms-marketing': 'sms-marketing',
  '/email-marketing': 'email-marketing',
  '/table-reservation': 'table-reservation',
  '/digital-payment': 'digital-payment',
  '/credit-card': 'credit-card',
  '/api-system': 'api-system',
  '/external-integration': 'external-integration',
  '/staff-mobile-app': 'staff-mobile-app',
  '/engagement': 'promotions',
};

export const useUserPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissionMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions({});
      setLoading(false);
      return;
    }

    // Admin has all permissions
    if (user.role === 'admin') {
      setPermissions({});
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('user_permissions')
          .select('permission_key, is_granted')
          .eq('user_id', user.id)
          .eq('is_granted', true);

        if (error) throw error;

        const permMap: UserPermissionMap = {};
        data?.forEach((p: any) => {
          permMap[p.permission_key] = true;
        });
        setPermissions(permMap);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions[permissionKey] === true;
  };

  const hasRouteAccess = (path: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const permKey = ROUTE_PERMISSION_MAP[path];
    if (!permKey) return true; // Unknown routes are allowed
    return permissions[permKey] === true;
  };

  return { permissions, loading, hasPermission, hasRouteAccess };
};
