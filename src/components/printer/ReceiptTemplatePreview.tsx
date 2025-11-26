import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  addons?: string[];
  notes?: string;
}

interface ReceiptTemplatePreviewProps {
  type: 'customer' | 'shop' | 'sticker';
  fontSize: number;
  paperWidth: number;
}

const ReceiptTemplatePreview = ({ type, fontSize, paperWidth }: ReceiptTemplatePreviewProps) => {
  const sampleOrder = {
    orderNumber: 'ORD-001',
    date: new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    items: [
      {
        name: 'กาแฟลาเต้ร้อน',
        quantity: 2,
        price: 50,
        addons: ['เพิ่มช็อต 1 ช็อต', 'นมโอ๊ต'],
      },
      {
        name: 'เค้กช็อกโกแลต',
        quantity: 1,
        price: 85,
        notes: 'ไม่ใส่ครีม',
      },
    ],
    subtotal: 185,
    discount: 10,
    total: 175,
    payment: 'เงินสด',
    memberName: 'คุณสมชาย ใจดี',
    memberPoints: 350,
  };

  const renderCustomerReceipt = () => (
    <div 
      className="bg-white p-4 font-mono text-black"
      style={{ 
        fontSize: `${fontSize}px`,
        width: `${paperWidth}mm`,
        lineHeight: '1.5',
      }}
    >
      <div className="text-center mb-4">
        <div className="font-bold text-lg">ร้านกาแฟน่ารัก</div>
        <div className="text-sm">123 ถนนสุขุมวิท กรุงเทพฯ 10110</div>
        <div className="text-sm">โทร: 02-123-4567</div>
        <div className="border-t border-dashed border-gray-400 my-2"></div>
      </div>

      <div className="text-sm mb-2">
        <div>เลขที่: {sampleOrder.orderNumber}</div>
        <div>{sampleOrder.date}</div>
        {sampleOrder.memberName && (
          <div>สมาชิก: {sampleOrder.memberName}</div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="space-y-2">
        {sampleOrder.items.map((item, index) => (
          <div key={index} className="text-sm">
            <div className="flex justify-between">
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)}</span>
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="pl-4 text-xs text-gray-600">
                {item.addons.map((addon, i) => (
                  <div key={i}>+ {addon}</div>
                ))}
              </div>
            )}
            {item.notes && (
              <div className="pl-4 text-xs text-gray-600 italic">
                หมายเหตุ: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>รวมย่อย</span>
          <span>{sampleOrder.subtotal.toFixed(2)}</span>
        </div>
        {sampleOrder.discount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>ส่วนลด</span>
            <span>-{sampleOrder.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-dashed border-gray-400 my-1"></div>
        <div className="flex justify-between font-bold text-base">
          <span>รวมทั้งสิ้น</span>
          <span>{sampleOrder.total.toFixed(2)} บาท</span>
        </div>
        <div className="flex justify-between">
          <span>ชำระด้วย</span>
          <span>{sampleOrder.payment}</span>
        </div>
      </div>

      {sampleOrder.memberPoints && (
        <>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-sm text-center">
            <div>คะแนนสะสม: {sampleOrder.memberPoints} แต้ม</div>
            <div className="text-xs text-gray-600">ได้รับ +18 แต้ม</div>
          </div>
        </>
      )}

      <div className="border-t border-dashed border-gray-400 my-2"></div>
      <div className="text-center text-sm">
        <div>ขอบคุณที่ใช้บริการ</div>
        <div className="text-xs">กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน</div>
      </div>
    </div>
  );

  const renderShopReceipt = () => (
    <div 
      className="bg-white p-4 font-mono text-black"
      style={{ 
        fontSize: `${fontSize}px`,
        width: `${paperWidth}mm`,
        lineHeight: '1.5',
      }}
    >
      <div className="text-center mb-4">
        <div className="font-bold text-xl">ใบสำหรับครัว</div>
        <div className="text-lg font-bold">{sampleOrder.orderNumber}</div>
        <div className="text-sm">{sampleOrder.date}</div>
      </div>

      <div className="border-t-2 border-black my-2"></div>

      <div className="space-y-3">
        {sampleOrder.items.map((item, index) => (
          <div key={index} className="border-2 border-black p-2">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>{item.name}</span>
              <span className="text-2xl">x{item.quantity}</span>
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="mt-2 pl-2 space-y-1">
                {item.addons.map((addon, i) => (
                  <div key={i} className="text-base">✓ {addon}</div>
                ))}
              </div>
            )}
            {item.notes && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400">
                <div className="font-bold">⚠ หมายเหตุ:</div>
                <div className="text-base">{item.notes}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t-2 border-black my-3"></div>

      <div className="text-center text-lg">
        <div>เวลา: {new Date().toLocaleTimeString('th-TH')}</div>
        {sampleOrder.memberName && (
          <div className="font-bold mt-2">สมาชิก: {sampleOrder.memberName}</div>
        )}
      </div>
    </div>
  );

  const renderSticker = () => (
    <div 
      className="bg-white p-2 font-mono text-black border-2 border-dashed border-black"
      style={{ 
        fontSize: `${fontSize * 0.8}px`,
        width: `${paperWidth * 0.7}mm`,
        lineHeight: '1.3',
      }}
    >
      <div className="text-center font-bold text-lg border-b-2 border-black pb-1 mb-2">
        {sampleOrder.orderNumber}
      </div>

      <div className="space-y-2">
        {sampleOrder.items.map((item, index) => (
          <div key={index} className="border border-black p-1">
            <div className="font-bold flex justify-between">
              <span className="flex-1">{item.name}</span>
              <span className="text-xl ml-2">x{item.quantity}</span>
            </div>
            {item.addons && item.addons.length > 0 && (
              <div className="mt-1 text-xs space-y-0.5">
                {item.addons.map((addon, i) => (
                  <div key={i}>• {addon}</div>
                ))}
              </div>
            )}
            {item.notes && (
              <div className="mt-1 text-xs font-bold bg-yellow-200 p-1">
                ⚠ {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {sampleOrder.memberName && (
        <div className="mt-2 text-center text-xs border-t border-black pt-1">
          {sampleOrder.memberName}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex justify-center py-4">
      <ScrollArea className="h-[600px] w-full">
        <div className="flex justify-center">
          {type === 'customer' && renderCustomerReceipt()}
          {type === 'shop' && renderShopReceipt()}
          {type === 'sticker' && renderSticker()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ReceiptTemplatePreview;
