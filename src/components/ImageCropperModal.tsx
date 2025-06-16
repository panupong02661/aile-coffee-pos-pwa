
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropperModal = ({ isOpen, onClose, imageUrl, onCropComplete }: ImageCropperModalProps) => {
  const cropperRef = useRef<any>(null);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
      });
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.8);
      onCropComplete(croppedImageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>ครอปรูปภาพ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="max-h-96 overflow-hidden">
            <Cropper
              ref={cropperRef}
              src={imageUrl}
              style={{ height: 400, width: '100%' }}
              aspectRatio={1}
              guides={true}
              preview=".img-preview"
              viewMode={1}
              dragMode="move"
              scalable={true}
              cropBoxMovable={true}
              cropBoxResizable={true}
              background={false}
              autoCropArea={0.8}
              checkOrientation={false}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden">
              <div className="img-preview w-full h-full" />
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button onClick={handleCrop} className="bg-coffee-600 hover:bg-coffee-700">
                ใช้รูปนี้
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperModal;
