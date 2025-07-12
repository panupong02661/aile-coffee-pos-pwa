// ฟังก์ชันช่วยเหลือสำหรับการแปลงวันที่
export const convertThaiDateToISO = (thaiDate: string): string => {
  if (!thaiDate) return '';
  
  console.log('Converting Thai date:', thaiDate);
  
  // ทำความสะอาดข้อมูล - เอาช่องว่างและอักขระพิเศษออก
  let dateString = thaiDate.trim().replace(/[^\d\/\-\.]/g, '');
  
  // ถ้าเป็นรูปแบบ DD/MM/YYYY หรือ DD-MM-YYYY หรือ DD.MM.YYYY
  const separators = ['/', '-', '.'];
  let parts: string[] = [];
  
  for (const separator of separators) {
    if (dateString.includes(separator)) {
      parts = dateString.split(separator);
      break;
    }
  }
  
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

// Enhanced function for generating comprehensive date search variants
export const generateDateSearchVariants = (inputDate: string): string[] => {
  if (!inputDate) return [];
  
  console.log('Generating date variants for:', inputDate);
  
  const variants: string[] = [];
  const cleaned = inputDate.trim();
  
  // Add original input
  variants.push(cleaned);
  
  // Clean and parse the date
  const cleanedDate = cleaned.replace(/[^\d\/\-\.]/g, '');
  if (cleanedDate !== cleaned) {
    variants.push(cleanedDate);
  }
  
  // Try to parse date parts
  const separators = ['/', '-', '.'];
  let day: string = '';
  let month: string = '';
  let year: string = '';
  
  for (const separator of separators) {
    if (cleanedDate.includes(separator)) {
      const parts = cleanedDate.split(separator);
      if (parts.length === 3) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
        break;
      }
    }
  }
  
  if (day && month && year) {
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Validate date parts
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
      // Padded versions
      const dayPad = day.padStart(2, '0');
      const monthPad = month.padStart(2, '0');
      
      // Generate different formats
      const formats = [
        // Original format variations
        `${day}/${month}/${year}`,
        `${dayPad}/${monthPad}/${year}`,
        `${day}-${month}-${year}`,
        `${dayPad}-${monthPad}-${year}`,
        `${day}.${month}.${year}`,
        `${dayPad}.${monthPad}.${year}`,
        
        // ISO format
        `${year}-${monthPad}-${dayPad}`,
        
        // Year conversions (Buddhist Era <-> Christian Era)
        ...(yearNum > 2500 ? [
          // Convert BE to CE
          `${day}/${month}/${yearNum - 543}`,
          `${dayPad}/${monthPad}/${yearNum - 543}`,
          `${day}-${month}-${yearNum - 543}`,
          `${dayPad}-${monthPad}-${yearNum - 543}`,
          `${yearNum - 543}-${monthPad}-${dayPad}`,
        ] : [
          // Convert CE to BE
          `${day}/${month}/${yearNum + 543}`,
          `${dayPad}/${monthPad}/${yearNum + 543}`,
          `${day}-${month}-${yearNum + 543}`,
          `${dayPad}-${monthPad}-${yearNum + 543}`,
        ])
      ];
      
      variants.push(...formats);
    }
  }
  
  // Remove duplicates and empty values
  const uniqueVariants = [...new Set(variants)].filter(v => v && v.trim());
  console.log('Generated variants:', uniqueVariants);
  return uniqueVariants;
};

// Enhanced phone number variants generation
export const generatePhoneVariants = (phone: string): string[] => {
  if (!phone) return [];
  
  const variants: string[] = [];
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Add original
  variants.push(phone.trim());
  
  // Add cleaned version
  if (cleaned !== phone.trim()) {
    variants.push(cleaned);
  }
  
  // Generate different formats
  if (cleaned) {
    // Handle +66 format
    if (cleaned.startsWith('+66')) {
      const withoutCountryCode = cleaned.substring(3);
      variants.push(`0${withoutCountryCode}`);
      variants.push(`66${withoutCountryCode}`);
    }
    // Handle 66 format (11 digits)
    else if (cleaned.startsWith('66') && cleaned.length === 11) {
      const withoutCountryCode = cleaned.substring(2);
      variants.push(`0${withoutCountryCode}`);
      variants.push(`+66${withoutCountryCode}`);
    }
    // Handle 0 format
    else if (cleaned.startsWith('0')) {
      const withoutZero = cleaned.substring(1);
      variants.push(`+66${withoutZero}`);
      variants.push(`66${withoutZero}`);
    }
  }
  
  // Remove duplicates
  return [...new Set(variants)].filter(v => v && v.trim());
};

// เก็บ function เดิมไว้เพื่อ backward compatibility
export const generateDateVariants = generateDateSearchVariants;
