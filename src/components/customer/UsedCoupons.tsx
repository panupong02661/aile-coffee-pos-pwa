
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UsedCoupon {
  id: string;
  gift_type: string;
  gift_name: string;
  gift_description?: string;
  gift_value: number;
  gift_code?: string;
  message?: string;
  used_at: string;
  created_at: string;
}

const UsedCoupons = () => {
  const [usedCoupons, setUsedCoupons] = useState<UsedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsedCoupons = async () => {
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
        .not('used_at', 'is', null) // Only used coupons
        .order('used_at', { ascending: false });

      if (error) {
        console.error('Error fetching used coupons:', error);
        return;
      }

      setUsedCoupons(data || []);
    } catch (error) {
      console.error('Error fetching used coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsedCoupons();
  }, []);

  const formatUsedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (usedCoupons.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีคูปองที่ใช้แล้ว</h3>
        <p className="text-gray-500">คูปองที่ใช้แล้วจะแสดงที่นี่</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="h-6 w-6 text-gray-500" />
        <h2 className="text-xl font-bold text-gray-800">คูปองที่ใช้แล้ว</h2>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
          {usedCoupons.length} ใบ
        </span>
      </div>

      <div className="grid gap-4">
        {usedCoupons.map(coupon => (
          <div 
            key={coupon.id} 
            className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-gray-200">
                    <CheckCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">
                      {coupon.gift_name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {coupon.gift_description || coupon.message}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-400">
                    {coupon.gift_type === 'menu_item' 
                      ? 'ฟรี!'
                      : coupon.gift_type === 'voucher'
                      ? `฿${coupon.gift_value}`
                      : `${coupon.gift_value}%`
                    }
                  </div>
                  <div className="text-xs text-gray-400">
                    {coupon.gift_type === 'menu_item' ? 'เมนูฟรี' : 'ส่วนลด'}
                  </div>
                </div>
              </div>

              {coupon.gift_code && (
                <div className="mb-3 p-2 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">โค้ดที่ใช้:</span>
                    <span className="font-mono font-bold text-gray-500">
                      {coupon.gift_code}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>ใช้เมื่อ: {formatUsedDate(coupon.used_at)}</span>
                </div>

                <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  ใช้แล้ว
                </span>
              </div>

              {coupon.message && (
                <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-600">
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

export default UsedCoupons;
