
import { useState, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
  imageSrc: string;
}

const ImageCropper = ({ isOpen, onClose, onCrop, imageSrc }: ImageCropperProps) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [loading, setLoading] = useState(false);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      setLoading(true);
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      const croppedImage = croppedCanvas.toDataURL('image/jpeg', 0.8);
      onCrop(croppedImage);
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>ครอปรูปภาพ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: 400, width: '100%' }}
              aspectRatio={1}
              guides={true}
              viewMode={1}
              dragMode="crop"
              scalable={true}
              cropBoxMovable={true}
              cropBoxResizable={true}
              toggleDragModeOnDblclick={false}
              background={false}
              responsive={true}
              restore={false}
              checkCrossOrigin={false}
              minCropBoxHeight={100}
              minCropBoxWidth={100}
            />
          </div>
          
          <div className="flex space-x-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handleCrop}
              disabled={loading}
              className="flex items-center gap-2 bg-coffee-600 hover:bg-coffee-700"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังครอป...' : 'ใช้รูปภาพนี้'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
