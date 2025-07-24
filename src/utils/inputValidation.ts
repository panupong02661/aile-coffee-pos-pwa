
// Client-side input validation utilities
export const validateInput = (input: string, type: 'general' | 'username' | 'email' | 'phone' | 'number' = 'general'): { isValid: boolean; error?: string } => {
  // Basic null/empty check
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: 'ข้อมูลไม่สามารถเป็นค่าว่างได้' };
  }

  // XSS pattern detection
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'ตรวจพบรูปแบบข้อมูลที่ไม่ปลอดภัย' };
    }
  }

  // SQL injection pattern detection
  const sqlPatterns = [
    /(\bunion\s+select\b)/gi,
    /(\binsert\s+into\b)/gi,
    /(\bupdate\s+set\b)/gi,
    /(\bdelete\s+from\b)/gi,
    /(\bdrop\s+table\b)/gi,
    /(\bexec\s+)/gi,
    /(\bscript\s+)/gi,
    /(--)/g,
    /(\/\*[\s\S]*?\*\/)/g
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'ตรวจพบรูปแบบข้อมูลที่ไม่ปลอดภัย' };
    }
  }

  // Type-specific validation
  switch (type) {
    case 'username':
      if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(input)) {
        return { isValid: false, error: 'ชื่อผู้ใช้ต้องมี 3-20 ตัวอักษร และใช้ได้เฉพาะ a-z, A-Z, 0-9, _, ., -' };
      }
      break;
    
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        return { isValid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
      }
      break;
    
    case 'phone':
      if (!/^[0-9]{10}$/.test(input.replace(/[-\s]/g, ''))) {
        return { isValid: false, error: 'หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };
      }
      break;
    
    case 'number':
      if (!/^[0-9]+(\.[0-9]+)?$/.test(input)) {
        return { isValid: false, error: 'ต้องเป็นตัวเลขเท่านั้น' };
      }
      break;
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

export const validatePassword = (password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } => {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', strength: 'weak' };
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteriaCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (criteriaCount < 3) {
    return { 
      isValid: false, 
      error: 'รหัสผ่านต้องมีอย่างน้อย 3 จาก 4 เงื่อนไข: ตัวพิมพ์เล็ก, ตัวพิมพ์ใหญ่, ตัวเลข, สัญลักษณ์พิเศษ', 
      strength: criteriaCount < 2 ? 'weak' : 'medium'
    };
  }

  return { 
    isValid: true, 
    strength: criteriaCount >= 4 ? 'strong' : 'medium'
  };
};
