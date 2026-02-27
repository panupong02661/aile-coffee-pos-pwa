import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  prize_type: string;
  prize_value: number;
  probability_weight: number;
}

interface SpinWheelProps {
  prizes: Prize[];
  onSpin: () => Promise<{ selectedPrize: Prize; claimCode: string } | null>;
  disabled?: boolean;
  themeColor?: string;
  spinning?: boolean;
}

const COLORS = [
  '#E53935', '#FB8C00', '#FDD835', '#43A047',
  '#1E88E5', '#8E24AA', '#F06292', '#26A69A',
  '#5C6BC0', '#FF7043',
];

const SpinWheel = ({ prizes, onSpin, disabled, themeColor }: SpinWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ prize: Prize; code: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segments = prizes.length > 0 ? prizes : [{ id: '0', name: 'ไม่มีรางวัล', prize_type: 'no_prize', prize_value: 0, probability_weight: 1 }];
  const segmentAngle = 360 / segments.length;

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    segments.forEach((prize, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      ctx.rotate(textAngle);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, Math.min(14, 160 / segments.length))}px sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;

      const label = prize.name.length > 10 ? prize.name.slice(0, 9) + '…' : prize.name;
      ctx.fillText(label, radius - 16, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, Math.PI * 2);
    ctx.fillStyle = themeColor || 'hsl(var(--primary))';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.fillText('SPIN', center, center);
  }, [segments, themeColor]);

  const handleSpin = async () => {
    if (isSpinning || disabled) return;
    setIsSpinning(true);
    setShowResult(false);

    // Call the spin logic first to get the result
    const spinResult = await onSpin();

    if (!spinResult) {
      setIsSpinning(false);
      return;
    }

    // Find the index of the winning prize
    const winIndex = segments.findIndex(p => p.id === spinResult.selectedPrize.id);
    
    // Calculate target rotation:
    // The pointer is at top (12 o'clock position = 0°)
    // We need the winning segment to land under the pointer
    // Segment i is at angle (i * segmentAngle) from start
    // We want the center of that segment under the pointer
    const targetSegmentCenter = winIndex * segmentAngle + segmentAngle / 2;
    // Wheel rotates clockwise, so we need (360 - targetSegmentCenter) to bring it to top
    const targetAngle = 360 - targetSegmentCenter;
    // Add multiple full rotations for dramatic effect (5-8 spins)
    const fullSpins = (5 + Math.random() * 3) * 360;
    const finalRotation = rotation + fullSpins + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    // Wait for animation to complete (4.5s matches CSS transition)
    setTimeout(() => {
      setResult({ prize: spinResult.selectedPrize, code: spinResult.claimCode });
      setShowResult(true);
      setIsSpinning(false);
    }, 4800);
  };

  const getPrizeLabel = (type: string, value: number) => {
    switch (type) {
      case 'discount_percent': return `ส่วนลด ${value}%`;
      case 'discount_fixed': return `ส่วนลด ${value} บาท`;
      case 'free_item': return 'แถมสินค้า';
      case 'free_drink': return 'เครื่องดื่มฟรี';
      case 'bonus_points': return `แต้มโบนัส +${value}`;
      case 'coupon': return 'คูปอง';
      case 'no_prize': return 'เสียใจด้วย';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pointer triangle at top */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: `20px solid ${themeColor || 'hsl(var(--primary))'}`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        {/* Wheel container */}
        <div
          className="rounded-full shadow-2xl border-4 border-background"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
              : 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-full"
          />
        </div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        className="w-full max-w-[280px] text-lg py-6 font-bold"
        style={{ backgroundColor: themeColor || undefined }}
      >
        {isSpinning ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังหมุน...</>
        ) : (
          <>🎡 หมุนวงล้อ</>
        )}
      </Button>

      {/* Result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 ยินดีด้วย!</DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-4 py-4">
              <div className="text-5xl animate-bounce">🎁</div>
              <p className="text-xl font-bold text-primary">{result.prize.name}</p>
              <p className="text-muted-foreground">
                {getPrizeLabel(result.prize.prize_type, result.prize.prize_value)}
              </p>
              <div className="bg-accent rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">รหัสรับรางวัล</p>
                <p className="font-mono text-lg font-bold tracking-wider">{result.code}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                นำรหัสนี้ไปใช้ที่หน้าร้านเพื่อรับสิทธิ์
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpinWheel;
