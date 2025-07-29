
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useState } from 'react';
import { toast } from 'sonner';

interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  source?: CameraSource;
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  };

  const takePhoto = async (options: CameraOptions = {}) => {
    setIsLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        toast.error('กรุณาอนุญาตการใช้กล้อง');
        return null;
      }

      const photo = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || true,
        resultType: CameraResultType.Uri,
        source: options.source || CameraSource.Camera,
      });

      return photo;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.error('เกิดข้อผิดพลาดในการถ่ายรูป');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    setIsLoading(true);
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      return photo;
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('เกิดข้อผิดพลาดในการเลือกรูป');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const savePhoto = async (photo: Photo, filename: string) => {
    try {
      if (!photo.webPath) return null;

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const savedFile = await Filesystem.writeFile({
              path: `images/${filename}`,
              data: base64Data.split(',')[1],
              directory: Directory.Data,
            });
            resolve(savedFile.uri);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกรูป');
      return null;
    }
  };

  return {
    takePhoto,
    pickImage,
    savePhoto,
    isLoading,
  };
};
