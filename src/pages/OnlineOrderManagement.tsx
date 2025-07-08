import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Phone,
  MapPin,
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

interface OnlineOrder {
  id: string;
  order_number: string;
  member_id: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
  created_at: string;
  customer_notes?: string;
  order_items?: Array<{
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    order_addons?: Array<{
      addon_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  }>;
  members?: {
    name: string;
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

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'all' | 'custom';

const OnlineOrderManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const queryClient = useQueryClient();

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          start: today.toISOString(),
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday.toISOString(),
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart.toISOString(),
          end: now.toISOString()
        };
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          start: monthStart.toISOString(),
          end: now.toISOString()
        };
      case 'this_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return {
          start: yearStart.toISOString(),
          end: now.toISOString()
        };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate).toISOString(),
            end: new Date(customEndDate + 'T23:59:59').toISOString()
          };
        }
        return null;
      default:
        return null;
    }
  };

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['online-orders', dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          members (
            name,
            phone
          ),
          order_items (
            menu_item_name,
            quantity,
            unit_price,
            total_price,
            order_addons (
              addon_name,
              quantity,
              unit_price,
              total_price
            )
          )
        `)
        .eq('order_source', 'online')
        .order('created_at', { ascending: false });

      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OnlineOrder[];
    },
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
  });

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

  const handleViewOrderDetail = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('อัปเดตสถานะออเดอร์สำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['online-orders'] });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('ไม่สามารถอัปเดตสถานะออเดอร์ได้');
    }
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
      const volume = Math.min((notificationSettings?.volume || 0.8) * 1.5, 1.0);
      
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

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
      const { data: existingSounds } = await supabase
        .from('notification_sounds')
        .select('*')
        .eq('is_active', true);

      // Deactivate all existing sounds
      if (existingSounds && existingSounds.length > 0) {
        await supabase
          .from('notification_sounds')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('notification-sounds')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      const { data: insertedSound, error: dbError } = await supabase
        .from('notification_sounds')
        .insert({
          name: uploadedFile.name.replace(/\.[^/.]+$/, ''),
          file_url: filePath,
          is_active: true // Set new sound as active immediately
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update notification settings to use the new sound
      await updateNotificationSettings({
        selected_sound_id: insertedSound.id,
        sound_enabled: true
      });

      toast.success('อัปโหลดเสียงสำเร็จและตั้งเป็นค่าเริ่มต้น');
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
      
      // Update local state immediately
      setNotificationSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('บันทึกการตั้งค่าสำเร็จ');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  const selectBasicSound = async (soundName: string) => {
    try {
      // Deactivate all uploaded sounds
      await supabase
        .from('notification_sounds')
        .update({ is_active: false })
        .eq('is_active', true);

      const updates = {
        selected_sound_id: soundName, // Use sound name as identifier for basic sounds
        sound_enabled: true
      };

      await updateNotificationSettings(updates);
      
      toast.success(`เลือกเสียง "${soundName}" สำเร็จ`);
    } catch (error) {
      console.error('Error selecting basic sound:', error);
      toast.error('ไม่สามารถเลือกเสียงได้');
    }
  };

  const selectUploadedSound = async (soundId: string) => {
    try {
      // Deactivate all sounds first
      await supabase
        .from('notification_sounds')
        .update({ is_active: false })
        .eq('is_active', true);

      // Activate the selected sound
      await supabase
        .from('notification_sounds')
        .update({ is_active: true })
        .eq('id', soundId);

      await updateNotificationSettings({
        selected_sound_id: soundId,
        sound_enabled: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['notification-sounds'] });
      toast.success('เลือกเสียงสำเร็จ');
    } catch (error) {
      console.error('Error selecting uploaded sound:', error);
      toast.error('ไม่สามารถเลือกเสียงได้');
    }
  };

  const deleteSound = async (soundId: string) => {
    try {
      // Get the sound data first
      const { data: soundData } = await supabase
        .from('notification_sounds')
        .select('file_url')
        .eq('id', soundId)
        .single();

      if (soundData) {
        // Delete from storage
        await supabase.storage
          .from('notification-sounds')
          .remove([soundData.file_url]);
      }

      // Delete from database
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

  const basicSounds = [
    'ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด'
  ];

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'เงินสด';
      case 'credit_card': return 'บัตรเครดิต';
      case 'promptpay': return 'พร้อมเพย์';
      case 'online': return 'ออนไลน์';
      default: return method;
    }
  };

  const getDateFilterText = () => {
    switch (dateFilter) {
      case 'today': return 'วันนี้';
      case 'yesterday': return 'เมื่อวาน';
      case 'this_week': return 'สัปดาห์นี้';
      case 'this_month': return 'เดือนนี้';
      case 'this_year': return 'ปีนี้';
      case 'custom': return 'กำหนดเอง';
      default: return 'ทั้งหมด';
    }
  };

  const ordersCount = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

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
            <Button
              onClick={() => setIsSoundSettingsOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่าเสียงแจ้งเตือน
            </Button>
          </div>

          {/* Date Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                ตัวกรองแสดงผล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-1">
                  <Label htmlFor="date-filter">ช่วงเวลา</Label>
                  <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="today">วันนี้</SelectItem>
                      <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                      <SelectItem value="this_week">สัปดาห์นี้</SelectItem>
                      <SelectItem value="this_month">เดือนนี้</SelectItem>
                      <SelectItem value="this_year">ปีนี้</SelectItem>
                      <SelectItem value="custom">กำหนดเอง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateFilter === 'custom' && (
                  <>
                    <div>
                      <Label htmlFor="start-date">วันที่เริ่มต้น</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">วันที่สิ้นสุด</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium mb-1">สรุป: {getDateFilterText()}</div>
                  <div className="flex gap-4">
                    <span>{ordersCount} ออเดอร์</span>
                    <span>฿{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <p className="text-gray-500">
                      {dateFilter === 'all' ? 'ยังไม่มีออเดอร์ออนไลน์' : `ไม่มีออเดอร์ในช่วง${getDateFilterText()}`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <ShoppingBag className="w-5 h-5 text-orange-500" />
                            #{order.order_number}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">ลูกค้า:</span>
                                <span>{order.members?.name || 'ไม่ระบุชื่อ'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span className="font-medium">เบอร์โทร:</span>
                                <span>{order.members?.phone || 'ไม่ระบุ'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">วันที่สั่ง:</span>
                                <span>{new Date(order.created_at).toLocaleString('th-TH')}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">รายการ:</span>
                                <span>{order.items_count} รายการ</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="font-medium">การชำระเงิน:</span>
                                <span>{getPaymentMethodText(order.payment_method)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {order.customer_notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                                <div>
                                  <span className="font-medium text-gray-700">หมายเหตุ:</span>
                                  <p className="text-gray-600 mt-1">{order.customer_notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-orange-600 mb-3 flex items-center justify-end">
                            <DollarSign className="w-5 h-5 mr-1" />
                            ฿{order.total_amount.toFixed(2)}
                          </div>
                          
                          <div className="space-y-2">
                            <Button
                              onClick={() => handleViewOrderDetail(order)}
                              size="sm"
                              variant="outline"
                              className="w-full"
                            >
                              ดูรายละเอียด
                            </Button>
                          </div>
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

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดออเดอร์ #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">ข้อมูลลูกค้า</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{selectedOrder.members?.name || 'ไม่ระบุชื่อ'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedOrder.members?.phone || 'ไม่ระบุ'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">ข้อมูลออเดอร์</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">การชำระเงิน: </span>
                      <span>{getPaymentMethodText(selectedOrder.payment_method)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">รายการสินค้า</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.menu_item_name}</p>
                          {item.order_addons && item.order_addons.length > 0 && (
                            <p className="text-sm text-gray-600">
                              + {item.order_addons.map(addon => addon.addon_name).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">฿{item.total_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">ไม่มีรายการสินค้า</p>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดสุทธิ:</span>
                  <span>฿{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
              
              {selectedOrder.customer_notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">หมายเหตุ</h3>
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    {selectedOrder.customer_notes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsOrderDetailOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label>ระดับเสียง ({Math.round((notificationSettings?.volume || 0.8) * 100)}%)</Label>
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
                <Label>ระยะเวลาเล่น ({notificationSettings?.duration || 2} วินาที)</Label>
                <Slider
                  value={[notificationSettings?.duration || 2]}
                  onValueChange={([value]) => updateNotificationSettings({ duration: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Basic Sounds */}
              <div className="space-y-3">
                <Label className="text-base font-medium">เสียงพื้นฐาน</Label>
                <div className="grid grid-cols-2 gap-3">
                  {basicSounds.map((sound) => (
                    <div key={sound} className={`flex items-center justify-between p-3 border rounded-lg ${
                      notificationSettings?.selected_sound_id === sound ? 'bg-orange-50 border-orange-300' : ''
                    }`}>
                      <span className="text-sm">{sound}</span>
                      <div className="flex items-center gap-2">
                        {notificationSettings?.selected_sound_id === sound && (
                          <CheckCircle className="w-4 h-4 text-orange-600" />
                        )}
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
                          {notificationSettings?.selected_sound_id === sound ? 'ใช้งาน' : 'เลือก'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Sounds */}
              <div className="space-y-3">
                <Label className="text-base font-medium">เสียงที่อัพโหลด</Label>
                
                {notificationSounds.map((sound) => (
                  <div key={sound.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                    sound.is_active ? 'bg-green-50 border-green-300' : ''
                  }`}>
                    <span className="text-sm">{sound.name}</span>
                    <div className="flex items-center gap-2">
                      {sound.is_active && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const fullUrl = `https://mzvzbxflwvksohrmxbsy.supabase.co/storage/v1/object/public/notification-sounds/${sound.file_url}`;
                          playUploadedSound(fullUrl, sound.name);
                        }}
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
                        variant={sound.is_active ? "default" : "outline"}
                      >
                        {sound.is_active ? 'ใช้งาน' : 'เลือก'}
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
                <Label className="text-base font-medium">อัพโหลดเสียงใหม่</Label>
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
                    {isUploading ? 'กำลังอัพโหลด...' : 'อัพโหลด'}
                  </Button>
                </div>
                {uploadedFile && (
                  <div className="text-sm text-gray-600">
                    ไฟล์ที่เลือก: {uploadedFile.name}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  รองรับไฟล์เสียง (MP3, WAV, OGG) ขนาดไม่เกิน 5MB • เมื่ออัพโหลดจะตั้งเป็นเสียงเริ่มต้นทันที
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
