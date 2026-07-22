import LauncherIOS from '@/components/launcher/LauncherIOS';
import LauncherIOSFolder from '@/components/launcher/LauncherIOSFolder';
import LauncherBento from '@/components/launcher/LauncherBento';
import LauncherBentoGlass from '@/components/launcher/LauncherBentoGlass';
import LauncherDark from '@/components/launcher/LauncherDark';
import LauncherMinimal from '@/components/launcher/LauncherMinimal';

const designs = [
  { n: 1, title: 'iOS Launchpad', desc: 'ไอคอนกลม สีสด grid เรียงเต็ม พื้นหลังไล่สี', C: LauncherIOS },
  { n: 2, title: 'iOS Folder Groups', desc: 'จัดกลุ่มเป็นโฟลเดอร์ 2×2 พื้นดำ glass', C: LauncherIOSFolder },
  { n: 3, title: 'Bento Asymmetric', desc: 'การ์ดขนาดไม่เท่ากัน POS ใหญ่สุด + สถิติ', C: LauncherBento },
  { n: 4, title: 'Bento Glass Cards', desc: 'การ์ดกระจก มู้ดกาแฟอบอุ่น', C: LauncherBentoGlass },
  { n: 5, title: 'Dark Command Center', desc: 'พื้นดำ + accent ทอง sidebar หมวด', C: LauncherDark },
  { n: 6, title: 'Minimal Swiss Grid', desc: 'พื้นครีม typography serif เส้นบาง', C: LauncherMinimal },
];

export default function LauncherPreview() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Preview Only</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">6 ดีไซน์หน้า App Launcher</h1>
          <p className="text-muted-foreground">เลือกเบอร์ที่ชอบแล้วบอกได้เลย ผมจะเอาไปทำเป็นหน้าหลักจริง</p>
        </header>

        <div className="space-y-12">
          {designs.map(({ n, title, desc, C }) => (
            <section key={n}>
              <div className="flex items-baseline gap-3 mb-4 px-1">
                <span className="text-4xl font-bold text-muted-foreground/40">{String(n).padStart(2, '0')}</span>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
              <C />
            </section>
          ))}
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          บอกเลข 1–6 (หรือผสมกัน) แล้วผมจะเอาไปแทนหน้า / หรือแยกเป็น /home ให้
        </footer>
      </div>
    </div>
  );
}
