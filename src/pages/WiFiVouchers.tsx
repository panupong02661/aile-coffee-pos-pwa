import { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wifi, Plus, Trash2, Download } from 'lucide-react';
import { z } from 'zod';
import QRCode from 'qrcode';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Validation schema
const voucherSchema = z.object({
  username: z.string()
    .trim()
    .min(3, { message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" })
    .max(50, { message: "ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, A-Z, 0-9, _, -" }),
  password: z.string()
    .trim()
    .min(4, { message: "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร" })
    .max(50, { message: "รหัสผ่านต้องไม่เกิน 50 ตัวอักษร" })
    .regex(/^[a-zA-Z0-9!@#$%^&*_-]+$/, { message: "รหัสผ่านมีอักขระที่ไม่รองรับ" }),
});

interface WiFiVoucher {
  id: string;
  username: string;
  password: string;
  qr_code_url: string | null;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

const WiFiVouchers = () => {
  const [vouchers, setVouchers] = useState<WiFiVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ssid, setSsid] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchVouchers();
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    const { data } = await supabase
      .from('shop_settings')
      .select('shop_name')
      .limit(1)
      .single();
    
    if (data?.shop_name) {
      setSsid(data.shop_name + '_WiFi');
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wifi_vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูล WiFi Vouchers',
        variant: 'destructive',
      });
    } else {
      setVouchers(data || []);
    }
    setLoading(false);
  };

  const generateQRCode = async (username: string, password: string): Promise<string> => {
    try {
      // Generate WiFi QR code in standard format
      const wifiString = `WIFI:T:WPA;S:${ssid};P:${password};H:false;;`;
      const qrDataUrl = await QRCode.toDataURL(wifiString, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleAddVoucher = async () => {
    try {
      // Validate inputs
      const validationResult = voucherSchema.safeParse({ 
        username: username.trim(), 
        password: password.trim() 
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(', ');
        toast({
          title: 'ข้อมูลไม่ถูกต้อง',
          description: errors,
          variant: 'destructive',
        });
        return;
      }

      // Check for duplicate username
      const { data: existing } = await supabase
        .from('wifi_vouchers')
        .select('username')
        .eq('username', validationResult.data.username)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'ชื่อผู้ใช้ซ้ำ',
          description: 'มีชื่อผู้ใช้นี้อยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น',
          variant: 'destructive',
        });
        return;
      }

      // Generate QR code
      const qrCodeUrl = await generateQRCode(
        validationResult.data.username, 
        validationResult.data.password
      );

      // Insert to database
      const { error } = await supabase.from('wifi_vouchers').insert({
        username: validationResult.data.username,
        password: validationResult.data.password,
        qr_code_url: qrCodeUrl,
      });

      if (error) {
        console.error('WiFi voucher insert error:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: error.message || 'ไม่สามารถเพิ่ม WiFi Voucher ได้',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'สำเร็จ',
          description: 'เพิ่ม WiFi Voucher แล้ว',
        });
        setUsername('');
        setPassword('');
        fetchVouchers();
      }
    } catch (error) {
      console.error('Unexpected error adding voucher:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    const { error } = await supabase.from('wifi_vouchers').delete().eq('id', id);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบ WiFi Voucher',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'สำเร็จ',
        description: 'ลบ WiFi Voucher แล้ว',
      });
      fetchVouchers();
    }
  };

  const exportVouchers = () => {
    const unused = vouchers.filter(v => !v.is_used);
    const csv = [
      'ชื่อผู้ใช้,รหัสผ่าน',
      ...unused.map(v => `${v.username},${v.password}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wifi_vouchers.csv';
    link.click();
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wifi className="w-8 h-8" />
              จัดการ WiFi Vouchers
            </h1>
            <p className="text-muted-foreground mt-1">
              จัดการรหัส WiFi สำหรับลูกค้า (ใช้ได้ครั้งเดียว)
            </p>
          </div>
          <Button onClick={exportVouchers} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export ที่ยังไม่ใช้
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>เพิ่ม WiFi Voucher</CardTitle>
            <CardDescription>
              สร้าง voucher ใหม่สำหรับลูกค้า (SSID: {ssid})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="3Hoursk"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  ใช้ได้เฉพาะ a-z, A-Z, 0-9, _, - (3-50 ตัวอักษร)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="hq1s56"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  4-50 ตัวอักษร (a-z, A-Z, 0-9, !@#$%^&*_-)
                </p>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddVoucher} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่ม Voucher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการ WiFi Vouchers</CardTitle>
            <CardDescription>
              จำนวนที่ยังไม่ใช้: {vouchers.filter(v => !v.is_used).length} / ทั้งหมด: {vouchers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                ยังไม่มี WiFi Vouchers
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อผู้ใช้</TableHead>
                    <TableHead>รหัสผ่าน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ใช้งานเมื่อ</TableHead>
                    <TableHead>QR Code</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-mono">{voucher.username}</TableCell>
                      <TableCell className="font-mono">{voucher.password}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            voucher.is_used
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {voucher.is_used ? 'ใช้แล้ว' : 'ยังไม่ใช้'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {voucher.used_at
                          ? new Date(voucher.used_at).toLocaleString('th-TH')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {voucher.qr_code_url && (
                          <img
                            src={voucher.qr_code_url}
                            alt="QR Code"
                            className="w-16 h-16"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณต้องการลบ voucher นี้หรือไม่?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVoucher(voucher.id)}
                              >
                                ลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

export default WiFiVouchers;
