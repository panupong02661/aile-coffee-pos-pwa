
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

// ฟังก์ชันสำหรับสร้าง array ของวันที่ที่เป็นไปได้สำหรับการค้นหา
export const generateDateVariants = (inputDate: string): string[] => {
  if (!inputDate) return [];
  
  const variants: string[] = [];
  const isoDate = convertThaiDateToISO(inputDate);
  
  if (isoDate) {
    variants.push(isoDate);
    
    // เพิ่มรูปแบบที่อาจจะเก็บไว้ในฐานข้อมูล
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      // รูปแบบ YYYY-MM-DD
      variants.push(date.toISOString().split('T')[0]);
      
      // รูปแบบ DD/MM/YYYY (พ.ศ.)
      const thaiYear = date.getFullYear() + 543;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      variants.push(`${day}/${month}/${thaiYear}`);
      
      // รูปแบบ DD/MM/YYYY (ค.ศ.)
      variants.push(`${day}/${month}/${date.getFullYear()}`);
    }
  }
  
  // เอาค่าที่ซ้ำออก
  return [...new Set(variants)];
};
