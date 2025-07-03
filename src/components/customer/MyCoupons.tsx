
import React, { useState, useEffect } from 'react';
import { Ticket, Clock, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerGift {
  id: string;
  gift_type: string;
  gift_name: string;
  gift_description?: string;
  gift_value: number;
  expires_at?: string;
  gift_code?: string;
  message?: string;
  created_at: string;
}

const MyCoupons = () => {
  const [coupons, setCoupons] = useState<CustomerGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMyCoupons = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('customerLoginData') || '{}');
      if (!currentUser.id) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .eq('customer_id', currentUser.id)
        .is('used_at', null) // Only unused coupons
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        return;
      }

      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching my coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCoupons();
  }, []);

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'หมดอายุแล้ว';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `เหลือ ${days} วัน`;
    return `เหลือ ${hours} ชั่วโมง`;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'คัดลอกแล้ว', description: `โค้ด ${code} ถูกคัดลอกแล้ว` });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีคูปอง</h3>
        <p className="text-gray-500">ไปดูโปรโมชั่นพิเศษเพื่อรับคูปองใหม่</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Ticket className="h-6 w-6 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">คูปองของฉัน</h2>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
          {coupons.length} ใบ
        </span>
      </div>

      <div className="grid gap-4">
        {coupons.map(coupon => (
          <div 
            key={coupon.id} 
            className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
              isExpired(coupon.expires_at)
                ? 'border-red-300 bg-red-50'
                : 'border-green-300 bg-green-50'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-full ${
                    isExpired(coupon.expires_at)
                      ? 'bg-red-200'
                      : 'bg-green-200'
                  }`}>
                    <Gift className={`h-5 w-5 ${
                      isExpired(coupon.expires_at)
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isExpired(coupon.expires_at) ? 'text-gray-500' : 'text-gray-800'
                    }`}>
                      {coupon.gift_name}
                    </h3>
                    <p className={`text-sm ${
                      isExpired(coupon.expires_at) ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {coupon.gift_description || coupon.message}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    isExpired(coupon.expires_at) ? 'text-gray-400' : 'text-green-600'
                  }`}>
                    {coupon.gift_type === 'menu_item' 
                      ? 'ฟรี!'
                      : coupon.gift_type === 'voucher'
                      ? `฿${coupon.gift_value}`
                      : `${coupon.gift_value}%`
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {coupon.gift_type === 'menu_item' ? 'เมนูฟรี' : 'ส่วนลด'}
                  </div>
                </div>
              </div>

              {coupon.gift_code && (
                <div className="mb-3 p-2 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">โค้ด:</span>
                    <button
                      onClick={() => copyCode(coupon.gift_code!)}
                      className="font-mono font-bold text-lg bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      {coupon.gift_code}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                {coupon.expires_at && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    isExpired(coupon.expires_at) ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span>{getTimeRemaining(coupon.expires_at)}</span>
                  </div>
                )}

                {isExpired(coupon.expires_at) && (
                  <span className="bg-red-200 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                    หมดอายุ
                  </span>
                )}
              </div>

              {coupon.message && (
                <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                  💌 {coupon.message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCoupons;
