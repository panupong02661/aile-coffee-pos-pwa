// ฟังก์ชันช่วยเหลือสำหรับการแปลงวันที่
export const convertThaiDateToISO = (thaiDate: string): string => {
  if (!thaiDate) return '';
  
  console.log('Converting Thai date:', thaiDate);
  
  // ทำความสะอาดข้อมูล - เอาช่องว่างออก
  let dateString = thaiDate.trim();
  
  // ถ้าเป็นรูปแบบ DD/MM/YYYY
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // ตรวจสอบความถูกต้องของวันที่
      if (day < 1 || day > 31 || month < 1 || month > 12) {
        console.error('Invalid date format:', thaiDate);
        return '';
      }
      
      // แปลง พ.ศ. เป็น ค.ศ. ถ้าปีมากกว่า 2500
      if (year > 2500) {
        year = year - 543;
      }
      
      dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }
  
  console.log('Converted to ISO:', dateString);
  return dateString;
};

export const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
  
  return `${day}/${month}/${year}`;
};

export const convertDisplayDateToISO = (displayDate: string): string => {
  return convertThaiDateToISO(displayDate);
};

// ฟังก์ชันสำหรับแปลงวันที่จาก ISO เป็นรูปแบบไทย พ.ศ.
export const formatDateToThai = (isoDate: string): string => {
  return formatDateForDisplay(isoDate);
};

// ฟังก์ชันสำหรับแปลงวันที่ปัจจุบันเป็นรูปแบบไทย พ.ศ.
export const getCurrentThaiDate = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
  
  return `${day}/${month}/${year}`;
};

// ฟังก์ชันที่ใช้สำหรับ normalize วันที่
export const normalizeDate = (dateInput: string): string => {
  return convertThaiDateToISO(dateInput);
};

// ฟังก์ชันหลักสำหรับแปลงวันที่ input ของผู้ใช้
export const parseThaiDateInput = (input: string): string => {
  if (!input) return '';
  
  console.log('Parsing Thai date input:', input);
  
  const cleaned = input.trim();
  const converted = convertThaiDateToISO(cleaned);
  
  // ตรวจสอบความถูกต้องของวันที่ที่แปลงแล้ว
  if (converted) {
    const testDate = new Date(converted);
    if (isNaN(testDate.getTime())) {
      console.error('Invalid converted date:', converted);
      return '';
    }
  }
  
  console.log('Parsed result:', converted);
  return converted;
};

// ฟังก์ชันสำหรับตรวจสอบรูปแบบวันที่ไทย
export const isValidThaiDateFormat = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const thaiDateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (!thaiDateRegex.test(dateString.trim())) {
    return false;
  }
  
  const parts = dateString.trim().split('/');
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2400 && year <= 2700;
};

// ฟังก์ชันสำหรับทำความสะอาดเบอร์โทรศัพท์
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // เอาเครื่องหมายและช่องว่างออก
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // ถ้าขึ้นต้นด้วย +66 ให้เปลี่ยนเป็น 0
  if (cleaned.startsWith('+66')) {
    cleaned = '0' + cleaned.substring(3);
  }
  
  // ถ้าขึ้นต้นด้วย 66 และมีความยาว 11 หลัก ให้เปลี่ยนเป็น 0 แทน 66
  if (cleaned.startsWith('66') && cleaned.length === 11) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  return cleaned;
};

// ฟังก์ชันใหม่สำหรับสร้าง variants ของวันที่เพื่อการค้นหา - ปรับปรุงให้ครอบคลุมมากขึ้น
export const generateDateSearchVariants = (inputDate: string): string[] => {
  if (!inputDate) return [];
  
  const variants: string[] = [];
  
  // เพิ่ม input ต้นฉบับ
  variants.push(inputDate.trim());
  
  // แปลงเป็น ISO format
  const isoDate = convertThaiDateToISO(inputDate);
  if (isoDate && isoDate !== inputDate.trim()) {
    variants.push(isoDate);
  }
  
  // ถ้าแปลงได้ ให้สร้าง variants เพิ่ม
  if (isoDate) {
    try {
      const date = new Date(isoDate);
      if (!isNaN(date.getTime())) {
        // ISO format standard
        const standardISO = date.toISOString().split('T')[0];
        variants.push(standardISO);
        
        // รูปแบบ YYYY-MM-DD
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        variants.push(`${year}-${month}-${day}`);
        
        // รูปแบบไทย DD/MM/YYYY (พ.ศ.)
        const thaiYear = year + 543;
        variants.push(`${day}/${month}/${thaiYear}`);
        
        // รูปแบบไทย DD/MM/YYYY (ค.ศ.)
        variants.push(`${day}/${month}/${year}`);
        
        // รูปแบบ D/M/YYYY (ไม่มี leading zero)
        const dayNoZero = date.getDate().toString();
        const monthNoZero = (date.getMonth() + 1).toString();
        variants.push(`${dayNoZero}/${monthNoZero}/${thaiYear}`);
        variants.push(`${dayNoZero}/${monthNoZero}/${year}`);
        
        // เพิ่ม date format แบบ PostgreSQL
        variants.push(date.toISOString().substring(0, 10));
        
        // เพิ่มรูปแบบที่อาจจะเก็บในฐานข้อมูล
        const dbFormats = [
          `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
          `${thaiYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
          `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`,
          `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${thaiYear}`
        ];
        variants.push(...dbFormats);
      }
    } catch (error) {
      console.error('Error generating date variants:', error);
    }
  }
  
  // ถ้า input เป็นรูปแบบไทย ให้ลองแปลงเป็นค.ศ.ด้วย
  if (inputDate.includes('/')) {
    const parts = inputDate.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parseInt(parts[2]);
      
      // ถ้าเป็น พ.ศ. ให้แปลงเป็น ค.ศ.
      if (year > 2500) {
        const adYear = year - 543;
        variants.push(`${day}/${month}/${adYear}`);
        variants.push(`${day.padStart(2, '0')}/${month.padStart(2, '0')}/${adYear}`);
        variants.push(`${adYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
      // ถ้าเป็น ค.ศ. ให้แปลงเป็น พ.ศ.
      else if (year < 2500) {
        const beYear = year + 543;
        variants.push(`${day}/${month}/${beYear}`);
        variants.push(`${day.padStart(2, '0')}/${month.padStart(2, '0')}/${beYear}`);
      }
    }
  }
  
  // เอาค่าที่ซ้ำออกและ filter ค่าว่าง
  const uniqueVariants = [...new Set(variants)].filter(v => v && v.trim());
  console.log('Generated date variants for:', inputDate, '→', uniqueVariants);
  return uniqueVariants;
};

// ฟังก์ชันสำหรับสร้าง variants ของเบอร์โทร
export const generatePhoneVariants = (phone: string): string[] => {
  if (!phone) return [];
  
  const variants: string[] = [];
  const cleaned = cleanPhoneNumber(phone);
  
  // เพิ่ม phone ต้นฉบับ
  variants.push(phone.trim());
  
  // เพิ่ม cleaned version
  if (cleaned && cleaned !== phone.trim()) {
    variants.push(cleaned);
  }
  
  // สร้าง variants เพิ่มเติม
  if (cleaned) {
    // ถ้าขึ้นต้นด้วย 0 ให้ลองเป็น +66 และ 66
    if (cleaned.startsWith('0')) {
      const withoutZero = cleaned.substring(1);
      variants.push(`+66${withoutZero}`);
      variants.push(`66${withoutZero}`);
    }
    
    // ถ้าขึ้นต้นด้วย +66 ลองเป็น 0
    if (cleaned.startsWith('+66')) {
      variants.push(`0${cleaned.substring(3)}`);
    }
    
    // ถ้าขึ้นต้นด้วย 66 ลองเป็น 0
    if (cleaned.startsWith('66') && cleaned.length === 11) {
      variants.push(`0${cleaned.substring(2)}`);
    }
  }
  
  // เอาค่าที่ซ้ำออก
  return [...new Set(variants)].filter(v => v && v.trim());
};

// เก็บ function เดิมไว้เพื่อ backward compatibility
export const generateDateVariants = generateDateSearchVariants;
