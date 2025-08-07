
import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Monitor,
  Globe,
  Shield,
  Zap,
  Database,
  Bell
} from 'lucide-react';

const PWAApplication = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swStatus, setSWStatus] = useState('checking');
  const [cacheSize, setCacheSize] = useState(0);
  const [notifications, setNotifications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if PWA is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setSWStatus('active');
            // Estimate cache size
            if ('storage' in navigator && 'estimate' in navigator.storage) {
              const estimate = await navigator.storage.estimate();
              setCacheSize(Math.round((estimate.usage || 0) / 1024 / 1024));
            }
          } else {
            setSWStatus('not-installed');
          }
        } catch (error) {
          setSWStatus('error');
        }
      } else {
        setSWStatus('not-supported');
      }
    };

    checkInstalled();
    checkServiceWorker();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: "PWA Installed Successfully",
          description: "The app has been installed on your device.",
        });
      }
      setInstallPrompt(null);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setSWStatus('active');
        toast({
          title: "Service Worker Registered",
          description: "Offline functionality is now available.",
        });
      } catch (error) {
        setSWStatus('error');
        toast({
          title: "Service Worker Error",
          description: "Failed to register service worker.",
          variant: "destructive"
        });
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setCacheSize(0);
      toast({
        title: "Cache Cleared",
        description: "All cached data has been cleared.",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifications(permission === 'granted');
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You will receive push notifications.",
        });
      }
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Aile Coffee PWA', {
        body: 'This is a test notification from your PWA!',
        icon: '/icon-192x192.png'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'checking': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Shell>
      <div className="h-screen bg-background flex">
        <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Progressive Web App (PWA)"
          />
          
          <div className="p-6 space-y-6">
            {/* PWA Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">PWA Status</p>
                      <p className="text-lg font-semibold">
                        {isInstalled ? 'Installed' : 'Not Installed'}
                      </p>
                    </div>
                    <Smartphone className={`w-8 h-8 ${isInstalled ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Connection</p>
                      <p className="text-lg font-semibold">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                    {isOnline ? (
                      <Wifi className="w-8 h-8 text-green-500" />
                    ) : (
                      <WifiOff className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Service Worker</p>
                      <p className="text-lg font-semibold capitalize">{swStatus}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(swStatus)}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cache Size</p>
                      <p className="text-lg font-semibold">{cacheSize} MB</p>
                    </div>
                    <Database className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="installation" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="installation">Installation</TabsTrigger>
                <TabsTrigger value="offline">Offline Mode</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Installation Tab */}
              <TabsContent value="installation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      PWA Installation
                    </CardTitle>
                    <CardDescription>
                      Install Aile Coffee as a Progressive Web App for the best mobile experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isInstalled ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          PWA is already installed on your device!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {installPrompt ? (
                          <Button onClick={installPWA} className="w-full" size="lg">
                            <Download className="w-4 h-4 mr-2" />
                            Install PWA
                          </Button>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Installation prompt not available. You can manually install by using your browser's "Add to Home Screen" option.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-5 h-5" />
                          <h4 className="font-semibold">Native App Experience</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Works like a native mobile app with full-screen experience
                        </p>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <WifiOff className="w-5 h-5" />
                          <h4 className="font-semibold">Offline Access</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Continue working even without internet connection
                        </p>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5" />
                          <h4 className="font-semibold">Fast Loading</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cached resources for lightning-fast loading times
                        </p>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-5 h-5" />
                          <h4 className="font-semibold">Push Notifications</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Receive important updates and notifications
                        </p>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Offline Mode Tab */}
              <TabsContent value="offline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <WifiOff className="w-5 h-5" />
                      Offline Functionality
                    </CardTitle>
                    <CardDescription>
                      Manage offline capabilities and cached data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Service Worker Status</h4>
                        <p className="text-sm text-muted-foreground">
                          {swStatus === 'active' ? 'Active and running' : 'Not active'}
                        </p>
                      </div>
                      <Badge variant={swStatus === 'active' ? 'default' : 'secondary'}>
                        {swStatus}
                      </Badge>
                    </div>

                    {swStatus !== 'active' && (
                      <Button onClick={registerServiceWorker} className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Enable Offline Mode
                      </Button>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Cache Usage</span>
                        <span className="text-sm text-muted-foreground">{cacheSize} MB</span>
                      </div>
                      <Progress value={Math.min(cacheSize * 10, 100)} />
                    </div>

                    <Button 
                      onClick={clearCache} 
                      variant="outline" 
                      className="w-full"
                      disabled={cacheSize === 0}
                    >
                      Clear Cache
                    </Button>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        Current connection status: <strong>{isOnline ? 'Online' : 'Offline'}</strong>
                        {!isOnline && ' - You are currently using cached data.'}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Push Notifications
                    </CardTitle>
                    <CardDescription>
                      Manage push notification settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Enable Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about orders, promotions, and more
                        </p>
                      </div>
                      <Switch 
                        checked={notifications}
                        onCheckedChange={requestNotificationPermission}
                      />
                    </div>

                    {notifications && (
                      <Button onClick={testNotification} variant="outline" className="w-full">
                        <Bell className="w-4 h-4 mr-2" />
                        Test Notification
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Order Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Get notified when orders are ready
                        </p>
                        <Switch className="mt-2" defaultChecked />
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Promotions</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional offers and discounts
                        </p>
                        <Switch className="mt-2" defaultChecked />
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Low Stock Alerts</h4>
                        <p className="text-sm text-muted-foreground">
                          Get alerted when inventory is running low
                        </p>
                        <Switch className="mt-2" />
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">System Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Important system updates and maintenance
                        </p>
                        <Switch className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      PWA Settings
                    </CardTitle>
                    <CardDescription>
                      Configure PWA behavior and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Auto-Update</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically update the app when new versions are available
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Background Sync</h4>
                          <p className="text-sm text-muted-foreground">
                            Sync data in the background when connection is restored
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Offline Analytics</h4>
                          <p className="text-sm text-muted-foreground">
                            Track usage statistics even when offline
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Cache Optimization</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically optimize cache for better performance
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Storage Information</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Cache Size: {cacheSize} MB</p>
                        <p>Storage Quota: Unlimited</p>
                        <p>Last Updated: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default PWAApplication;
