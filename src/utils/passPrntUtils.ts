/**
 * PassPRNT Integration Utilities
 * 
 * PassPRNT คือแอปตัวกลาง (middleware) ของ Star Micronics
 * ที่ทำหน้าที่เป็น bridge ระหว่าง Web/PWA กับเครื่องพิมพ์ Star
 * 
 * วิธีการทำงาน:
 * 1. ผู้ใช้ติดตั้งแอป PassPRNT จาก App Store / Google Play
 * 2. ตั้งค่าเครื่องพิมพ์ในแอป PassPRNT
 * 3. Web app ส่งข้อมูลผ่าน URL Scheme ไปยัง PassPRNT
 * 4. PassPRNT จัดการพิมพ์ให้โดยอัตโนมัติ
 * 
 * รองรับทั้ง iOS และ Android
 */

// MARK: - Types

export interface PassPRNTPrintOptions {
  /** ข้อมูลที่ต้องการพิมพ์ (plain text หรือ ESC/POS commands) */
  data: string;
  /** ประเภทข้อมูล */
  dataType?: 'text' | 'escpos' | 'html';
  /** ตัดกระดาษหลังพิมพ์ */
  autoCut?: boolean;
  /** เปิดลิ้นชักเก็บเงิน */
  openDrawer?: boolean;
  /** URL ที่ต้องการให้กลับมาหลังพิมพ์เสร็จ */
  callbackUrl?: string;
  /** ขนาดกระดาษ (mm) */
  paperWidth?: 58 | 80;
}

export interface PassPRNTConfig {
  /** เปิดใช้งาน PassPRNT */
  enabled: boolean;
  /** URL Scheme ของ PassPRNT */
  urlScheme: string;
  /** callback URL หลังพิมพ์เสร็จ */
  callbackUrl: string;
  /** ขนาดกระดาษเริ่มต้น */
  defaultPaperWidth: 58 | 80;
}

// MARK: - Constants

/** URL Scheme ของ PassPRNT */
const PASSPRNT_URL_SCHEME = 'starpassprnt://v1/print/nopreview';
const PASSPRNT_URL_SCHEME_PREVIEW = 'starpassprnt://v1/print/preview';

/** App Store / Play Store Links */
export const PASSPRNT_APP_LINKS = {
  ios: 'https://apps.apple.com/app/star-passprnt/id979548498',
  android: 'https://play.google.com/store/apps/details?id=com.StarMicronics.StarPassPRNT',
};

// MARK: - Config Management

const CONFIG_KEY = 'passprnt_config';

/** ดึงการตั้งค่า PassPRNT จาก localStorage */
export const getPassPRNTConfig = (): PassPRNTConfig => {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore parse error
    }
  }
  
  return {
    enabled: false,
    urlScheme: PASSPRNT_URL_SCHEME,
    callbackUrl: window.location.origin,
    defaultPaperWidth: 80,
  };
};

/** บันทึกการตั้งค่า PassPRNT */
export const savePassPRNTConfig = (config: PassPRNTConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

// MARK: - Platform Detection

/** ตรวจสอบว่าเป็น iOS หรือไม่ */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/** ตรวจสอบว่าเป็น Android หรือไม่ */
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

/** ตรวจสอบว่าเป็นอุปกรณ์มือถือหรือไม่ */
export const isMobileDevice = (): boolean => {
  return isIOS() || isAndroid();
};

// MARK: - PassPRNT Functions

/**
 * สร้าง PassPRNT URL สำหรับส่งไปยังแอป PassPRNT
 * 
 * Format: starpassprnt://v1/print/nopreview?back={callbackUrl}&n={data}
 * หรือสำหรับ ESC/POS: starpassprnt://v1/print/nopreview?back={callbackUrl}&d={base64data}
 */
export const buildPassPRNTUrl = (options: PassPRNTPrintOptions): string => {
  const config = getPassPRNTConfig();
  const baseUrl = PASSPRNT_URL_SCHEME;
  
  const params = new URLSearchParams();
  
  // Callback URL - กลับมาที่แอปหลังพิมพ์เสร็จ
  const callbackUrl = options.callbackUrl || config.callbackUrl || window.location.href;
  params.set('back', callbackUrl);
  
  if (options.dataType === 'escpos') {
    // ส่ง ESC/POS commands เป็น Base64
    const base64Data = btoa(unescape(encodeURIComponent(options.data)));
    params.set('d', base64Data);
  } else if (options.dataType === 'html') {
    // ส่ง HTML content
    const encodedHtml = encodeURIComponent(options.data);
    params.set('url', `data:text/html,${encodedHtml}`);
  } else {
    // ส่ง plain text
    params.set('n', options.data);
  }
  
  // Paper width
  if (options.paperWidth) {
    params.set('size', options.paperWidth === 58 ? '2' : '3');
  }
  
  // Auto cut
  if (options.autoCut !== false) {
    params.set('cut', 'true');
  }
  
  // Open drawer
  if (options.openDrawer) {
    params.set('drawer', 'true');
  }
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * ส่งข้อมูลไปพิมพ์ผ่าน PassPRNT
 * 
 * ทำงานโดยการเปิด URL Scheme ของ PassPRNT
 * ถ้าแอป PassPRNT ติดตั้งอยู่ จะเปิดแอปและพิมพ์โดยอัตโนมัติ
 * ถ้าไม่ได้ติดตั้ง จะแสดงข้อความให้ดาวน์โหลด
 */
export const printViaPassPRNT = async (options: PassPRNTPrintOptions): Promise<boolean> => {
  try {
    const url = buildPassPRNTUrl(options);
    
    console.log('📱 PassPRNT: Opening URL scheme...', url.substring(0, 100) + '...');
    
    // พยายามเปิด URL Scheme
    const opened = await openUrlScheme(url);
    
    if (!opened) {
      console.warn('📱 PassPRNT: App not found, showing install prompt');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('📱 PassPRNT Error:', error);
    return false;
  }
};

/**
 * เปิด URL Scheme
 * 
 * ใช้ iframe trick สำหรับ iOS เพื่อตรวจสอบว่าแอปติดตั้งอยู่หรือไม่
 * โดยไม่ต้องเปลี่ยนหน้า
 */
const openUrlScheme = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // สำหรับ iOS ใช้ window.location
    if (isIOS()) {
      // ใช้ hidden iframe เพื่อไม่ให้เปลี่ยนหน้า
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      // ตรวจสอบว่าแอปเปิดได้หรือไม่
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false); // แอปไม่ได้ติดตั้ง
      }, 2500);
      
      // ถ้าแอปเปิดได้ จะมี blur event
      const handleBlur = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        window.removeEventListener('blur', handleBlur);
        resolve(true);
      };
      
      window.addEventListener('blur', handleBlur);
      
      return;
    }
    
    // สำหรับ Android ใช้ intent
    if (isAndroid()) {
      // Android Intent URL
      const intentUrl = url.replace(
        'starpassprnt://',
        'intent://'
      ) + '#Intent;scheme=starpassprnt;package=com.StarMicronics.StarPassPRNT;end';
      
      window.location.href = intentUrl;
      resolve(true);
      return;
    }
    
    // Fallback สำหรับ Desktop - เปิดในหน้าต่างใหม่
    window.open(url, '_blank');
    resolve(true);
  });
};

/**
 * ตรวจสอบว่า PassPRNT สามารถใช้งานได้หรือไม่
 * (ต้องอยู่บน iOS หรือ Android)
 */
export const isPassPRNTAvailable = (): boolean => {
  return isMobileDevice();
};

/**
 * เปิด Cash Drawer ผ่าน PassPRNT
 */
export const openDrawerViaPassPRNT = async (): Promise<boolean> => {
  return printViaPassPRNT({
    data: '',
    dataType: 'escpos',
    openDrawer: true,
    autoCut: false,
  });
};

/**
 * พิมพ์ใบเสร็จผ่าน PassPRNT
 * รับ ESC/POS data แล้วส่งไปยังแอป PassPRNT
 */
export const printReceiptViaPassPRNT = async (
  receiptData: string,
  options?: Partial<PassPRNTPrintOptions>
): Promise<boolean> => {
  return printViaPassPRNT({
    data: receiptData,
    dataType: 'escpos',
    autoCut: true,
    paperWidth: 80,
    ...options,
  });
};

/**
 * พิมพ์ข้อความธรรมดาผ่าน PassPRNT
 */
export const printTextViaPassPRNT = async (
  text: string,
  options?: Partial<PassPRNTPrintOptions>
): Promise<boolean> => {
  return printViaPassPRNT({
    data: text,
    dataType: 'text',
    autoCut: true,
    paperWidth: 80,
    ...options,
  });
};

/**
 * ดึง link สำหรับดาวน์โหลดแอป PassPRNT ตาม platform
 */
export const getPassPRNTDownloadLink = (): string => {
  if (isIOS()) return PASSPRNT_APP_LINKS.ios;
  if (isAndroid()) return PASSPRNT_APP_LINKS.android;
  return PASSPRNT_APP_LINKS.ios; // default
};
