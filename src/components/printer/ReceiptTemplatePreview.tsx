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
  orientation?: 'portrait' | 'landscape';
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  itemSpacing?: number;
  headerSize?: number;
  orderNumberSize?: number;
  itemNameSize?: number;
  addonSize?: number;
  showBorder?: boolean;
  borderThickness?: number;
  height?: number;
}

const ReceiptTemplatePreview = ({ 
  type, 
  fontSize, 
  paperWidth,
  orientation = 'portrait',
  paddingTop = 8,
  paddingBottom = 8,
  paddingLeft = 8,
  paddingRight = 8,
  itemSpacing = 12,
  headerSize = 20,
  orderNumberSize = 18,
  itemNameSize = 16,
  addonSize = 14,
  showBorder = true,
  borderThickness = 2,
  height = 80,
}: ReceiptTemplatePreviewProps) => {
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

  const renderShopReceipt = () => {
    const isLandscape = orientation === 'landscape';
    
    return (
      <div 
        className="bg-white font-mono text-black"
        style={{ 
          fontSize: `${fontSize}px`,
          width: isLandscape ? 'auto' : `${paperWidth}mm`,
          height: isLandscape ? `${paperWidth * 0.7}mm` : 'auto',
          lineHeight: '1.5',
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
          paddingLeft: `${paddingLeft}px`,
          paddingRight: `${paddingRight}px`,
          display: isLandscape ? 'flex' : 'block',
          flexDirection: isLandscape ? 'row' : 'column',
        }}
      >
        {isLandscape ? (
          // Landscape Layout
          <>
            <div className="flex-shrink-0 text-center border-r-2 border-black pr-3" style={{ width: '30%' }}>
              <div className="font-bold" style={{ fontSize: `${headerSize}px` }}>ใบครัว</div>
              <div className="font-bold mt-2" style={{ fontSize: `${orderNumberSize}px` }}>{sampleOrder.orderNumber}</div>
              <div className="text-xs mt-2">{new Date().toLocaleTimeString('th-TH')}</div>
              {sampleOrder.memberName && (
                <div className="font-bold mt-2 text-sm">{sampleOrder.memberName}</div>
              )}
            </div>
            <div className="flex-1 pl-3" style={{ gap: `${itemSpacing}px` }}>
              <div className="space-y-2">
                {sampleOrder.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-2"
                    style={{ 
                      border: showBorder ? `${borderThickness}px solid black` : 'none',
                      marginBottom: index < sampleOrder.items.length - 1 ? `${itemSpacing}px` : 0,
                    }}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span style={{ fontSize: `${itemNameSize}px` }}>{item.name}</span>
                      <span style={{ fontSize: `${itemNameSize * 1.3}px` }}>x{item.quantity}</span>
                    </div>
                    {item.addons && item.addons.length > 0 && (
                      <div className="mt-1 pl-2 space-y-0.5">
                        {item.addons.map((addon, i) => (
                          <div key={i} style={{ fontSize: `${addonSize}px` }}>✓ {addon}</div>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <div className="mt-1 p-1 bg-yellow-100 border border-yellow-400">
                        <div className="font-bold text-xs">⚠ {item.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Portrait Layout
          <>
            <div className="text-center" style={{ marginBottom: `${itemSpacing}px` }}>
              <div className="font-bold" style={{ fontSize: `${headerSize}px` }}>ใบสำหรับครัว</div>
              <div className="font-bold mt-1" style={{ fontSize: `${orderNumberSize}px` }}>{sampleOrder.orderNumber}</div>
              <div className="text-sm mt-1">{sampleOrder.date}</div>
            </div>

            <div className="border-t-2 border-black" style={{ marginTop: `${itemSpacing / 2}px`, marginBottom: `${itemSpacing / 2}px` }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {sampleOrder.items.map((item, index) => (
                <div 
                  key={index} 
                  className="p-2"
                  style={{ 
                    border: showBorder ? `${borderThickness}px solid black` : 'none',
                  }}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span style={{ fontSize: `${itemNameSize}px` }}>{item.name}</span>
                    <span style={{ fontSize: `${itemNameSize * 1.4}px` }}>x{item.quantity}</span>
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="mt-2 pl-2 space-y-1">
                      {item.addons.map((addon, i) => (
                        <div key={i} style={{ fontSize: `${addonSize}px` }}>✓ {addon}</div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400">
                      <div className="font-bold" style={{ fontSize: `${addonSize}px` }}>⚠ หมายเหตุ:</div>
                      <div style={{ fontSize: `${addonSize}px` }}>{item.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t-2 border-black" style={{ marginTop: `${itemSpacing}px`, marginBottom: `${itemSpacing / 2}px` }}></div>

            <div className="text-center">
              <div style={{ fontSize: `${fontSize}px` }}>เวลา: {new Date().toLocaleTimeString('th-TH')}</div>
              {sampleOrder.memberName && (
                <div className="font-bold mt-2" style={{ fontSize: `${fontSize}px` }}>สมาชิก: {sampleOrder.memberName}</div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSticker = () => {
    const isLandscape = orientation === 'landscape';
    
    return (
      <div 
        className="bg-white font-mono text-black"
        style={{ 
          fontSize: `${fontSize}px`,
          width: isLandscape ? `${height}mm` : `${paperWidth}mm`,
          height: isLandscape ? `${paperWidth}mm` : `${height}mm`,
          lineHeight: '1.3',
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
          paddingLeft: `${paddingLeft}px`,
          paddingRight: `${paddingRight}px`,
          border: showBorder ? `${borderThickness}px dashed black` : 'none',
          display: isLandscape ? 'flex' : 'block',
          flexDirection: isLandscape ? 'row' : 'column',
          gap: isLandscape ? `${itemSpacing}px` : 0,
        }}
      >
        {isLandscape ? (
          // Landscape Layout
          <>
            <div 
              className="text-center font-bold border-r-2 border-black flex-shrink-0 flex items-center justify-center"
              style={{ 
                fontSize: `${headerSize}px`,
                width: '25%',
                paddingRight: `${itemSpacing}px`,
              }}
            >
              <div className="transform -rotate-0">{sampleOrder.orderNumber}</div>
            </div>
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {sampleOrder.items.map((item, index) => (
                <div 
                  key={index} 
                  className="p-1"
                  style={{ 
                    border: showBorder ? `${Math.max(1, borderThickness - 1)}px solid black` : 'none',
                  }}
                >
                  <div className="font-bold flex justify-between items-center">
                    <span className="flex-1" style={{ fontSize: `${itemNameSize}px` }}>{item.name}</span>
                    <span style={{ fontSize: `${itemNameSize * 1.3}px` }} className="ml-2">x{item.quantity}</span>
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.addons.map((addon, i) => (
                        <div key={i} style={{ fontSize: `${addonSize}px` }}>• {addon}</div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-1 font-bold bg-yellow-200 p-1" style={{ fontSize: `${addonSize}px` }}>
                      ⚠ {item.notes}
                    </div>
                  )}
                </div>
              ))}
              {sampleOrder.memberName && (
                <div className="text-center border-t border-black pt-1" style={{ fontSize: `${addonSize}px` }}>
                  {sampleOrder.memberName}
                </div>
              )}
            </div>
          </>
        ) : (
          // Portrait Layout
          <>
            <div 
              className="text-center font-bold border-b-2 border-black pb-1"
              style={{ 
                fontSize: `${headerSize}px`,
                marginBottom: `${itemSpacing}px`,
              }}
            >
              {sampleOrder.orderNumber}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: `${itemSpacing}px` }}>
              {sampleOrder.items.map((item, index) => (
                <div 
                  key={index} 
                  className="p-1"
                  style={{ 
                    border: showBorder ? `${Math.max(1, borderThickness - 1)}px solid black` : 'none',
                  }}
                >
                  <div className="font-bold flex justify-between">
                    <span className="flex-1" style={{ fontSize: `${itemNameSize}px` }}>{item.name}</span>
                    <span style={{ fontSize: `${itemNameSize * 1.3}px` }} className="ml-2">x{item.quantity}</span>
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.addons.map((addon, i) => (
                        <div key={i} style={{ fontSize: `${addonSize}px` }}>• {addon}</div>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-1 font-bold bg-yellow-200 p-1" style={{ fontSize: `${addonSize}px` }}>
                      ⚠ {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {sampleOrder.memberName && (
              <div 
                className="text-center border-t border-black pt-1"
                style={{ 
                  fontSize: `${addonSize}px`,
                  marginTop: `${itemSpacing}px`,
                }}
              >
                {sampleOrder.memberName}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

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
