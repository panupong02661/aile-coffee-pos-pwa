import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/types';

interface TaxInvoicePreviewProps {
  cartItems: CartItem[];
  totalAmount: number;
  discountAmount: number;
}

const TaxInvoicePreview = ({ cartItems, totalAmount, discountAmount }: TaxInvoicePreviewProps) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerTaxId, setBuyerTaxId] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerBranch, setBuyerBranch] = useState('สำนักงานใหญ่');

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const vatRate = 7;
  const amountBeforeVat = Math.round(totalAmount / (1 + vatRate / 100));
  const vatAmount = totalAmount - amountBeforeVat;

  const now = new Date();
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543}`;

  return (
    <div className="space-y-2">
      {/* Buyer Info Form */}
      <div className="space-y-1.5 p-2 bg-muted/30 rounded-lg">
        <p className="text-xs font-semibold text-foreground">ข้อมูลผู้ซื้อ</p>
        <Input placeholder="ชื่อ/บริษัท" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="h-7 text-xs" />
        <Input placeholder="เลขประจำตัวผู้เสียภาษี" value={buyerTaxId} onChange={e => setBuyerTaxId(e.target.value)} className="h-7 text-xs" />
        <Input placeholder="ที่อยู่" value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} className="h-7 text-xs" />
        <Input placeholder="สาขา" value={buyerBranch} onChange={e => setBuyerBranch(e.target.value)} className="h-7 text-xs" />
      </div>

      {/* Invoice Preview */}
      <Card className="bg-white shadow-sm border">
        <CardContent className="p-3 space-y-2">
          <div className="text-center border-b border-dashed pb-2">
            <h3 className="text-sm font-bold text-foreground">ใบกำกับภาษี / Tax Invoice</h3>
            <p className="text-[10px] text-muted-foreground">เลขที่: INV-{now.getFullYear()}{String(now.getMonth()+1).padStart(2,'0')}{String(now.getDate()).padStart(2,'0')}-{String(now.getHours()).padStart(2,'0')}{String(now.getMinutes()).padStart(2,'0')}</p>
            <p className="text-[10px] text-muted-foreground">วันที่: {dateStr}</p>
          </div>

          {/* Seller */}
          <div className="text-[10px] text-muted-foreground">
            <p className="font-semibold text-foreground">ผู้ขาย:</p>
            <p>Aile Coffee</p>
          </div>

          {/* Buyer */}
          {buyerName && (
            <div className="text-[10px] text-muted-foreground">
              <p className="font-semibold text-foreground">ผู้ซื้อ:</p>
              <p>{buyerName}</p>
              {buyerTaxId && <p>เลขผู้เสียภาษี: {buyerTaxId}</p>}
              {buyerAddress && <p>{buyerAddress}</p>}
              {buyerBranch && <p>สาขา: {buyerBranch}</p>}
            </div>
          )}

          <Separator />

          {/* Items Table */}
          <div className="space-y-0.5">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 text-[9px] font-semibold text-foreground border-b pb-0.5">
              <span>รายการ</span>
              <span className="text-right w-8">จำนวน</span>
              <span className="text-right w-12">ราคา</span>
              <span className="text-right w-14">รวม</span>
            </div>
            {cartItems.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-1 text-[9px] text-muted-foreground">
                <span className="truncate">{item.menu_item.name}</span>
                <span className="text-right w-8">{item.quantity}</span>
                <span className="text-right w-12">฿{item.menu_item.price}</span>
                <span className="text-right w-14">฿{item.total_price.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-0.5 text-[10px]">
            {discountAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>ส่วนลด</span>
                <span>-฿{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>มูลค่าก่อน VAT</span>
              <span>฿{amountBeforeVat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT {vatRate}%</span>
              <span>฿{vatAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground text-xs border-t pt-1">
              <span>ยอดรวมทั้งสิ้น</span>
              <span>฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center text-[8px] text-muted-foreground border-t border-dashed pt-1 mt-1">
            <p>ใบกำกับภาษีนี้ออกโดยระบบ POS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxInvoicePreview;
