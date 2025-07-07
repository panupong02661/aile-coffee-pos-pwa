import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ShoppingBag,
  DollarSign,
  Trash2,
  Bell,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

interface OnlineOrder {
  id: string;
  order_number: string;
  customer_id: string;
  items: any[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_type: string;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer_profiles?: {
    full_name: string;
    phone: string;
  };
}

interface NotificationSound {
  id: string;
  name: string;
  file_url: string;
  is_active: boolean;
}

interface NotificationSettings {
  id: string;
  sound_enabled: boolean;
  selected_sound_id?: string;
  volume: number;
  duration: number;
}

const OnlineOrderManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_orders')
        .select(`
          *,
          customer_profiles (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OnlineOrder[];
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      setNewOrderAlert(true);
      playNotificationSound();
      toast.success('มีออเดอร์ออนไลน์ใหม่!', {
        description: `ออเดอร์ ${orders[0]?.order_number} เข้ามาแล้ว`,
        duration: 5000,
      });
      
      setTimeout(() => setNewOrderAlert(false), 10000);
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  const { data: notificationSounds = [], isLoading: soundsLoading } = useQuery({
    queryKey: ['notification-sounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NotificationSound[];
    },
  });

  const { data: settingsData } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data as NotificationSettings | null;
    },
  });

  useEffect(() => {
    if (settingsData) {
      setNotificationSettings(settingsData);
    }
  }, [settingsData]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const stopAllSounds = () => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
    }
    setIsPlaying({});
  };

  const playBasicSound = async (soundName: string) => {
    try {
      stopAllSounds();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = (notificationSettings?.duration || 2) * 1000;
      const volume = notificationSettings?.volume || 0.8;
      
      let frequency = 800;
      
      switch (soundName) {
        case 'ระฆัง':
          frequency = 800;
          break;
        case 'กิ่งก่า':
          frequency = 1000;
          break;
        case 'แจ้งเตือน':
          frequency = 600;
          break;
        case 'ปลุก':
          frequency = 1200;
          break;
        case 'กระดิ่ง':
          frequency = 900;
          break;
        case 'ออด':
          frequency = 400;
          break;
        default:
          frequency = 800;
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
      
      setIsPlaying(prev => ({ ...prev, [soundName]: true }));
      
      setTimeout(() => {
        setIsPlaying(prev => ({ ...prev, [soundName]: false }));
      }, duration);
      
    } catch (error) {
      console.error('Error playing basic sound:', error);
      toast.error('ไม่สามารถเล่นเสียงได้');
    }
  };

  const playUploadedSound = async (soundUrl: string, soundName: string) => {
    try {
      stopAllSounds();
      
      const audio = new Audio();
      const duration = (notificationSettings?.duration || 2) * 1000;
      const volume = notificationSettings?.volume || 0.8;
      
      audio.volume = volume;
      audio.src = soundUrl;
      
      setIsPlaying(prev => ({ ...prev, [soundName]: true }));
      setPlayingAudio(audio);
      
      await audio.play();
      
      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
        setIsPlaying(prev => ({ ...prev, [soundName]: false }));
        setPlayingAudio(null);
      }, duration);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(prev => ({ ...prev, [soundName]: false }));
        setPlayingAudio(null);
      });
      
    } catch (error) {
      console.error('Error playing uploaded sound:', error);
      toast.error('ไม่สามารถเล่นเสียงได้');
      setIsPlaying(prev => ({ ...prev, [soundName]: false }));
      setPlayingAudio(null);
    }
  };

  const playInitialSound = async () => {
    try {
      stopAllSounds();
      
      const audio = new Audio('/sounds/default-notification.mp3');
      const duration = (notificationSettings?.duration || 2) * 1000;
      const volume = notificationSettings?.volume || 0.8;
      
      audio.volume = volume;
      
      setIsPlaying(prev => ({ ...prev, 'เสียงเริ่มต้น': true }));
      setPlayingAudio(audio);
      
      await audio.play();
      
      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
        setIsPlaying(prev => ({ ...prev, 'เสียงเริ่มต้น': false }));
        setPlayingAudio(null);
      }, duration);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(prev => ({ ...prev, 'เสียงเริ่มต้น': false }));
        setPlayingAudio(null);
      });
      
    } catch (error) {
      console.error('Error playing initial sound:', error);
      toast.error('ไม่สามารถเล่นเสียงเริ่มต้นได้');
      setIsPlaying(prev => ({ ...prev, 'เสียงเริ่มต้น': false }));
      setPlayingAudio(null);
    }
  };

  const playNotificationSound = async () => {
    if (!notificationSettings?.sound_enabled) return;

    const selectedSound = notificationSettings.selected_sound_id;
    const basicSounds = ['ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด'];

    if (basicSounds.includes(selectedSound)) {
      await playBasicSound(selectedSound);
    } else if (selectedSound === 'initial') {
      await playInitialSound();
    } else {
      const sound = notificationSounds.find(s => s.id === selectedSound);
      if (sound) {
        await playUploadedSound(sound.file_url, sound.name);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast.error('รองรับเฉพาะไฟล์เสียง MP3, WAV, OGG เท่านั้น');
        return;
      }

      if (file.size > maxSize) {
        toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setUploadedFile(file);
    }
  };

  const uploadSound = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `notification-sounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notification-sounds')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('notification-sounds')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('notification_sounds')
        .insert({
          name: uploadedFile.name.replace(/\.[^/.]+$/, ''),
          file_url: data.publicUrl,
          is_active: false
        });

      if (dbError) throw dbError;

      toast.success('อัปโหลดเสียงสำเร็จ');
      setUploadedFile(null);
      queryClient.invalidateQueries({ queryKey: ['notification-sounds'] });
    } catch (error) {
      console.error('Error uploading sound:', error);
      toast.error('ไม่สามารถอัปโหลดเสียงได้');
    }
    setIsUploading(false);
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      if (notificationSettings?.id) {
        const { error } = await supabase
          .from('notification_settings')
          .update(updates)
          .eq('id', notificationSettings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('notification_settings')
          .insert(updates)
          .select()
          .single();

        if (error) throw error;
        setNotificationSettings(data);
      }

      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('บันทึกการตั้งค่าสำเร็จ');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  const selectBasicSound = async (soundName: string) => {
    try {
      const updates = {
        selected_sound_id: soundName,
        sound_enabled: true
      };

      await updateNotificationSettings(updates);
      
      setNotificationSettings(prev => prev ? {
        ...prev,
        selected_sound_id: soundName,
        sound_enabled: true
      } : null);

      toast.success(`เลือกเสียง "${soundName}" สำเร็จ`);
    } catch (error) {
      console.error('Error selecting basic sound:', error);
      toast.error('ไม่สามารถเลือกเสียงได้');
    }
  };

  const selectUploadedSound = async (soundId: string) => {
    try {
      await updateNotificationSettings({
        selected_sound_id: soundId,
        sound_enabled: true
      });
      
      toast.success('เลือกเสียงสำเร็จ');
    } catch (error) {
      console.error('Error selecting uploaded sound:', error);
      toast.error('ไม่สามารถเลือกเสียงได้');
    }
  };

  const deleteSound = async (soundId: string) => {
    try {
      const { error } = await supabase
        .from('notification_sounds')
        .delete()
        .eq('id', soundId);

      if (error) throw error;

      toast.success('ลบเสียงสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['notification-sounds'] });
    } catch (error) {
      console.error('Error deleting sound:', error);
      toast.error('ไม่สามารถลบเสียงได้');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const basicSounds = [
    'ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'preparing': return 'กำลังเตรียม';
      case 'ready': return 'พร้อมรับ';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <div className="h-screen bg-cream-50 flex">
      <MainSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
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
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">จัดการออเดอร์ออนไลน์</h1>
            <div className="flex items-center gap-4">
              {newOrderAlert && (
                <Alert className="bg-red-50 border-red-200 animate-pulse">
                  <Bell className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    มีออเดอร์ออนไลน์ใหม่เข้ามา!
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewOrderAlert(false)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              )}
              <Button
                onClick={() => setIsSoundSettingsOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                ตั้งค่าเสียงแจ้งเตือน
              </Button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีออเดอร์ออนไลน์</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            #{order.order_number}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {order.customer_profiles?.full_name || 'ไม่ระบุชื่อ'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(order.created_at).toLocaleString('th-TH')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.order_status)}>
                            {getStatusText(order.order_status)}
                          </Badge>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            ฿{order.total_amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span>รายการ: {order.items.length} รายการ</span>
                          <span>การชำระเงิน: {order.payment_method}</span>
                          <span>ประเภท: {order.delivery_type === 'pickup' ? 'รับเอง' : 'ส่งถึงที่'}</span>
                        </div>
                        {order.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>หมายเหตุ:</strong> {order.notes}
                          </div>
                        )}
                        <div className="flex space-x-2 mt-4">
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            ยืนยัน
                          </Button>
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            กำลังทำ
                          </Button>
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            พร้อมส่ง
                          </Button>
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            size="sm"
                            variant="outline"
                          >
                            เสร็จสิ้น
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sound Settings Dialog */}
      <Dialog open={isSoundSettingsOpen} onOpenChange={setIsSoundSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ตั้งค่าเสียงแจ้งเตือนออเดอร์ออนไลน์</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">เปิดใช้งานเสียงแจ้งเตือน</Label>
                <Switch
                  id="sound-enabled"
                  checked={notificationSettings?.sound_enabled || false}
                  onCheckedChange={(checked) => updateNotificationSettings({ sound_enabled: checked })}
                />
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <Label>ระดับเสียง</Label>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4" />
                  <Slider
                    value={[notificationSettings?.volume || 0.8]}
                    onValueChange={([value]) => updateNotificationSettings({ volume: value })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>

              {/* Duration Control */}
              <div className="space-y-2">
                <Label>ระยะเวลาเล่น (วินาที)</Label>
                <Slider
                  value={[notificationSettings?.duration || 2]}
                  onValueChange={([value]) => updateNotificationSettings({ duration: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 text-center">
                  {notificationSettings?.duration || 2} วินาที
                </div>
              </div>

              {/* Basic Sounds */}
              <div className="space-y-3">
                <Label className="text-base font-medium">เสียงพื้นฐาน</Label>
                <div className="grid grid-cols-2 gap-3">
                  {basicSounds.map((sound) => (
                    <div key={sound} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{sound}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playBasicSound(sound)}
                          disabled={isPlaying[sound]}
                        >
                          {isPlaying[sound] ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => selectBasicSound(sound)}
                          variant={notificationSettings?.selected_sound_id === sound ? "default" : "outline"}
                        >
                          เลือก
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Sounds */}
              <div className="space-y-3">
                <Label className="text-base font-medium">เสียงที่อัพโหลด</Label>
                
                {/* Initial Sound */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">เสียงเริ่มต้น</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={playInitialSound}
                      disabled={isPlaying['เสียงเริ่มต้น']}
                    >
                      {isPlaying['เสียงเริ่มต้น'] ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => selectUploadedSound('initial')}
                      variant={notificationSettings?.selected_sound_id === 'initial' ? "default" : "outline"}
                    >
                      เลือก
                    </Button>
                  </div>
                </div>

                {/* Custom uploaded sounds */}
                {notificationSounds.map((sound) => (
                  <div key={sound.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{sound.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playUploadedSound(sound.file_url, sound.name)}
                        disabled={isPlaying[sound.name]}
                      >
                        {isPlaying[sound.name] ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => selectUploadedSound(sound.id)}
                        variant={notificationSettings?.selected_sound_id === sound.id ? "default" : "outline"}
                      >
                        เลือก
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSound(sound.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload New Sound */}
              <div className="space-y-3">
                <Label className="text-base font-medium">อัปโหลดเสียงใหม่</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button
                    onClick={uploadSound}
                    disabled={!uploadedFile || isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    อัปโหลด
                  </Button>
                </div>
                {uploadedFile && (
                  <div className="text-sm text-gray-600">
                    ไฟล์ที่เลือก: {uploadedFile.name}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  รองรับไฟล์เสียง (MP3, WAV, OGG) ขนาดไม่เกิน 5MB
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button onClick={() => setIsSoundSettingsOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnlineOrderManagement;
