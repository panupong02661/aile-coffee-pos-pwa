import { Check, Leaf, Sparkles } from 'lucide-react';

export interface AddonDisplayConfig {
  fontSize: string;
  fontWeight: string;
  textColor: string;
  backgroundColor: string;
  selectedTextColor: string;
  selectedBackgroundColor: string;
  borderRadius: string;
  minHeight: string;
}

export const defaultAddonConfig: AddonDisplayConfig = {
  fontSize: '14',
  fontWeight: 'bold',
  textColor: '#5d4a3f',
  backgroundColor: '#ffffff',
  selectedTextColor: '#ffffff',
  selectedBackgroundColor: '#6f4e37',
  borderRadius: '8',
  minHeight: '52',
};

export const ADDON_STYLES = [
  { id: 1, name: 'คลาสสิก', description: 'ปุ่มสี่เหลี่ยม เต็มสี เมื่อเลือก' },
  { id: 2, name: 'พิลล์ / ชิป', description: 'ทรงกลมมน แบบชิป เบา ๆ ทันสมัย' },
  { id: 3, name: 'การ์ดติ๊กถูก', description: 'การ์ด มีเครื่องหมายถูกมุมขวาบน' },
  { id: 4, name: 'มินิมอลขีดเส้นใต้', description: 'พื้นโปร่ง มีขีดใต้ตอนถูกเลือก' },
  { id: 5, name: 'นุ่มนีโอมอร์ฟิก', description: 'เงานุ่ม กดลงเมื่อเลือก' },
  { id: 6, name: 'ไล่สีสวย', description: 'พื้นไล่สีเมื่อถูกเลือก' },
  { id: 7, name: 'สไตล์คูปอง', description: 'ขอบเส้นประ แบบตั๋ว/คูปอง' },
  { id: 8, name: 'กรอบเน้นซ้าย', description: 'แถบสีด้านซ้าย เมื่อเลือก' },
  { id: 9, name: 'คลาสสิกกาแฟวินเทจ', description: 'พื้นครีม ขอบน้ำตาลเข้ม สไตล์ร้านกาแฟเก่า' },
  { id: 10, name: 'มินิมอลไลน์', description: 'เส้นบางสะอาด ขาว-ดำ สงบเรียบง่าย' },
  { id: 11, name: 'พาสเทลไล่สีนุ่ม', description: 'ชมพู-ฟ้า-ม่วง อ่อนหวาน' },
  { id: 12, name: 'นีโอมอร์ฟิก 3D', description: 'ปุ่มนูนแบบเงาลึก กดยุบเมื่อเลือก' },
  { id: 13, name: 'กลาสมอร์ฟิกไซเบอร์', description: 'พื้นเข้ม แก้วฝ้า เรืองแสงไซแอน' },
  { id: 14, name: 'บรูทัลลิสต์', description: 'ขอบดำหนา คมชัด เต็มสีส้ม เมื่อเลือก' },
  { id: 15, name: 'ญี่ปุ่นเซน', description: 'พื้นกระดาษ ตัวอักษรหมึก จุดตราแดง' },
  { id: 16, name: 'เรโทรพิกเซล', description: '8-บิต แบบเกมอาร์เขต ขอบพิกเซล' },
  { id: 17, name: 'ลักซ์ชูรี่โกลด์', description: 'พื้นดำ ตัวอักษรทอง หรูหรา' },
  { id: 18, name: 'ธรรมชาติออร์แกนิก', description: 'เขียวเซจ ครีม พร้อมใบไม้เล็ก ๆ' },
  { id: 19, name: 'ลอย (Floating)', description: 'ปุ่มลอยด้วยเงาซ้อน ยกขึ้นเมื่อเลือก' },
  { id: 20, name: 'ขั้นตอนตัวเลข', description: 'มีตัวเลขวงกลมนำ แบบนิตยสาร' },
  { id: 21, name: 'ป้ายซ้าย', description: 'จุดสีด้านซ้าย + ตัวอักษรชิดซ้าย' },
] as const;

export const ADDON_STYLE_STORAGE_KEY = 'addonStyleId';

export const getSavedAddonStyleId = (): number => {
  const saved = localStorage.getItem(ADDON_STYLE_STORAGE_KEY);
  const parsed = saved ? parseInt(saved) : 1;
  return parsed >= 1 && parsed <= 21 ? parsed : 1;
};

interface Props {
  name: string;
  price: number;
  selected: boolean;
  onClick: () => void;
  styleId: number;
  config: AddonDisplayConfig;
}

const AddonOption = ({ name, price, selected, onClick, styleId, config }: Props) => {
  const fontWeight =
    config.fontWeight === 'normal' ? 400 :
    config.fontWeight === 'medium' ? 500 :
    config.fontWeight === 'semibold' ? 600 : 700;
  const fontSize = `${config.fontSize}px`;
  const priceFontSize = `${Math.max(parseInt(config.fontSize) - 2, 10)}px`;
  const minHeight = `${config.minHeight}px`;
  const radius = `${config.borderRadius}px`;
  const priceText = price > 0 ? `+฿${price}` : (price < 0 ? `-฿${Math.abs(price)}` : '');

  const baseFg = selected ? config.selectedTextColor : config.textColor;
  const baseBg = selected ? config.selectedBackgroundColor : config.backgroundColor;
  const accent = config.selectedBackgroundColor;

  // Style 1 — Classic
  if (styleId === 1) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 border transition-all hover:opacity-80 flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight, color: baseFg, backgroundColor: baseBg,
          borderRadius: radius, borderColor: selected ? accent : '#e5e7eb',
        }}
      >
        <span className="truncate w-full">{name}</span>
        <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? '#fed7aa' : '#ea580c', minHeight: '1em' }}>
          {priceText || '\u00A0'}
        </span>
      </button>
    );
  }

  // Style 2 — Pill / Chip
  if (styleId === 2) {
    return (
      <button
        onClick={onClick}
        className="px-3 py-2 border-2 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight, color: baseFg, backgroundColor: baseBg,
          borderRadius: '999px', borderColor: selected ? accent : '#e5e7eb',
        }}
      >
        <span className="truncate w-full text-center">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? '#fed7aa' : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 3 — Card with Check Badge
  if (styleId === 3) {
    return (
      <button
        onClick={onClick}
        className="relative text-center p-2 border-2 transition-all flex flex-col items-center justify-center gap-0.5 hover:shadow-md"
        style={{
          minHeight, fontSize, fontWeight, color: baseFg, backgroundColor: baseBg,
          borderRadius: radius, borderColor: selected ? accent : '#e5e7eb',
          boxShadow: selected ? `0 4px 12px ${accent}30` : undefined,
        }}
      >
        {selected && (
          <span
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: accent, color: config.selectedTextColor }}
          >
            <Check className="w-3 h-3" strokeWidth={3} />
          </span>
        )}
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? accent : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 4 — Minimal Underline
  if (styleId === 4) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5 border-b-2"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? accent : config.textColor,
          backgroundColor: 'transparent',
          borderColor: selected ? accent : 'transparent',
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? accent : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 5 — Soft Neumorphic
  if (styleId === 5) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? accent : config.textColor,
          backgroundColor: '#f3ede4',
          borderRadius: radius,
          border: 'none',
          boxShadow: selected
            ? `inset 3px 3px 6px #d6ccbf, inset -3px -3px 6px #ffffff`
            : `3px 3px 6px #d6ccbf, -3px -3px 6px #ffffff`,
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? accent : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 6 — Gradient Fill
  if (styleId === 6) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 border transition-all hover:opacity-90 flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? config.selectedTextColor : config.textColor,
          background: selected
            ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
            : config.backgroundColor,
          borderRadius: radius,
          borderColor: selected ? 'transparent' : '#e5e7eb',
          boxShadow: selected ? `0 6px 16px ${accent}55` : undefined,
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? '#fed7aa' : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 7 — Ticket / Coupon
  if (styleId === 7) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: baseFg,
          backgroundColor: baseBg,
          borderRadius: radius,
          border: `2px dashed ${selected ? accent : '#d1c7b8'}`,
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span
            className="px-1.5 rounded"
            style={{
              fontSize: priceFontSize, fontWeight: 700,
              color: selected ? accent : '#ea580c',
              backgroundColor: selected ? '#ffffff' : '#fff4e6',
            }}
          >{priceText}</span>
        )}
      </button>
    );
  }

  // Style 8 — Left Accent Bar
  if (styleId === 8) {
    return (
      <button
        onClick={onClick}
        className="relative text-center p-2 border transition-all flex flex-col items-center justify-center gap-0.5 overflow-hidden"
        style={{
          minHeight, fontSize, fontWeight,
          color: baseFg, backgroundColor: baseBg,
          borderRadius: radius, borderColor: selected ? accent : '#e5e7eb',
        }}
      >
        <span
          className="absolute left-0 top-0 bottom-0 transition-all"
          style={{ width: selected ? '5px' : '0px', backgroundColor: accent }}
        />
        <span className="truncate w-full pl-1">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? accent : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 9 — Vintage Coffee Card
  if (styleId === 9) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#fff8ec' : '#5b3a1e',
          background: selected ? '#5b3a1e' : '#f5ead2',
          borderRadius: radius,
          border: `2px double ${selected ? '#f5ead2' : '#5b3a1e'}`,
          fontFamily: 'Georgia, serif',
          boxShadow: selected ? 'inset 0 0 0 2px #5b3a1e' : undefined,
        }}
      >
        <span className="truncate w-full italic">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 700, color: selected ? '#f5c26b' : '#a06622' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 10 — Minimalist Line
  if (styleId === 10) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#ffffff' : '#111827',
          backgroundColor: selected ? '#111827' : '#ffffff',
          borderRadius: '4px',
          border: `1px solid ${selected ? '#111827' : '#d1d5db'}`,
          letterSpacing: '0.02em',
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 500, color: selected ? '#d1d5db' : '#6b7280' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 11 — Soft Pastel Gradient
  if (styleId === 11) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#5b21b6' : '#6b7280',
          background: selected
            ? 'linear-gradient(135deg, #fce7f3, #dbeafe, #ede9fe)'
            : '#ffffff',
          borderRadius: '14px',
          border: `1.5px solid ${selected ? '#c4b5fd' : '#f3f4f6'}`,
          boxShadow: selected ? '0 4px 14px rgba(196,181,253,0.4)' : undefined,
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? '#7c3aed' : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 12 — Deep Neumorphic 3D
  if (styleId === 12) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#ea580c' : '#475569',
          backgroundColor: '#e6ecf3',
          borderRadius: '16px',
          border: 'none',
          boxShadow: selected
            ? 'inset 5px 5px 10px #c2c8ce, inset -5px -5px 10px #ffffff'
            : '6px 6px 14px #c2c8ce, -6px -6px 14px #ffffff',
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 700, color: selected ? '#ea580c' : '#94a3b8' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 13 — Glassmorphism Cyber
  if (styleId === 13) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5 backdrop-blur-md"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#67e8f9' : '#e2e8f0',
          background: selected
            ? 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(59,130,246,0.15))'
            : 'rgba(15,23,42,0.6)',
          borderRadius: '12px',
          border: `1px solid ${selected ? '#22d3ee' : 'rgba(148,163,184,0.3)'}`,
          boxShadow: selected ? '0 0 16px rgba(34,211,238,0.6), inset 0 0 12px rgba(34,211,238,0.15)' : undefined,
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 700, color: selected ? '#67e8f9' : '#fbbf24' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 14 — Brutalist Bold
  if (styleId === 14) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5 uppercase"
        style={{
          minHeight, fontSize, fontWeight: 800,
          color: selected ? '#000000' : '#000000',
          backgroundColor: selected ? '#fb923c' : '#ffffff',
          borderRadius: '0px',
          border: '3px solid #000000',
          boxShadow: selected ? '4px 4px 0 #000000' : '2px 2px 0 #000000',
          letterSpacing: '0.03em',
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 900, color: '#000000' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 15 — Japanese Zen
  if (styleId === 15) {
    return (
      <button
        onClick={onClick}
        className="relative text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: '#1f2937',
          backgroundColor: '#faf6ef',
          borderRadius: '2px',
          border: `1px solid ${selected ? '#b91c1c' : '#d6c8ad'}`,
          fontFamily: '"Noto Serif Thai", "Noto Serif JP", serif',
        }}
      >
        {selected && (
          <span
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: '#b91c1c', boxShadow: '0 0 0 1px #faf6ef' }}
          />
        )}
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: '#b91c1c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 16 — Retro Pixel
  if (styleId === 16) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight: 700,
          color: selected ? '#fef08a' : '#22d3ee',
          backgroundColor: selected ? '#7c3aed' : '#1e1b4b',
          borderRadius: '0px',
          border: '3px solid',
          borderColor: selected ? '#fef08a' : '#22d3ee',
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          imageRendering: 'pixelated',
          boxShadow: selected ? '4px 4px 0 #22d3ee' : '3px 3px 0 #7c3aed',
        }}
      >
        <span className="truncate w-full text-[10px]">{name}</span>
        {priceText && (
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#f472b6' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 17 — Luxury Gold
  if (styleId === 17) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#0a0a0a' : '#e7c77a',
          background: selected
            ? 'linear-gradient(135deg, #f5d68a, #c99a3a)'
            : '#0a0a0a',
          borderRadius: '6px',
          border: `1px solid #c99a3a`,
          fontFamily: '"Playfair Display", Georgia, serif',
          boxShadow: selected ? '0 4px 14px rgba(201,154,58,0.5)' : 'inset 0 0 0 1px rgba(201,154,58,0.3)',
          letterSpacing: '0.05em',
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 700, color: selected ? '#0a0a0a' : '#f5d68a' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 18 — Nature Organic
  if (styleId === 18) {
    return (
      <button
        onClick={onClick}
        className="relative text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#ffffff' : '#3f6b46',
          backgroundColor: selected ? '#5a8a5f' : '#f0ede0',
          borderRadius: '999px',
          border: `1.5px solid ${selected ? '#3f6b46' : '#c5cba5'}`,
        }}
      >
        {selected && (
          <Leaf className="absolute top-1 left-1.5 w-3 h-3" style={{ color: '#a3e0a8' }} />
        )}
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? '#e6f7d9' : '#8a5a2c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 19 — Floating
  if (styleId === 19) {
    return (
      <button
        onClick={onClick}
        className="text-center p-2 transition-all flex flex-col items-center justify-center gap-0.5 hover:-translate-y-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: selected ? '#ffffff' : config.textColor,
          background: selected
            ? `linear-gradient(135deg, ${accent}, ${accent}dd)`
            : '#ffffff',
          borderRadius: '14px',
          border: 'none',
          boxShadow: selected
            ? `0 12px 24px -6px ${accent}66, 0 6px 12px -3px ${accent}44, 0 2px 4px rgba(0,0,0,0.06)`
            : '0 8px 18px -4px rgba(15,23,42,0.15), 0 3px 6px -2px rgba(15,23,42,0.08)',
          transform: selected ? 'translateY(-3px)' : undefined,
        }}
      >
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 700, color: selected ? '#fed7aa' : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 20 — Numbered Step (magazine)
  if (styleId === 20) {
    return (
      <button
        onClick={onClick}
        className="relative text-center p-2 pl-6 transition-all flex flex-col items-center justify-center gap-0.5"
        style={{
          minHeight, fontSize, fontWeight,
          color: baseFg, backgroundColor: baseBg,
          borderRadius: radius,
          border: `1px solid ${selected ? accent : '#e5e7eb'}`,
          fontFamily: 'Georgia, serif',
        }}
      >
        <span
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{
            backgroundColor: selected ? accent : '#f3f4f6',
            color: selected ? config.selectedTextColor : '#6b7280',
            border: selected ? 'none' : '1px solid #d1d5db',
          }}
        >
          {selected ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : <Sparkles className="w-2 h-2" />}
        </span>
        <span className="truncate w-full">{name}</span>
        {priceText && (
          <span style={{ fontSize: priceFontSize, fontWeight: 600, color: selected ? accent : '#ea580c' }}>{priceText}</span>
        )}
      </button>
    );
  }

  // Style 21 — Side Label (left-aligned)
  return (
    <button
      onClick={onClick}
      className="text-left px-3 py-2 transition-all flex items-center gap-2"
      style={{
        minHeight, fontSize, fontWeight,
        color: baseFg, backgroundColor: baseBg,
        borderRadius: radius,
        border: `1px solid ${selected ? accent : '#e5e7eb'}`,
        boxShadow: selected ? `inset 3px 0 0 ${accent}` : undefined,
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: selected ? accent : '#d1d5db' }}
      />
      <span className="truncate flex-1">{name}</span>
      {priceText && (
        <span
          className="flex-shrink-0"
          style={{ fontSize: priceFontSize, fontWeight: 700, color: selected ? accent : '#ea580c' }}
        >{priceText}</span>
      )}
    </button>
  );
};

export default AddonOption;
