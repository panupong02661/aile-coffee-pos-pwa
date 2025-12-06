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
 * ฟังก์ชันนี้จะ:
 * 1. หาช่วงราคาที่ตรงกับยอดซื้อ
 * 2. หา voucher ที่ยังไม่ได้ใช้และตรงกับระยะเวลาของช่วงราคานั้น
 * 3. อัพเดทสถานะ voucher เป็น "ใช้แล้ว"
 * 4. คืนค่า voucher หรือ null ถ้าไม่พบ
 * 
 * @param amount ยอดเงินที่ลูกค้าซื้อ
 * @returns WiFiVoucher object หรือ null ถ้าไม่พบ
 */
export const getWiFiVoucherByAmount = async (amount: number): Promise<WiFiVoucher | null> => {
  try {
    console.log('🔍 [WiFi Voucher] Looking for voucher for amount:', amount);
    
    // ดึงข้อมูลช่วงราคาทั้งหมดที่ active
    const { data: tiers, error: tiersError } = await supabase
      .from('wifi_price_tiers')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (tiersError) {
      console.error('❌ [WiFi Voucher] Error fetching price tiers:', tiersError);
      return null;
    }

    if (!tiers || tiers.length === 0) {
      console.log('⚠️ [WiFi Voucher] No active price tiers found');
      return null;
    }

    console.log('📋 [WiFi Voucher] Available price tiers:', tiers);

    // หาช่วงราคาที่เหมาะสม - ต้อง >= min_amount และ <= max_amount
    const matchingTier = tiers.find(
      tier => amount >= tier.min_amount && amount <= tier.max_amount
    );

    if (!matchingTier) {
      console.log('⚠️ [WiFi Voucher] No matching price tier found for amount:', amount);
      console.log('📋 [WiFi Voucher] Available tiers ranges:', tiers.map(t => `${t.min_amount}-${t.max_amount} = ${t.duration_hours}hr`));
      return null;
    }

    console.log('✅ [WiFi Voucher] Found matching tier:', {
      min_amount: matchingTier.min_amount,
      max_amount: matchingTier.max_amount,
      duration_hours: matchingTier.duration_hours
    });

    // หา voucher ที่ยังไม่ได้ใช้และมีระยะเวลาตรงกับช่วงราคา
    const { data: vouchers, error: vouchersError } = await supabase
      .from('wifi_vouchers')
      .select('*')
      .eq('is_used', false)
      .eq('duration_hours', matchingTier.duration_hours)
      .order('created_at', { ascending: true })
      .limit(1);

    if (vouchersError) {
      console.error('❌ [WiFi Voucher] Error fetching vouchers:', vouchersError);
      return null;
    }

    if (!vouchers || vouchers.length === 0) {
      console.log('⚠️ [WiFi Voucher] No available voucher found for duration:', matchingTier.duration_hours, 'hours');
      return null;
    }

    const voucher = vouchers[0] as WiFiVoucher;
    console.log('🎫 [WiFi Voucher] Found voucher:', voucher.username, 'duration:', voucher.duration_hours, 'hours');

    // อัพเดทสถานะ voucher เป็นใช้แล้ว
    const { error: updateError } = await supabase
      .from('wifi_vouchers')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', voucher.id)
      .eq('is_used', false); // Double check to prevent race condition

    if (updateError) {
      console.error('❌ [WiFi Voucher] Error updating voucher status:', updateError);
      return null;
    }

    console.log('✅ [WiFi Voucher] Successfully allocated voucher:', voucher.username);
    return voucher;
  } catch (error) {
    console.error('❌ [WiFi Voucher] Error in getWiFiVoucherByAmount:', error);
    return null;
  }
};

/**
 * ดึง WiFi Voucher สำหรับ Preview ตามยอดเงิน (ไม่อัพเดทสถานะ)
 * ใช้สำหรับแสดง preview ในหน้าชำระเงินก่อนกดยืนยัน
 * 
 * @param amount ยอดเงินที่ลูกค้าซื้อ
 * @returns WiFiVoucher object หรือ null ถ้าไม่พบ
 */
export const getWiFiVoucherPreview = async (amount: number): Promise<WiFiVoucher | null> => {
  try {
    console.log('🔍 [WiFi Preview] Looking for voucher preview for amount:', amount, 'at', new Date().toISOString());
    
    // ดึงข้อมูลช่วงราคาทั้งหมดที่ active
    const { data: tiers, error: tiersError } = await supabase
      .from('wifi_price_tiers')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });

    if (tiersError) {
      console.error('❌ [WiFi Preview] Error fetching price tiers:', tiersError);
      return null;
    }

    if (!tiers || tiers.length === 0) {
      console.log('⚠️ [WiFi Preview] No active price tiers found');
      return null;
    }

    // หาช่วงราคาที่เหมาะสม
    const matchingTier = tiers.find(
      tier => amount >= tier.min_amount && amount <= tier.max_amount
    );

    if (!matchingTier) {
      console.log('⚠️ [WiFi Preview] No matching price tier found for amount:', amount);
      return null;
    }

    console.log('✅ [WiFi Preview] Found matching tier:', {
      min_amount: matchingTier.min_amount,
      max_amount: matchingTier.max_amount,
      duration_hours: matchingTier.duration_hours
    });

    // หา voucher ที่ยังไม่ได้ใช้และมีระยะเวลาตรงกับช่วงราคา
    // ใช้ fresh query ทุกครั้งโดยไม่ cache - เช็คว่า is_used = false เท่านั้น
    const { data: vouchers, error: vouchersError } = await supabase
      .from('wifi_vouchers')
      .select('id, username, password, qr_code_url, is_used, duration_hours, created_at')
      .eq('is_used', false)
      .eq('duration_hours', matchingTier.duration_hours)
      .order('created_at', { ascending: true })
      .limit(1);

    if (vouchersError) {
      console.error('❌ [WiFi Preview] Error fetching vouchers:', vouchersError);
      return null;
    }

    console.log('🔍 [WiFi Preview] Query result for duration', matchingTier.duration_hours, 'hrs:', vouchers);

    if (!vouchers || vouchers.length === 0) {
      console.log('⚠️ [WiFi Preview] No available voucher found for duration:', matchingTier.duration_hours, 'hours');
      return null;
    }

    const voucher = vouchers[0] as WiFiVoucher;
    console.log('🎫 [WiFi Preview] Found voucher preview:', voucher.username, 'is_used:', voucher.is_used, 'duration:', voucher.duration_hours, 'hours');

    return voucher;
  } catch (error) {
    console.error('❌ [WiFi Preview] Error in getWiFiVoucherPreview:', error);
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
