import { useState, useEffect, useRef } from 'react';
import { Shell } from '@/components/Shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wifi, Plus, Trash2, Download, Upload, Printer } from 'lucide-react';
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
  const [wifiHeaderText, setWifiHeaderText] = useState('');
  const [wifiFooterText, setWifiFooterText] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVouchers();
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    const { data } = await supabase
      .from('shop_settings')
      .select('shop_name, wifi_header_text, wifi_footer_text')
      .limit(1)
      .single();
    
    if (data) {
      if (data.shop_name) {
        setSsid(data.shop_name + '_WiFi');
      }
      setWifiHeaderText(data.wifi_header_text || '');
      setWifiFooterText(data.wifi_footer_text || '');
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

  const generateQRCode = async (wifiPassword: string): Promise<string> => {
    try {
      // Generate WiFi QR code in standard format using SSID and the actual WiFi password
      const wifiString = `WIFI:T:WPA;S:${ssid};P:${wifiPassword};H:false;;`;
      const qrDataUrl = await QRCode.toDataURL(wifiString, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M',
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

      // Generate QR code using the password (which is the WiFi password)
      const qrCodeUrl = await generateQRCode(validationResult.data.password);

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
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wifi_vouchers.csv';
    link.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      let successCount = 0;
      let errorCount = 0;

      for (const line of dataLines) {
        const [username, password] = line.split(',').map(s => s.trim());
        
        if (!username || !password) continue;

        // Validate
        const validationResult = voucherSchema.safeParse({ username, password });
        if (!validationResult.success) {
          errorCount++;
          continue;
        }

        // Check duplicate
        const { data: existing } = await supabase
          .from('wifi_vouchers')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (existing) {
          errorCount++;
          continue;
        }

        // Generate QR and insert
        const qrCodeUrl = await generateQRCode(password);
        const { error } = await supabase.from('wifi_vouchers').insert({
          username,
          password,
          qr_code_url: qrCodeUrl,
        });

        if (error) {
          errorCount++;
        } else {
          successCount++;
        }
      }

      toast({
        title: 'Import เสร็จสิ้น',
        description: `สำเร็จ: ${successCount} รายการ, ล้มเหลว: ${errorCount} รายการ`,
      });

      fetchVouchers();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถ import ไฟล์ CSV ได้',
        variant: 'destructive',
      });
    }
  };

  const saveWifiSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data: existing } = await supabase
        .from('shop_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('shop_settings')
          .update({
            wifi_header_text: wifiHeaderText,
            wifi_footer_text: wifiFooterText
          })
          .eq('id', existing.id);

        if (error) throw error;
      }

      toast({
        title: 'สำเร็จ',
        description: 'บันทึกการตั้งค่า WiFi แล้ว',
      });
    } catch (error) {
      console.error('Error saving WiFi settings:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกการตั้งค่าได้',
        variant: 'destructive',
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const printVoucherCard = (voucher: WiFiVoucher) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>WiFi Voucher - ${voucher.username}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 1cm; }
          }
          body {
            font-family: 'Sarabun', Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .voucher-card {
            background: white;
            border: 2px solid #e74c3c;
            border-radius: 8px;
            padding: 20px;
            width: 300px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            color: #e74c3c;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 10px;
          }
          .qr-container {
            margin: 15px 0;
          }
          .qr-container img {
            width: 200px;
            height: 200px;
            border: 1px solid #ddd;
          }
          .credentials {
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .credential-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px;
          }
          .label {
            font-weight: bold;
            color: #333;
          }
          .value {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #e74c3c;
          }
          .footer {
            font-size: 12px;
            color: #666;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="voucher-card">
          <div class="header">บัตรใช้งานอินเทอร์เน็ต</div>
          <div class="qr-container">
            <img src="${voucher.qr_code_url}" alt="QR Code" />
          </div>
          <div class="credentials">
            <div class="credential-row">
              <span class="label">ชื่อผู้ใช้</span>
              <span class="value">${voucher.username}</span>
            </div>
            <div class="credential-row">
              <span class="label">รหัสผ่าน</span>
              <span class="value">${voucher.password}</span>
            </div>
          </div>
          <div class="footer">
            สแกน QR Code เพื่อเชื่อมต่ออัตโนมัติ<br>
            หรือกรอกชื่อผู้ใช้และรหัสผ่านด้วยตนเอง
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => window.print(), 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={exportVouchers} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export ที่ยังไม่ใช้
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ตั้งค่า WiFi</CardTitle>
            <CardDescription>
              กำหนดข้อความที่จะแสดงในส่วน WiFi ของใบเสร็จ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wifiHeaderText">ข้อความส่วนบน</Label>
                <Input
                  id="wifiHeaderText"
                  value={wifiHeaderText}
                  onChange={(e) => setWifiHeaderText(e.target.value)}
                  placeholder="เช่น: WiFi ฟรี สำหรับลูกค้า"
                />
                <p className="text-xs text-muted-foreground">
                  ข้อความที่จะแสดงด้านบนของส่วน WiFi Voucher
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wifiFooterText">ข้อความส่วนล่าง</Label>
                <Input
                  id="wifiFooterText"
                  value={wifiFooterText}
                  onChange={(e) => setWifiFooterText(e.target.value)}
                  placeholder="เช่น: ขอบคุณที่ใช้บริการ"
                />
                <p className="text-xs text-muted-foreground">
                  ข้อความที่จะแสดงด้านล่างของส่วน WiFi Voucher
                </p>
              </div>

              <Button 
                onClick={saveWifiSettings} 
                disabled={settingsLoading}
                className="w-full"
              >
                {settingsLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </div>
          </CardContent>
        </Card>

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
                        <div className="flex gap-1 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => printVoucherCard(voucher)}
                          >
                            <Printer className="w-4 h-4 text-blue-600" />
                          </Button>
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
                        </div>
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
