import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Tablet, Share, Home, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PWAInstallGuide() {
  const navigate = useNavigate();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">ติดตั้ง POS App</h1>
          <p className="text-muted-foreground">ใช้งานแบบออฟไลน์ได้ เร็วกว่า สะดวกกว่า</p>
        </div>

        {/* iOS Instructions */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>วิธีติดตั้งบน iPhone / iPad</CardTitle>
                <CardDescription>ใช้เวลาแค่ 10 วินาที</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">กดปุ่ม Share (แชร์)</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Share className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">หาปุ่มนี้ที่แถบล่างของ Safari (กล่องมีลูกศรชี้ขึ้น)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">เลือก "เพิ่มที่หน้าจอ Home"</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      <span className="text-sm">Add to Home Screen</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">* อาจต้องเลื่อนหาในเมนู</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">กดปุ่ม "เพิ่ม" หรือ "Add"</p>
                  <div className="bg-green-500/10 p-4 rounded-lg border-2 border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">เสร็จสิ้น! แอพจะปรากฏบนหน้าจอ Home</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Android Instructions */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>วิธีติดตั้งบน Android</CardTitle>
                <CardDescription>ง่ายกว่า iPhone อีก!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">เปิดเมนูของ Chrome</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <span className="text-sm">กดปุ่ม 3 จุดที่มุมขวาบน</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">เลือก "Add to Home screen" หรือ "ติดตั้งแอป"</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <span className="text-sm">Install app / เพิ่มที่หน้าจอหลัก</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">กด "ติดตั้ง" หรือ "Install"</p>
                  <div className="bg-green-500/10 p-4 rounded-lg border-2 border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">เสร็จแล้ว! เปิดแอพได้เลย</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-700">
                <strong>💡 เคล็ดลับ:</strong> บางเครื่องจะมีป๊อปอัพขึ้นมาถามว่า "ต้องการติดตั้งแอพนี้หรือไม่?" สามารถกดติดตั้งได้เลย!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Instructions */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>วิธีติดตั้งบนคอมพิวเตอร์</CardTitle>
                <CardDescription>Chrome, Edge, หรือ Brave</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">หาไอคอน "ติดตั้ง" ที่แถบ URL</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <span className="text-sm">มองหาไอคอนเครื่องหมาย + หรือลูกศรโหลด ที่ด้านขวาของแถบ URL</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold">กดปุ่ม "ติดตั้ง"</p>
                  <div className="bg-green-500/10 p-4 rounded-lg border-2 border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">แอพจะเปิดในหน้าต่างใหม่!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>ข้อดีของการติดตั้งเป็นแอพ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">ใช้งานออฟไลน์ได้</p>
                  <p className="text-sm text-muted-foreground">ไม่มีเน็ตก็ยังใช้งานได้</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">เร็วกว่า</p>
                  <p className="text-sm text-muted-foreground">เปิดไวและโหลดไว</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">หน้าจอเต็ม</p>
                  <p className="text-sm text-muted-foreground">ไม่มีแถบ URL กวนใจ</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">เหมือนแอพจริง</p>
                  <p className="text-sm text-muted-foreground">มีไอคอนบนหน้าจอ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            กลับหน้าหลัก
          </Button>
          <Button onClick={() => navigate('/pos')} size="lg">
            เริ่มใช้งาน POS
          </Button>
        </div>
      </div>
    </div>
  );
}
