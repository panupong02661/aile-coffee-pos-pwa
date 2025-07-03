
import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BirthdayMember {
  id: string;
  name: string;
  phone: string;
  birth_date: string;
}

interface GiftTemplate {
  id: string;
  name: string;
  description: string;
  gift_type: 'menu_item' | 'discount' | 'voucher';
  gift_value: number;
}

const BirthdayGiftManager = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [birthdayMembers, setBirthdayMembers] = useState<BirthdayMember[]>([]);
  const [giftTemplates, setGiftTemplates] = useState<GiftTemplate[]>([]);
  const [selectedGift, setSelectedGift] = useState('');
  const [customMessage, setCustomMessage] = useState('สุขสันต์วันเกิด! รับของขวัญพิเศษจากทางร้าน');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Fetch members with birthdays in selected month
  const fetchBirthdayMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, phone, birth_date')
        .not('birth_date', 'is', null);

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      // Filter members with birthdays in selected month
      const filteredMembers = (data || []).filter(member => {
        if (!member.birth_date) return false;
        const birthMonth = new Date(member.birth_date).getMonth() + 1;
        return birthMonth === selectedMonth;
      });

      setBirthdayMembers(filteredMembers);
    } catch (error) {
      console.error('Error fetching birthday members:', error);
    }
  };

  // Fetch available gift templates (menu items and rewards)
  const fetchGiftTemplates = async () => {
    try {
      // Get menu items
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, description, price')
        .eq('is_available', true)
        .limit(10);

      if (menuError) {
        console.error('Error fetching menu items:', menuError);
        return;
      }

      // Get rewards
      const { data: rewards, error: rewardsError } = await supabase
        .from('rewards')
        .select('id, name, description, points_required')
        .eq('is_active', true)
        .limit(10);

      if (rewardsError) {
        console.error('Error fetching rewards:', rewardsError);
        return;
      }

      // Combine and format templates
      const templates: GiftTemplate[] = [
        ...(menuItems || []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          gift_type: 'menu_item' as const,
          gift_value: item.price
        })),
        ...(rewards || []).map(reward => ({
          id: reward.id,
          name: reward.name,
          description: reward.description || '',
          gift_type: 'discount' as const,
          gift_value: reward.points_required
        })),
        // Add some default voucher templates
        {
          id: 'voucher-50',
          name: 'คูปองส่วนลด 50 บาท',
          description: 'ส่วนลด 50 บาท สำหรับวันเกิด',
          gift_type: 'voucher' as const,
          gift_value: 50
        },
        {
          id: 'voucher-100',
          name: 'คูปองส่วนลด 100 บาท',
          description: 'ส่วนลด 100 บาท สำหรับวันเกิด',
          gift_type: 'voucher' as const,
          gift_value: 100
        }
      ];

      setGiftTemplates(templates);
    } catch (error) {
      console.error('Error fetching gift templates:', error);
    }
  };

  useEffect(() => {
    fetchBirthdayMembers();
    fetchGiftTemplates();
  }, [selectedMonth]);

  // Send birthday gifts to all members
  const sendBirthdayGifts = async () => {
    if (!selectedGift) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกของขวัญ', variant: 'destructive' });
      return;
    }

    if (birthdayMembers.length === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่มีสมาชิกที่เกิดในเดือนนี้', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const selectedGiftTemplate = giftTemplates.find(g => g.id === selectedGift);
      if (!selectedGiftTemplate) {
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่พบข้อมูลของขวัญ', variant: 'destructive' });
        return;
      }

      // Create gifts for all birthday members
      const giftsToCreate = birthdayMembers.map(member => {
        const giftCode = `BD${selectedMonth.toString().padStart(2, '0')}${Date.now().toString().slice(-4)}`;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // Expires in 1 month

        return {
          customer_id: member.id,
          gift_id: selectedGiftTemplate.id,
          gift_type: selectedGiftTemplate.gift_type,
          gift_name: selectedGiftTemplate.name,
          gift_description: selectedGiftTemplate.description,
          gift_value: selectedGiftTemplate.gift_value,
          gift_code: giftCode,
          expires_at: expiresAt.toISOString(),
          message: customMessage,
          sent_by: 'birthday_system'
        };
      });

      const { error } = await supabase
        .from('customer_gifts')
        .insert(giftsToCreate);

      if (error) {
        console.error('Error creating birthday gifts:', error);
        toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถส่งของขวัญได้', variant: 'destructive' });
        return;
      }

      toast({ 
        title: 'สำเร็จ!', 
        description: `ส่งของขวัญวันเกิดให้สมาชิก ${birthdayMembers.length} คนแล้ว`,
        duration: 5000
      });

    } catch (error) {
      console.error('Error sending birthday gifts:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการส่งของขวัญ', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          เลือกของรางวัลวันเกิด
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Selection */}
        <div>
          <Label htmlFor="month-select">ประเภทของรางวัล</Label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกเดือน" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gift Selection */}
        <div>
          <Label htmlFor="gift-select">ของรางวัล</Label>
          <Select value={selectedGift} onValueChange={setSelectedGift}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกของรางวัล" />
            </SelectTrigger>
            <SelectContent>
              {giftTemplates.map(gift => (
                <SelectItem key={gift.id} value={gift.id}>
                  {gift.name} - {gift.gift_type === 'menu_item' ? `฿${gift.gift_value}` : `${gift.gift_value} แต้ม`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Birthday Members Count */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            สมาชิกที่เกิดเดือน{months[selectedMonth - 1]}: {birthdayMembers.length} คน
          </span>
        </div>

        {/* Custom Message */}
        <div>
          <Label htmlFor="message">ข้อความพิเศษ (ไม่บังคับ)</Label>
          <Textarea
            id="message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="ข้อความที่จะส่งพร้อมกับของขวัญ..."
            rows={3}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={sendBirthdayGifts}
          disabled={isLoading || !selectedGift || birthdayMembers.length === 0}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading 
            ? 'กำลังส่งของรางวัล...' 
            : `ส่งของรางวัลให้สมาชิก ${birthdayMembers.length} คน`
          }
        </Button>

        {/* Birthday Members List */}
        {birthdayMembers.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">รายชื่อสมาชิกที่เกิดเดือนนี้:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {birthdayMembers.map(member => (
                <div key={member.id} className="text-sm p-2 bg-gray-50 rounded">
                  {member.name} - {member.phone}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdayGiftManager;
