
import { useState, useEffect } from 'react';
import QRMemberRegistration from '@/components/QRMemberRegistration';
import { supabase } from '@/integrations/supabase/client';

const MemberRegistration = () => {
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlShopId = urlParams.get('shop_id');
      
      let query = supabase
        .from('shop_settings')
        .select('shop_name')
        .limit(1);
      
      if (urlShopId) {
        query = query.eq('shop_id', urlShopId);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching shop settings:', error);
        return;
      }

      if (data?.shop_name) {
        setShopName(data.shop_name);
      }
    } catch (error) {
      console.error('Error fetching shop settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">{shopName}</h1>
          <p className="text-coffee-600">สมัครสมาชิกเพื่อรับสิทธิประโยชน์พิเศษ</p>
        </div>
        <QRMemberRegistration />
      </div>
    </div>
  );
};

export default MemberRegistration;
