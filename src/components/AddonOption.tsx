import { Check } from 'lucide-react';

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
] as const;

export const ADDON_STYLE_STORAGE_KEY = 'addonStyleId';

export const getSavedAddonStyleId = (): number => {
  const saved = localStorage.getItem(ADDON_STYLE_STORAGE_KEY);
  const parsed = saved ? parseInt(saved) : 1;
  return parsed >= 1 && parsed <= 8 ? parsed : 1;
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
};

export default AddonOption;
