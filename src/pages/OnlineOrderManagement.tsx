import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  Image, 
  Volume2, 
  Upload,
  CheckCircle,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

interface OnlineOrder {
  id: string;
  order_number: string;
  member_id: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
  order_source: string;
  receipt_image_url?: string;
  pickup_time?: string;
  customer_notes?: string;
  created_at: string;
  members?: {
    name: string;
    phone: string;
  };
  order_items?: Array<{
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface NotificationSettings {
  id: string;
  sound_enabled: boolean;
  selected_sound_id?: string;
  volume: number;
}

interface NotificationSound {
  id: string;
  name: string;
  file_url: string;
  is_active: boolean;
}

const OnlineOrderManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [notificationSounds, setNotificationSounds] = useState<NotificationSound[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const { toast: hookToast } = useToast();

  useEffect(() => {
    fetchOnlineOrders();
    fetchNotificationSettings();
    fetchNotificationSounds();
    setupRealtimeSubscription();
  }, []);

  const fetchOnlineOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        members (name, phone),
        order_items (menu_item_name, quantity, unit_price, total_price)
      `)
      .eq('order_source', 'online')
      .order('created_at', { ascending: false });

    if (error) {
      hookToast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลออเดอร์ได้', variant: 'destructive' });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const fetchNotificationSettings = async () => {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .single();

    if (!error && data) {
      setNotificationSettings(data);
    }
  };

  const fetchNotificationSounds = async () => {
    const { data, error } = await supabase
      .from('notification_sounds')
      .select('*')
      .order('created_at');

    if (!error) {
      setNotificationSounds(data || []);
    }
  };

  const playNotificationSound = async () => {
    if (!notificationSettings?.sound_enabled) return;

    try {
      const selectedSound = notificationSounds.find(
        sound => sound.id === notificationSettings.selected_sound_id
      );
      
      if (selectedSound) {
        const audio = new Audio(selectedSound.file_url);
        audio.volume = notificationSettings.volume;
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('online-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: 'order_source=eq.online'
        },
        (payload) => {
          console.log('New online order:', payload);
          
          // Show popup notification
          toast.success('มีออเดอร์ออนไลน์ใหม่!', {
            description: `ออเดอร์ #${payload.new?.order_number}`,
            duration: 5000,
            action: {
              label: 'ดูออเดอร์',
              onClick: () => fetchOnlineOrders()
            }
          });
          
          playNotificationSound();
          fetchOnlineOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    if (!notificationSettings) return;

    const { error } = await supabase
      .from('notification_settings')
      .update(updates)
      .eq('id', notificationSettings.id);

    if (error) {
      hookToast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัปเดตการตั้งค่าได้', variant: 'destructive' });
    } else {
      setNotificationSettings({ ...notificationSettings, ...updates });
      hookToast({ title: 'สำเร็จ', description: 'อัปเดตการตั้งค่าแล้ว' });
    }
  };

  const uploadSoundFile = async () => {
    if (!audioFile) {
      hookToast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกไฟล์เสียงก่อนอัพโหลด', variant: 'destructive' });
      return;
    }

    setUploading(true);

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      hookToast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกไฟล์เสียงเท่านั้น', variant: 'destructive' });
      setUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (audioFile.size > 5 * 1024 * 1024) {
      hookToast({ title: 'ข้อผิดพลาด', description: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)', variant: 'destructive' });
      setUploading(false);
      return;
    }

    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = audioFile.name.split('.').pop() || 'mp3';
      const fileName = `notification_sound_${timestamp}.${fileExtension}`;
      
      console.log('Uploading file:', fileName, 'Size:', audioFile.size);

      const { data, error } = await supabase.storage
        .from('notification-sounds')
        .upload(fileName, audioFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('notification-sounds')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);

      // Save sound file info to database
      const { error: insertError } = await supabase
        .from('notification_sounds')
        .insert({
          name: audioFile.name.replace(/\.[^/.]+$/, ''),
          file_url: urlData.publicUrl,
          is_active: true
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      hookToast({ title: 'สำเร็จ', description: 'อัปโหลดไฟล์เสียงแล้ว' });
      setAudioFile(null);
      
      // Reset file input
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        (input as HTMLInputElement).value = '';
      });
      
      fetchNotificationSounds();
    } catch (error: any) {
      console.error('Upload error:', error);
      hookToast({ 
        title: 'ข้อผิดพลาด', 
        description: error.message || 'ไม่สามารถอัปโหลดไฟล์เสียงได้', 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  };

  const testSound = async (soundId: string) => {
    const sound = notificationSounds.find(s => s.id === soundId);
    if (sound && notificationSettings) {
      try {
        // Stop current audio if playing
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          setCurrentAudio(null);
          setPlayingSound(null);
        }

        console.log('Testing sound:', sound.file_url);
        const audio = new Audio(sound.file_url);
        audio.volume = notificationSettings.volume;
        
        // Add event listeners to handle playback
        audio.addEventListener('canplaythrough', () => {
          console.log('Audio can play through');
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          hookToast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเล่นไฟล์เสียงได้', variant: 'destructive' });
          setPlayingSound(null);
          setCurrentAudio(null);
        });

        audio.addEventListener('ended', () => {
          setPlayingSound(null);
          setCurrentAudio(null);
        });

        setCurrentAudio(audio);
        setPlayingSound(soundId);
        await audio.play();
        hookToast({ title: 'เล่นเสียงสำเร็จ', description: `กำลังเล่น: ${sound.name}` });
      } catch (error: any) {
        console.error('Test sound error:', error);
        hookToast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเล่นเสียงได้', variant: 'destructive' });
        setPlayingSound(null);
        setCurrentAudio(null);
      }
    }
  };

  const stopSound = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingSound(null);
      hookToast({ title: 'หยุดเล่นเสียง', description: 'หยุดเล่นเสียงแล้ว' });
    }
  };

  const getStatusBadge = (order: OnlineOrder) => {
    const now = new Date();
    const pickupTime = order.pickup_time ? new Date(order.pickup_time) : null;
    
    if (pickupTime && pickupTime > now) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">รอรับสินค้า</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">พร้อมรับ</Badge>;
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
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
              page="online-orders"
            />
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600 mx-auto mb-4"></div>
                <p>กำลังโหลด...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            page="online-orders"
          />
          
          <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-coffee-800">จัดการออเดอร์ออนไลน์</h1>
                <p className="text-coffee-600">ออเดอร์ทั้งหมด {orders.length} รายการ</p>
              </div>
              
              <Button onClick={() => setShowSettings(true)} variant="outline">
                <Volume2 className="w-4 h-4 mr-2" />
                ตั้งค่าเสียง
              </Button>
            </div>

            {/* Orders Grid */}
            <div className="grid gap-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">ยังไม่มีออเดอร์ออนไลน์</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map(order => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">#{order.order_number}</h3>
                            {getStatusBadge(order)}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{order.members?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{order.members?.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {order.pickup_time 
                                  ? `รับสินค้า: ${new Date(order.pickup_time).toLocaleString('th-TH')}`
                                  : 'ไม่ระบุเวลา'
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">฿{order.total_amount}</p>
                          <p className="text-sm text-gray-600">{order.items_count} รายการ</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <FileText className="w-4 h-4 mr-1" />
                              รายละเอียด
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>รายละเอียดออเดอร์ #{order.order_number}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-4">
                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                                  <div>
                                    <h4 className="font-medium mb-2">ข้อมูลลูกค้า</h4>
                                    <p>ชื่อ: {selectedOrder.members?.name}</p>
                                    <p>เบอร์: {selectedOrder.members?.phone}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">เวลารับสินค้า</h4>
                                    <p>
                                      {selectedOrder.pickup_time 
                                        ? new Date(selectedOrder.pickup_time).toLocaleString('th-TH')
                                        : 'ไม่ระบุ'
                                      }
                                    </p>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h4 className="font-medium mb-3">รายการสินค้า</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.order_items?.map((item, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                                        <div>
                                          <p className="font-medium">{item.menu_item_name}</p>
                                          <p className="text-sm text-gray-600">฿{item.unit_price} x {item.quantity}</p>
                                        </div>
                                        <p className="font-bold">฿{item.total_price}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                      <span>ยอดรวม</span>
                                      <span className="text-green-600">฿{selectedOrder.total_amount}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {selectedOrder.customer_notes && (
                                  <div>
                                    <h4 className="font-medium mb-2">หมายเหตุ</h4>
                                    <p className="p-3 bg-yellow-50 rounded border">{selectedOrder.customer_notes}</p>
                                  </div>
                                )}

                                {/* Receipt */}
                                {selectedOrder.receipt_image_url && (
                                  <div>
                                    <h4 className="font-medium mb-2">สลีปการชำระเงิน</h4>
                                    <img 
                                      src={selectedOrder.receipt_image_url} 
                                      alt="Receipt" 
                                      className="max-w-full h-auto border rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {order.receipt_image_url && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Image className="w-4 h-4 mr-1" />
                                สลีป
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>สลีปการชำระเงิน</DialogTitle>
                              </DialogHeader>
                              <img 
                                src={order.receipt_image_url} 
                                alt="Receipt" 
                                className="max-w-full h-auto"
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Notification Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>ตั้งค่าเสียงแจ้งเตือน</DialogTitle>
                </DialogHeader>
                
                {notificationSettings && (
                  <div className="space-y-6">
                    {/* Enable/Disable Sound */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled">เปิดเสียงแจ้งเตือน</Label>
                      <Switch
                        id="sound-enabled"
                        checked={notificationSettings.sound_enabled}
                        onCheckedChange={(checked) => updateNotificationSettings({ sound_enabled: checked })}
                      />
                    </div>

                    {/* Volume Control */}
                    <div>
                      <Label htmlFor="volume">ระดับเสียง ({Math.round(notificationSettings.volume * 100)}%)</Label>
                      <Input
                        id="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={notificationSettings.volume}
                        onChange={(e) => updateNotificationSettings({ volume: parseFloat(e.target.value) })}
                        className="mt-2"
                      />
                    </div>

                    {/* Sound Selection */}
                    <div>
                      <Label>เลือกเสียงแจ้งเตือน</Label>
                      <div className="space-y-2 mt-2">
                        {notificationSounds.map(sound => (
                          <div key={sound.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="flex-1 text-sm">{sound.name}</span>
                            <div className="flex gap-2">
                              {playingSound === sound.id ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={stopSound}
                                >
                                  <Square className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => testSound(sound.id)}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant={notificationSettings.selected_sound_id === sound.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateNotificationSettings({ selected_sound_id: sound.id })}
                              >
                                {notificationSettings.selected_sound_id === sound.id ? 'ใช้งาน' : 'เลือก'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upload New Sound */}
                    <div className="space-y-2">
                      <Label htmlFor="audio-file">อัปโหลดเสียงใหม่</Label>
                      <div className="flex gap-2">
                        <Input
                          id="audio-file"
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          disabled={uploading}
                          className="flex-1"
                        />
                        <Button 
                          onClick={uploadSoundFile}
                          disabled={!audioFile || uploading}
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        รองรับไฟล์เสียง (MP3, WAV, OGG) ขนาดไม่เกิน 5MB
                      </p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineOrderManagement;
