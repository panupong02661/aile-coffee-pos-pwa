
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Upload,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface NotificationSound {
  id: string;
  name: string;
  file_url: string;
  is_active: boolean;
}

interface NotificationSettings {
  id?: string;
  sound_enabled: boolean;
  selected_sound_id?: string;
  volume: number;
  duration: number;
}

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const queryClient = useQueryClient();

  const { data: notificationSounds = [] } = useQuery({
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

  const basicSounds = [
    'ระฆัง', 'กิ่งก่า', 'แจ้งเตือน', 'ปลุก', 'กระดิ่ง', 'ออด', 'ตีดๆๆๆ'
  ];

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
        case 'ระฆัง': frequency = 800; break;
        case 'กิ่งก่า': frequency = 1000; break;
        case 'แจ้งเตือน': frequency = 600; break;
        case 'ปลุก': frequency = 1200; break;
        case 'กระดิ่ง': frequency = 900; break;
        case 'ออด': frequency = 400; break;
        case 'ตีดๆๆๆ':
          const beepCount = 3;
          const beepDuration = 150;
          const beepInterval = 200;
          
          for (let i = 0; i < beepCount; i++) {
            const startTime = audioContext.currentTime + (i * beepInterval / 1000);
            const endTime = startTime + (beepDuration / 1000);
            
            const beepOscillator = audioContext.createOscillator();
            const beepGainNode = audioContext.createGain();
            
            beepOscillator.connect(beepGainNode);
            beepGainNode.connect(audioContext.destination);
            
            beepOscillator.frequency.setValueAtTime(800, startTime);
            beepOscillator.type = 'sine';
            
            beepGainNode.gain.setValueAtTime(0, startTime);
            beepGainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            beepGainNode.gain.setValueAtTime(volume, endTime - 0.01);
            beepGainNode.gain.linearRampToValueAtTime(0, endTime);
            
            beepOscillator.start(startTime);
            beepOscillator.stop(endTime);
          }
          
          setIsPlaying(prev => ({ ...prev, [soundName]: true }));
          setTimeout(() => {
            setIsPlaying(prev => ({ ...prev, [soundName]: false }));
          }, beepCount * beepInterval);
          return;
        default: frequency = 800;
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
      await updateNotificationSettings({
        selected_sound_id: soundName,
        sound_enabled: true
      });
      
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success(`เลือกเสียง "${soundName}" สำเร็จ`);
    } catch (error) {
      console.error('Error selecting basic sound:', error);
      toast.error('ไม่สามารถเลือกเสียงได้');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ตั้งค่าเสียงแจ้งเตือนออเดอร์ออนไลน์</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled">เปิดใช้งานเสียงแจ้งเตือน</Label>
              <Switch
                id="sound-enabled"
                checked={notificationSettings?.sound_enabled || false}
                onCheckedChange={(checked) => updateNotificationSettings({ sound_enabled: checked })}
              />
            </div>

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
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SoundSettingsModal;
