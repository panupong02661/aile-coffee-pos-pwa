
// ฟังก์ชันช่วยเหลือสำหรับการแปลงวันที่
export const convertThaiDateToISO = (thaiDate: string): string => {
  if (!thaiDate) return '';
  
  // รองรับรูปแบบ DD/MM/YYYY หรือ YYYY-MM-DD
  let dateString = thaiDate;
  
  // ถ้าเป็นรูปแบบ DD/MM/YYYY
  if (thaiDate.includes('/')) {
    const parts = thaiDate.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parseInt(parts[2]);
      
      // แปลง พ.ศ. เป็น ค.ศ. ถ้าปีมากกว่า 2500
      if (year > 2500) {
        year = year - 543;
      }
      
      dateString = `${year}-${month}-${day}`;
    }
  }
  
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
  if (!displayDate) return '';
  
  // ถ้าเป็นรูปแบบ DD/MM/YYYY แปลงเป็น YYYY-MM-DD
  if (displayDate.includes('/')) {
    const parts = displayDate.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parseInt(parts[2]);
      
      // แปลง พ.ศ. เป็น ค.ศ. ถ้าปีมากกว่า 2500
      if (year > 2500) {
        year = year - 543;
      }
      
      return `${year}-${month}-${day}`;
    }
  }
  
  return displayDate;
};

// ฟังก์ชันสำหรับแปลงวันที่จาก ISO เป็นรูปแบบไทย พ.ศ.
export const formatDateToThai = (isoDate: string): string => {
  if (!isoDate) return '';
  
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
  
  return `${day}/${month}/${year}`;
};

// ฟังก์ชันสำหรับแปลงวันที่ปัจจุบันเป็นรูปแบบไทย พ.ศ.
export const getCurrentThaiDate = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
  
  return `${day}/${month}/${year}`;
};
