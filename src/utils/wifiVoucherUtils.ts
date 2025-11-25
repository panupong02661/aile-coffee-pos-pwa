import { supabase } from '@/integrations/supabase/client';

export interface WiFiVoucher {
  id: string;
  username: string;
  password: string;
  qr_code_url: string | null;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  duration_hours: number;
}

export interface PriceTier {
  id: string;
  min_amount: number;
  max_amount: number;
  duration_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * ดึง WiFi Voucher ตามยอดเงินที่ลูกค้าซื้อ
 * @param amount ยอดเงินที่ลูกค้าซื้อ
 * @returns WiFiVoucher object หรือ null ถ้าไม่พบ
 */
export const getWiFiVoucherByAmount = async (amount: number): Promise<WiFiVoucher | null> => {
  try {
    // ดึงข้อมูลช่วงราคาทั้งหมดที่ active
    const { data: tiers, error: tiersError } = await supabase
      .from('wifi_price_tiers')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (tiersError) {
      console.error('Error fetching price tiers:', tiersError);
      return null;
    }

    if (!tiers || tiers.length === 0) {
      console.log('No active price tiers found');
      return null;
    }

    // หาช่วงราคาที่เหมาะสม
    const matchingTier = tiers.find(
      tier => amount >= tier.min_amount && amount <= tier.max_amount
    );

    if (!matchingTier) {
      console.log('No matching price tier found for amount:', amount);
      return null;
    }

    console.log('Found matching tier:', matchingTier);

    // หา voucher ที่ยังไม่ได้ใช้และมีระยะเวลาตรงกับช่วงราคา
    const { data: vouchers, error: vouchersError } = await supabase
      .from('wifi_vouchers')
      .select('*')
      .eq('is_used', false)
      .eq('duration_hours', matchingTier.duration_hours)
      .limit(1);

    if (vouchersError) {
      console.error('Error fetching vouchers:', vouchersError);
      return null;
    }

    if (!vouchers || vouchers.length === 0) {
      console.log('No available voucher found for duration:', matchingTier.duration_hours);
      return null;
    }

    const voucher = vouchers[0];

    // อัพเดทสถานะ voucher เป็นใช้แล้ว
    const { error: updateError } = await supabase
      .from('wifi_vouchers')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', voucher.id);

    if (updateError) {
      console.error('Error updating voucher status:', updateError);
      return null;
    }

    console.log('Successfully allocated voucher:', voucher);
    return voucher;
  } catch (error) {
    console.error('Error in getWiFiVoucherByAmount:', error);
    return null;
  }
};

/**
 * ตรวจสอบว่ามีการตั้งค่าช่วงราคาหรือไม่
 * @returns true ถ้ามีการตั้งค่า, false ถ้าไม่มี
 */
export const hasPriceTiersConfigured = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('wifi_price_tiers')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error checking price tiers:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in hasPriceTiersConfigured:', error);
    return false;
  }
};

/**
 * ดึงข้อมูลช่วงราคาทั้งหมดที่ active
 * @returns Array of PriceTier objects
 */
export const getActivePriceTiers = async (): Promise<PriceTier[]> => {
  try {
    const { data, error } = await supabase
      .from('wifi_price_tiers')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (error) {
      console.error('Error fetching price tiers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActivePriceTiers:', error);
    return [];
  }
};
