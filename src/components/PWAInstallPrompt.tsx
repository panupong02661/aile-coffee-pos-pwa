import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not standalone and not recently dismissed
    if (!standalone && (!dismissed || daysSinceDismiss > 7)) {
      if (ios) {
        // For iOS, show manual installation instructions
        setTimeout(() => setShowPrompt(true), 3000);
      } else {
        // For Android/Desktop, wait for beforeinstallprompt
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">ติดตั้งแอพ POS</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            ใช้งานได้เร็วขึ้นและสะดวกกว่า เหมือนแอพจริง!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isIOS ? (
            <>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>วิธีติดตั้งบน iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>กดปุ่ม <span className="font-semibold">แชร์</span> (ไอคอนกล่องมีลูกศรชี้ขึ้น)</li>
                  <li>เลือก <span className="font-semibold">"เพิ่มที่หน้าจอ Home"</span></li>
                  <li>กด <span className="font-semibold">"เพิ่ม"</span></li>
                </ol>
              </div>
              <Button className="w-full" onClick={handleDismiss}>
                เข้าใจแล้ว
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleInstall}>
                <Download className="w-4 h-4 mr-2" />
                ติดตั้งเลย
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                ไว้ทีหลัง
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
