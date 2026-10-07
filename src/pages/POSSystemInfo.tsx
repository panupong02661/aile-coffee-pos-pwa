import { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code2, Database, Tablet, Wrench, CheckCircle2, XCircle, Info,
} from 'lucide-react';

const POSSystemInfo = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const frontendItems = [
    'React + TypeScript — สร้างด้วย Vite',
    'Tailwind CSS — สำหรับหน้าตา UI',
    'Capacitor — แพ็กเป็นแอป Android (และทำได้ทั้ง iOS)',
  ];

  const backendItems = [
    'PostgreSQL — ผ่านบริการ Supabase (ไม่ใช่ MySQL หรือ MongoDB)',
    'ฟังก์ชัน PL/pgSQL — ตรรกะธุรกิจสำคัญๆ ในฐานข้อมูล (เช่น คำนวณแต้มสมาชิก, สร้างเลขออเดอร์, ตรวจสิทธิ์ admin)',
    'Edge Functions (TypeScript) — ส่งแจ้งเตือน LINE, ล็อกอินพนักงาน, รายงานรายวัน',
  ];

  const tabletItems = [
    'Capacitor — แพ็กเป็นแอป APK Android',
    'ติดตั้งบนแท็บเล็ตและทำงานแบบออฟไลน์ได้',
  ];

  const devNextSteps = [
    { ok: true, text: 'ติดตั้ง Node.js (รุ่น 18 ขึ้นไป) + npm — สำหรับ build และรันโปรเจกต์' },
    { ok: true, text: 'แก้โค้ดด้วย VS Code หรือแก้ผ่านหน้า Lovable นี้ตรงๆ' },
    { ok: true, text: 'ฐานข้อมูลบริหารผ่านหน้า Supabase Dashboard ได้เลย ไม่ต้องติดตั้ง PostgreSQL เอง' },
    { ok: true, text: 'ทีมที่คุ้นเคย JavaScript/TypeScript ต่อยอดได้ทันที' },
    { ok: false, text: 'PHP หรือ C# ต่อไม่ได้โดยตรง เพราะทั้งระบบเป็น React + Supabase ทั้งก้อน' },
  ];

  const sections = [
    {
      id: 'frontend',
      title: 'ส่วนหน้าแอป (Frontend)',
      description: 'เทคโนโลยีที่ทำงานบนแท็บเล็ตและเบราว์เซอร์',
      icon: Code2,
      items: frontendItems,
    },
    {
      id: 'backend',
      title: 'ฐานข้อมูลและระบบหลังบ้าน (Backend)',
      description: 'ฐานข้อมูลและตรรกะธุรกิจของระบบ',
      icon: Database,
      items: backendItems,
    },
    {
      id: 'tablet',
      title: 'แอปแท็บเล็ต',
      description: 'การแพ็กเป็นแอปมือถือ',
      icon: Tablet,
      items: tabletItems,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      <div className="flex-1 md:ml-[56px]">
        <div className="p-4">
          <Header
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />

          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <Info className="w-6 h-6" />
                  ข้อมูลระบบ POS
                </CardTitle>
                <CardDescription>เทคโนโลยีและฐานข้อมูลที่ระบบนี้ใช้ สำหรับพัฒนาต่อ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <Card key={section.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Icon className="w-5 h-5 text-primary" />
                            {section.title}
                          </CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {section.items.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                                <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                                  <CheckCircle2 className="w-3 h-3" />
                                </Badge>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wrench className="w-5 h-5 text-primary" />
                        แนะนำสำหรับการพัฒนาต่อ
                      </CardTitle>
                      <CardDescription>สิ่งที่ต้องมีและข้อจำกัดที่ควรรู้</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {devNextSteps.map((step) => {
                          const StepIcon = step.ok ? CheckCircle2 : XCircle;
                          return (
                            <li key={step.text} className="flex items-start gap-2 text-sm text-foreground">
                              <StepIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${step.ok ? 'text-emerald-600' : 'text-red-500'}`} />
                              <span>{step.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground mb-1">สรุป</p>
                        <p>
                          ระบบนี้เขียนด้วย React + TypeScript (Node.js/Vite) ไม่ใช่ PHP/Python/C#
                          และฐานข้อมูลเป็น PostgreSQL ผ่าน Supabase
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold text-foreground">Frontend:</span> React + TypeScript + Tailwind CSS (Vite)
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">Backend:</span> Supabase — PostgreSQL + ฟังก์ชัน PL/pgSQL + Edge Functions (TypeScript)
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">แอปแท็บเล็ต:</span> Capacitor แพ็กเป็น APK Android
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSSystemInfo;
