
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Award, Coins, Percent } from 'lucide-react';

interface MembershipSetting {
  id: string;
  tier: string;
  discount_percentage: number;
  points_per_baht: number;
  points_to_redeem: number;
  redeem_value: number;
  minimum_spend_for_upgrade: number;
}

const MembershipSettings = () => {
  const [settings, setSettings] = useState<MembershipSetting[]>([]);
  const [editingSettings, setEditingSettings] = useState<{[key: string]: MembershipSetting}>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('membership_settings')
      .select('*')
      .order('tier');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดการตั้งค่าได้', variant: 'destructive' });
      return;
    }
    
    setSettings(data || []);
    
    // Initialize editing settings
    const editing: {[key: string]: MembershipSetting} = {};
    data?.forEach(setting => {
      editing[setting.tier] = { ...setting };
    });
    setEditingSettings(editing);
  };

  const handleInputChange = (tier: string, field: keyof MembershipSetting, value: number) => {
    setEditingSettings(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value
      }
    }));
  };

  const handleSave = async (tier: string) => {
    setLoading(true);
    
    try {
      const settingToUpdate = editingSettings[tier];
      
      console.log('Saving membership settings:', { tier, settingToUpdate });
      
      const { data, error } = await supabase
        .from('membership_settings')
        .update({
          discount_percentage: settingToUpdate.discount_percentage,
          points_per_baht: settingToUpdate.points_per_baht,
          points_to_redeem: settingToUpdate.points_to_redeem,
          redeem_value: settingToUpdate.redeem_value,
          minimum_spend_for_upgrade: settingToUpdate.minimum_spend_for_upgrade,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingToUpdate.id)
        .select();

      if (error) {
        console.error('Error saving membership settings:', error);
        toast({ 
          title: 'ข้อผิดพลาด', 
          description: `ไม่สามารถบันทึกการตั้งค่าได้: ${error.message}`, 
          variant: 'destructive' 
        });
        return;
      }

      console.log('Membership settings saved successfully:', data);
      toast({ 
        title: 'สำเร็จ', 
        description: `บันทึกการตั้งค่าระดับ ${getTierName(tier)} เรียบร้อยแล้ว - ค่าใหม่จะถูกใช้ในระบบทันที` 
      });

      // อัปเดตสถานะในหน้าแบบ optimistic เพื่อไม่ให้ค่าดีดกลับระหว่างโหลด
      setSettings(prev => prev.map(s => s.id === settingToUpdate.id ? { ...s, ...settingToUpdate } : s));
      setEditingSettings(prev => ({ ...prev, [tier]: { ...settingToUpdate } }));
      
      // โหลดข้อมูลใหม่เพื่อแสดงค่าที่บันทึกแล้ว
      await fetchSettings();
    } catch (error: any) {
      console.error('Unexpected error saving membership settings:', error);
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: `เกิดข้อผิดพลาด: ${error.message}`, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'silver': return 'เงิน (Silver)';
      case 'gold': return 'ทอง (Gold)';
      case 'platinum': return 'แพลตินัม (Platinum)';
      default: return tier;
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            ตั้งค่าระบบสมาชิก
          </CardTitle>
          <CardDescription>กำหนดสิทธิประโยชน์และเงื่อนไขสำหรับแต่ละระดับสมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {settings.map((setting) => (
              <Card key={setting.tier} className="border-l-4 border-l-coffee-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <Badge className={getTierBadgeColor(setting.tier)}>
                      {getTierName(setting.tier)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        ส่วนลด (%)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editingSettings[setting.tier]?.discount_percentage || 0}
                        onChange={(e) => handleInputChange(setting.tier, 'discount_percentage', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        แต้มต่อบาท
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editingSettings[setting.tier]?.points_per_baht || 1}
                        onChange={(e) => handleInputChange(setting.tier, 'points_per_baht', parseFloat(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>แต้มขั้นต่ำในการแลก</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editingSettings[setting.tier]?.points_to_redeem || 100}
                        onChange={(e) => handleInputChange(setting.tier, 'points_to_redeem', parseInt(e.target.value) || 100)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>มูลค่าการแลก (บาท)</Label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={editingSettings[setting.tier]?.redeem_value || 10}
                        onChange={(e) => handleInputChange(setting.tier, 'redeem_value', parseFloat(e.target.value) || 10)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ยอดซื้อขั้นต่ำสำหรับอัพเกรด (บาท)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingSettings[setting.tier]?.minimum_spend_for_upgrade || 0}
                        onChange={(e) => handleInputChange(setting.tier, 'minimum_spend_for_upgrade', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button 
                        onClick={() => handleSave(setting.tier)}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สรุปการตั้งค่าปัจจุบัน</CardTitle>
          <CardDescription>ภาพรวมสิทธิประโยชน์ของแต่ละระดับสมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ระดับ</TableHead>
                  <TableHead>ส่วนลด</TableHead>
                  <TableHead>แต้มต่อบาท</TableHead>
                  <TableHead>การแลกแต้ม</TableHead>
                  <TableHead>ยอดซื้อขั้นต่ำ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.tier}>
                    <TableCell>
                      <Badge className={getTierBadgeColor(setting.tier)}>
                        {getTierName(setting.tier)}
                      </Badge>
                    </TableCell>
                    <TableCell>{setting.discount_percentage}%</TableCell>
                    <TableCell>{setting.points_per_baht} แต้ม/บาท</TableCell>
                    <TableCell>
                      {setting.points_to_redeem} แต้ม = {setting.redeem_value} บาท
                    </TableCell>
                    <TableCell>
                      {setting.minimum_spend_for_upgrade === 0 
                        ? 'ไม่จำกัด' 
                        : `฿${setting.minimum_spend_for_upgrade.toLocaleString()}`
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MembershipSettings;
