
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useDevice } from '@/hooks/useDevice';

interface MobilePhotoCaptureProps {
  onPhotoCapture: (photoUri: string) => void;
  currentPhoto?: string;
  title?: string;
}

const MobilePhotoCapture = ({ onPhotoCapture, currentPhoto, title = 'เพิ่มรูปภาพ' }: MobilePhotoCaptureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(currentPhoto || null);
  const { takePhoto, pickImage, isLoading } = useCamera();
  const { isMobile, vibrate } = useDevice();

  const handleTakePhoto = async () => {
    await vibrate();
    const photo = await takePhoto();
    if (photo?.webPath) {
      setCapturedPhoto(photo.webPath);
      onPhotoCapture(photo.webPath);
    }
  };

  const handlePickImage = async () => {
    await vibrate();
    const photo = await pickImage();
    if (photo?.webPath) {
      setCapturedPhoto(photo.webPath);
      onPhotoCapture(photo.webPath);
    }
  };

  const handleRemovePhoto = async () => {
    await vibrate();
    setCapturedPhoto(null);
    onPhotoCapture('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-32 border-2 border-dashed">
          {capturedPhoto ? (
            <div className="relative w-full h-full">
              <img 
                src={capturedPhoto} 
                alt="Captured" 
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Camera className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{title}</span>
            </div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {capturedPhoto && (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <img 
                    src={capturedPhoto} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            {isMobile && (
              <Button 
                onClick={handleTakePhoto}
                disabled={isLoading}
                className="bg-coffee-600 hover:bg-coffee-700 h-12 text-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                ถ่ายรูป
              </Button>
            )}
            
            <Button 
              onClick={handlePickImage}
              disabled={isLoading}
              variant="outline"
              className="h-12 text-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              เลือกจากแกลเลอรี่
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsOpen(false)}
            variant="ghost" 
            className="w-full"
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobilePhotoCapture;
