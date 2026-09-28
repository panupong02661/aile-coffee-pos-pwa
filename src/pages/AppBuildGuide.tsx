import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, Monitor, Share, Home, Check, Download, 
  Apple, Globe, Terminal, Package, Rocket, AlertCircle,
  CheckCircle2, XCircle, ArrowRight, Store, Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '@/components/Shell';

export default function AppBuildGuide() {
  const navigate = useNavigate();

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">🚀 สร้างแอปมือถือ</h1>
          <p className="text-muted-foreground">เลือกวิธีที่เหมาะกับคุณในการทำให้ระบบ POS เป็นแอปบนมือถือ</p>
        </div>

        <Tabs defaultValue="pwa" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="pwa" className="py-3 text-sm">
              <Globe className="w-4 h-4 mr-2" />
              PWA (ไม่ต้องลง Store)
            </TabsTrigger>
            <TabsTrigger value="native" className="py-3 text-sm">
              <Store className="w-4 h-4 mr-2" />
              Native App (ลง App Store)
            </TabsTrigger>
          </TabsList>

          {/* ===== PWA Tab ===== */}
          <TabsContent value="pwa" className="space-y-6 mt-6">
            {/* Intro */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-primary" />
                  PWA คืออะไร?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  PWA (Progressive Web App) คือเว็บแอปที่สามารถติดตั้งบนอุปกรณ์ได้โดยตรงจากเบราว์เซอร์ 
                  ไม่ต้องผ่าน App Store หรือ Play Store ใช้งานได้เหมือนแอปจริงบนหน้าจอ Home
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ไม่ต้องลง App Store / Play Store</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ใช้ได้ทั้ง iPhone, Android, PC</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ติดตั้งง่าย ใช้เวลาแค่ 10 วินาที</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ใช้งานออฟไลน์ได้</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ฟีเจอร์บางอย่างอาจจำกัด (เช่น Bluetooth)</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">เครื่องพิมพ์รองรับเฉพาะ WiFi/LAN</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* iOS */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>วิธีติดตั้งบน iPhone / iPad</CardTitle>
                    <CardDescription>ผ่าน Safari</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <StepItem step={1} title="เปิดเว็บแอปใน Safari">
                  <p className="text-sm text-muted-foreground">เปิด URL ของระบบ POS ในเบราว์เซอร์ Safari</p>
                </StepItem>
                <StepItem step={2} title='กดปุ่ม Share (แชร์)'>
                  <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                    <Share className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">ปุ่มกล่องมีลูกศรชี้ขึ้น ที่แถบล่างของ Safari</span>
                  </div>
                </StepItem>
                <StepItem step={3} title='เลือก "เพิ่มที่หน้าจอ Home"'>
                  <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <span className="text-sm">Add to Home Screen</span>
                  </div>
                </StepItem>
                <StepItem step={4} title='กด "เพิ่ม" หรือ "Add"' done>
                  <p className="text-sm text-green-700 font-medium">✅ แอปจะปรากฏบนหน้าจอ Home เหมือนแอปจริง!</p>
                </StepItem>
              </CardContent>
            </Card>

            {/* Android */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Smartphone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>วิธีติดตั้งบน Android</CardTitle>
                    <CardDescription>ผ่าน Chrome</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <StepItem step={1} title="เปิดเว็บแอปใน Chrome" color="green">
                  <p className="text-sm text-muted-foreground">เปิด URL ของระบบ POS ในเบราว์เซอร์ Chrome</p>
                </StepItem>
                <StepItem step={2} title="กดปุ่ม 3 จุดที่มุมขวาบน" color="green">
                  <p className="text-sm text-muted-foreground">แล้วเลือก "Add to Home screen" หรือ "ติดตั้งแอป"</p>
                </StepItem>
                <StepItem step={3} title='กด "ติดตั้ง" หรือ "Install"' color="green" done>
                  <p className="text-sm text-green-700 font-medium">✅ แอปจะถูกติดตั้งบนหน้าจอ Home!</p>
                </StepItem>
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700">
                    <strong>💡 เคล็ดลับ:</strong> บางเครื่องจะมีป๊อปอัพถามว่า "ต้องการติดตั้งแอพนี้หรือไม่?" กดติดตั้งได้เลย!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Desktop */}
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
                <StepItem step={1} title="หาไอคอน 'ติดตั้ง' ที่แถบ URL" color="purple">
                  <p className="text-sm text-muted-foreground">มองหาไอคอน + หรือลูกศรดาวน์โหลดที่ด้านขวาของแถบ URL</p>
                </StepItem>
                <StepItem step={2} title='กดปุ่ม "ติดตั้ง"' color="purple" done>
                  <p className="text-sm text-green-700 font-medium">✅ แอปจะเปิดในหน้าต่างใหม่!</p>
                </StepItem>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Native App Tab ===== */}
          <TabsContent value="native" className="space-y-6 mt-6">
            {/* Intro */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-orange-600" />
                  Native App คืออะไร?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Native App คือการบิลด์แอปเป็นแอปจริง ๆ ที่สามารถลงใน App Store (iOS) และ Play Store (Android) ได้ 
                  หรือจะบิลด์เป็นไฟล์ .apk / .ipa เพื่อติดตั้งบนเครื่องโดยตรงก็ได้ ใช้ Capacitor ในการแปลงเว็บแอปเป็น Native
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ลง App Store / Play Store ได้</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">เข้าถึงฟีเจอร์อุปกรณ์เต็มรูปแบบ</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Performance ดีที่สุด</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">รองรับ USB / Bluetooth Printer</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ต้องใช้ Xcode (iOS) / Android Studio</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ต้องมี Apple Developer Account ($99/ปี) สำหรับลง App Store</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option A: Build without App Store */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Wrench className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>วิธีที่ 1: บิลด์เป็นแอปโดยไม่ผ่าน App Store</CardTitle>
                      <CardDescription>ติดตั้งบนเครื่องโดยตรง (Sideload)</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">แนะนำ</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>เหมาะสำหรับ:</strong> ต้องการแอปจริงบนมือถือ แต่ไม่ต้องการลง App Store 
                    เช่น แอปสำหรับใช้ภายในร้านหรือองค์กร
                  </p>
                </div>

                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">สิ่งที่ต้องเตรียม</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-medium text-sm">Android</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Android Studio</li>
                      <li>• JDK 17+</li>
                      <li>• Node.js + npm</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-medium text-sm">iOS</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      <li>• Mac + Xcode</li>
                      <li>• Apple ID (ฟรี สำหรับทดสอบ)</li>
                      <li>• Node.js + npm</li>
                    </ul>
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">ขั้นตอนการบิลด์</h4>
                
                <NativeStep step={1} title="Export โปรเจกต์ไป GitHub">
                  <p className="text-sm text-muted-foreground">
                    กดปุ่ม "Export to GitHub" ใน Lovable แล้ว git clone โปรเจกต์ลงเครื่อง
                  </p>
                  <CodeBlock code="git clone https://github.com/your-repo/aile-coffee-pos-pwa.git
cd aile-coffee-pos-pwa" />
                </NativeStep>

                <NativeStep step={2} title="ติดตั้ง Dependencies">
                  <CodeBlock code="npm install" />
                </NativeStep>

                <NativeStep step={3} title="เพิ่ม Platform (Android / iOS)">
                  <CodeBlock code={`# สำหรับ Android
npx cap add android

# สำหรับ iOS (ต้องใช้ Mac)
npx cap add ios`} />
                </NativeStep>

                <NativeStep step={4} title="บิลด์และ Sync">
                  <CodeBlock code={`npm run build
npx cap sync`} />
                </NativeStep>

                <NativeStep step={5} title="รันบนอุปกรณ์จริงหรือ Emulator">
                  <CodeBlock code={`# Android
npx cap run android

# iOS
npx cap run ios`} />
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                    <p className="text-sm text-amber-800">
                      <strong>💡 Android:</strong> สร้างไฟล์ APK ได้จาก Android Studio &gt; Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s) 
                      แล้วส่งไฟล์ .apk ไปติดตั้งบนมือถือ Android ได้เลย
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                    <p className="text-sm text-amber-800">
                      <strong>💡 iOS:</strong> ใช้ Xcode เชื่อมต่อ iPhone แล้วกด Run ลงเครื่องได้โดยตรง 
                      (ต้องเชื่อถืออุปกรณ์ในการตั้งค่า iPhone)
                    </p>
                  </div>
                </NativeStep>

                <NativeStep step={6} title="อัปเดตแอปเมื่อมีเวอร์ชันใหม่ (ทำทุกครั้งที่มีอัปเดต)">
                  <p className="text-sm text-muted-foreground">
                    ทุกครั้งที่ระบบ POS มีการอัปเดตใหม่ แล้วอยากอัปเดตแอปในมือถือด้วย ให้ทำตามขั้นตอนนี้
                  </p>

                  <h5 className="font-semibold text-sm mt-2">ส่วนที่ 1: เปิด PowerShell แล้วรันทีละบรรทัด</h5>
                  <CodeBlock code={`cd C:\\Users\\panup\\aile-coffee-pos-pwa
git checkout -- package.json package-lock.json
git pull
npm install --legacy-peer-deps
npm run build
npx cap sync android
npx cap open android`} />
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ สำคัญ:</strong> คำสั่ง <code>git pull</code> ต้องขึ้นรายการไฟล์ที่เปลี่ยน ห้ามมีคำว่า <strong>Aborting</strong>
                      ถ้าขึ้น Aborting แปลว่าโค้ดใหม่ยังไม่ถูกดึงลงมา ให้รัน <code>git checkout -- package.json</code> แล้ว <code>git pull</code> อีกครั้ง
                    </p>
                  </div>

                  <h5 className="font-semibold text-sm mt-3">ส่วนที่ 2: ใน Android Studio</h5>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>1. กดปุ่ม <strong>☰ (4 ขีด) มุมซ้ายบน</strong> แล้วเลือกเมนู <strong>Build</strong></p>
                    <p>2. เลือก <strong>Build Bundle(s) / APK(s)</strong> → <strong>Build APK(s)</strong></p>
                    <p>3. รอจนขึ้น <strong>BUILD SUCCESSFUL</strong> แล้วกด <strong>locate</strong> เพื่อเปิดโฟลเดอร์ไฟล์ APK</p>
                    <p>4. ไฟล์ที่ได้คือ <code>app-debug.apk</code> ส่งเข้ามือถือแล้วติดตั้งทับแอปเดิมได้เลย</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-2">
                    <p className="text-sm text-blue-800">
                      <strong>💡 ตรวจว่าอัปเดตสำเร็จ:</strong> เปิดแอปแล้วดูมุมล่างของหน้าเข้าสู่ระบบ
                      เลขเวอร์ชันต้องตรงกับเวอร์ชันล่าสุดบนเว็บ ถ้าเลขยังเก่า แปลว่า build ยังไม่ได้ใช้โค้ดใหม่
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                    <p className="text-sm text-amber-800">
                      <strong>⚠️ ก่อนถอนแอปเก่า:</strong> ถ้าติดตั้งทับไม่ได้ ต้องเปิดแอปเดิมต่ออินเทอร์เน็ตรอให้ออเดอร์ออฟไลน์ซิงก์ครบก่อน
                      แล้วค่อยลบแอปเก่าและติดตั้งใหม่
                    </p>
                  </div>
                </NativeStep>
              </CardContent>
            </Card>


            {/* Option B: App Store */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Rocket className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>วิธีที่ 2: ลง App Store / Play Store</CardTitle>
                    <CardDescription>เผยแพร่แอปสู่สาธารณะ</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <strong>เหมาะสำหรับ:</strong> ต้องการเผยแพร่แอปให้ลูกค้าดาวน์โหลดจาก Store 
                    เหมาะสำหรับแอปลูกค้า เช่น แอปสะสมแต้ม สั่งซื้อออนไลน์
                  </p>
                </div>

                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">ค่าใช้จ่าย</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <Apple className="w-4 h-4" /> Apple App Store
                    </p>
                    <p className="text-lg font-bold text-primary mt-1">$99 / ปี</p>
                    <p className="text-xs text-muted-foreground">Apple Developer Program</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4" /> Google Play Store
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-1">$25 ครั้งเดียว</p>
                    <p className="text-xs text-muted-foreground">Google Play Developer</p>
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">ขั้นตอนหลัก</h4>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">ทำตามขั้นตอนวิธีที่ 1 ทั้งหมด</p>
                      <p className="text-xs text-muted-foreground">บิลด์โปรเจกต์และ sync กับ Capacitor</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">สมัคร Developer Account</p>
                      <p className="text-xs text-muted-foreground">Apple Developer Program ($99/ปี) หรือ Google Play Console ($25)</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">เตรียม Assets สำหรับ Store</p>
                      <p className="text-xs text-muted-foreground">ไอคอนแอป, Screenshots, คำอธิบาย, Privacy Policy</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="text-sm font-medium">บิลด์ Release Version</p>
                      <CodeBlock code={`# Android - สร้าง AAB สำหรับ Play Store
# Android Studio > Build > Generate Signed Bundle

# iOS - Archive สำหรับ App Store
# Xcode > Product > Archive`} />
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</div>
                    <div>
                      <p className="text-sm font-medium">อัปโหลดและส่ง Review</p>
                      <p className="text-xs text-muted-foreground">อัปโหลดไฟล์ไปยัง Store Console แล้วส่งเข้ารีวิว (ใช้เวลา 1-7 วัน)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capacitor Blog Reference */}
            <Card className="border border-dashed border-muted-foreground/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">📖 อ่านเพิ่มเติม</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      สำหรับรายละเอียดเพิ่มเติมเกี่ยวกับการตั้งค่า Capacitor และการบิลด์แอป Native 
                      อ่านได้ที่บล็อก Lovable:{' '}
                      <a 
                        href="https://docs.lovable.dev/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Lovable Documentation
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Comparison Table */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>เปรียบเทียบวิธีการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">คุณสมบัติ</th>
                    <th className="text-center p-3 font-medium">
                      <Badge variant="outline" className="bg-primary/5">PWA</Badge>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <Badge variant="outline" className="bg-blue-50">Sideload</Badge>
                    </th>
                    <th className="text-center p-3 font-medium">
                      <Badge variant="outline" className="bg-purple-50">App Store</Badge>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <ComparisonRow label="ความง่ายในการติดตั้ง" pwa="⭐⭐⭐" sideload="⭐⭐" store="⭐" />
                  <ComparisonRow label="ค่าใช้จ่าย" pwa="ฟรี" sideload="ฟรี" store="$25-99" />
                  <ComparisonRow label="ต้องใช้ Developer Tools" pwa="ไม่ต้อง" sideload="ต้องใช้" store="ต้องใช้" />
                  <ComparisonRow label="ใช้งานออฟไลน์" pwa="✅" sideload="✅" store="✅" />
                  <ComparisonRow label="Push Notifications" pwa="จำกัด" sideload="✅ เต็มรูปแบบ" store="✅ เต็มรูปแบบ" />
                  <ComparisonRow label="เครื่องพิมพ์ USB/BT" pwa="❌" sideload="✅" store="✅" />
                  <ComparisonRow label="กล้อง" pwa="✅ (จำกัด)" sideload="✅ เต็มรูปแบบ" store="✅ เต็มรูปแบบ" />
                  <ComparisonRow label="อัปเดตอัตโนมัติ" pwa="✅ ทันที" sideload="❌ ต้องบิลด์ใหม่" store="ผ่าน Store" />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    </Shell>
  );
}

// Helper Components
function StepItem({ step, title, children, color = 'primary', done = false }: { 
  step: number; title: string; children: React.ReactNode; color?: string; done?: boolean 
}) {
  const bgColors: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
  };
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-8 h-8 ${bgColors[color]} rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm`}>
        {step}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-semibold">{title}</p>
        {done ? (
          <div className="bg-green-500/10 p-3 rounded-lg border-2 border-green-500/20">
            {children}
          </div>
        ) : children}
      </div>
    </div>
  );
}

function NativeStep({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
        {step}
      </div>
      <div className="flex-1 space-y-2">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap">
      {code}
    </pre>
  );
}

function ComparisonRow({ label, pwa, sideload, store }: { label: string; pwa: string; sideload: string; store: string }) {
  return (
    <tr>
      <td className="p-3 font-medium">{label}</td>
      <td className="p-3 text-center">{pwa}</td>
      <td className="p-3 text-center">{sideload}</td>
      <td className="p-3 text-center">{store}</td>
    </tr>
  );
}
