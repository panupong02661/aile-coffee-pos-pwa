
import { useState, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCw, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImage: string) => void;
  imageSrc: string;
}

const ImageCropper = ({ isOpen, onClose, onCrop, imageSrc }: ImageCropperProps) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(1);

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

  const handleRotateLeft = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(-90);
    }
  };

  const handleRotateRight = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotate(90);
    }
  };

  const handleZoomIn = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoom(0.1);
    }
  };

  const handleZoomOut = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.zoom(-0.1);
    }
  };

  const handleFlipHorizontal = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const imageData = cropper.getImageData();
      cropper.scaleX(imageData.scaleX === 1 ? -1 : 1);
    }
  };

  const handleFlipVertical = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const imageData = cropper.getImageData();
      cropper.scaleY(imageData.scaleY === 1 ? -1 : 1);
    }
  };

  const handleReset = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.reset();
    }
  };

  const handleAspectRatioChange = (value: string) => {
    const cropper = cropperRef.current?.cropper;
    let newRatio: number | undefined;
    
    switch (value) {
      case 'square':
        newRatio = 1;
        break;
      case 'landscape':
        newRatio = 16 / 9;
        break;
      case 'portrait':
        newRatio = 9 / 16;
        break;
      case 'photo':
        newRatio = 4 / 3;
        break;
      case 'free':
        newRatio = undefined;
        break;
      default:
        newRatio = 1;
    }
    
    setAspectRatio(newRatio);
    if (cropper) {
      cropper.setAspectRatio(newRatio || NaN);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>ครอปรูปภาพ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">อัตราส่วน:</span>
            <Select onValueChange={handleAspectRatioChange} defaultValue="square">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="เลือกอัตราส่วน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">สี่เหลี่ยมจัตุรัส (1:1)</SelectItem>
                <SelectItem value="landscape">แนวนอน (16:9)</SelectItem>
                <SelectItem value="portrait">แนวตั้ง (9:16)</SelectItem>
                <SelectItem value="photo">รูปถ่าย (4:3)</SelectItem>
                <SelectItem value="free">อิสระ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotateLeft}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              หมุนซ้าย
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotateRight}
              className="flex items-center gap-1"
            >
              <RotateCw className="w-4 h-4" />
              หมุนขวา
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="flex items-center gap-1"
            >
              <ZoomIn className="w-4 h-4" />
              ซูมเข้า
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="flex items-center gap-1"
            >
              <ZoomOut className="w-4 h-4" />
              ซูมออก
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFlipHorizontal}
              className="flex items-center gap-1"
            >
              <FlipHorizontal className="w-4 h-4" />
              พลิกนอน
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFlipVertical}
              className="flex items-center gap-1"
            >
              <FlipVertical className="w-4 h-4" />
              พลิกตั้ง
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1"
            >
              รีเซ็ต
            </Button>
          </div>

          {/* Cropper */}
          <div className="relative">
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: 500, width: '100%' }}
              aspectRatio={aspectRatio}
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
              minCropBoxHeight={50}
              minCropBoxWidth={50}
              autoCropArea={0.8}
              wheelZoomRatio={0.1}
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
