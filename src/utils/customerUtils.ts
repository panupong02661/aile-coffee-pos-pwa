
import { supabase } from '@/integrations/supabase/client';
import { 
  parseThaiDateInput,
  cleanPhoneNumber,
  generateDateSearchVariants,
  generatePhoneVariants
} from '@/utils/dateUtils';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
  gender?: string;
  tier: string;
  points: number;
  total_spent: number;
}

// ฟังก์ชันสำหรับเปรียบเทียบวันที่แบบละเอียด
export const compareDates = (inputDate: string, storedDate: string): boolean => {
  if (!inputDate || !storedDate) return false;
  
  console.log('=== DATE COMPARISON DEBUG ===');
  console.log('Input date:', inputDate);
  console.log('Stored date:', storedDate);
  
  // แปลง input เป็น ISO format
  const inputISODate = parseThaiDateInput(inputDate);
  console.log('Input converted to ISO:', inputISODate);
  
  // สร้าง variants ของวันที่ทั้งสองแบบ
  const inputVariants = generateDateSearchVariants(inputDate);
  const storedVariants = generateDateSearchVariants(storedDate);
  
  console.log('Input variants:', inputVariants);
  console.log('Stored variants:', storedVariants);
  
  // ตรวจสอบการตรงกันแบบต่างๆ
  const matches = [
    // ตรงกันโดยตรง
    inputDate === storedDate,
    inputISODate === storedDate,
    
    // ตรงกันผ่าน variants
    inputVariants.some(iv => storedVariants.some(sv => iv === sv)),
    
    // เปรียบเทียบแบบ Date object
    inputISODate && new Date(inputISODate).toISOString().split('T')[0] === new Date(storedDate).toISOString().split('T')[0],
    
    // เปรียบเทียบแบบ string ธรรมดา
    inputDate.replace(/\//g, '-') === storedDate.replace(/\//g, '-'),
    
    // เปรียบเทียบแค่ตัวเลข
    inputDate.replace(/[^0-9]/g, '') === storedDate.replace(/[^0-9]/g, ''),

    // เปรียบเทียบแบบ exact match ของ parsed dates
    inputISODate && storedDate && inputISODate === storedDate,
    
    // เปรียบเทียบแบ บ loose ขึ้น - ถ้าทั้งสองอันแปลงเป็น Date object แล้วเหมือนกัน
    inputISODate && storedDate && 
    new Date(inputISODate).getTime() === new Date(storedDate).getTime()
  ];
  
  const isMatch = matches.some(match => match);
  console.log('Match results:', matches);
  console.log('Final match result:', isMatch);
  
  return isMatch;
};

export const authenticateCustomer = async (phone: string, birthDate: string): Promise<CustomerProfile | null> => {
  console.log('=== LOGIN DEBUG INFO ===');
  console.log('Login form data:', { phone, birth_date: birthDate });
  
  // สร้าง variants สำหรับการค้นหา
  const phoneVariants = generatePhoneVariants(phone);
  
  console.log('Phone variants for search:', phoneVariants);
  console.log('Input birth date:', birthDate);
  
  let profileData = null;

  // ค้นหาจาก members table
  console.log('=== SEARCHING IN MEMBERS ===');
  
  for (const phoneVariant of phoneVariants) {
    console.log(`Searching for phone in members: ${phoneVariant}`);
    
    const { data: memberResults, error } = await supabase
      .from('members')
      .select('*')
      .eq('phone', phoneVariant);
    
    if (error) {
      console.error('Error searching members:', error);
      continue;
    }
    
    if (memberResults && memberResults.length > 0) {
      console.log(`Found ${memberResults.length} members with phone ${phoneVariant}:`, memberResults);
      
      for (const member of memberResults) {
        console.log(`Checking member ${member.id}:`);
        console.log(`- Name: ${member.name}`);
        console.log(`- Stored birth_date: "${member.birth_date}"`);
        console.log(`- Input birth_date: "${birthDate}"`);
        
        if (compareDates(birthDate, member.birth_date)) {
          console.log('*** MEMBER DATE MATCH FOUND ***', member);
          profileData = member;
          break;
        }
      }
      
      if (profileData) break;
    }
  }

  return profileData;
};

export const registerCustomer = async (data: { 
  name: string; 
  phone: string; 
  birth_date: string; 
  gender: string 
}): Promise<void> => {
  console.log('=== REGISTER DEBUG INFO ===');
  console.log('Original form data:', data);
  
  // ทำความสะอาดเบอร์โทรศัพท์
  const cleanedPhone = cleanPhoneNumber(data.phone);
  console.log('Cleaned phone:', cleanedPhone);
  
  // แปลงวันที่ให้ถูกต้อง
  const convertedBirthDate = parseThaiDateInput(data.birth_date);
  console.log('Converted birth date for registration:', convertedBirthDate);

  if (!convertedBirthDate) {
    throw new Error('ไม่สามารถแปลงวันที่ได้ กรุณาตรวจสอบรูปแบบวันที่');
  }

  // สร้าง variants สำหรับการตรวจสอบ
  const phoneVariants = generatePhoneVariants(data.phone);
  
  console.log('Phone variants for checking:', phoneVariants);

  // ตรวจสอบว่าเบอร์โทรนี้มีอยู่แล้วหรือไม่ใน members
  let existingMember = false;

  for (const phoneVariant of phoneVariants) {
    const { data: memberData } = await supabase
      .from('members')
      .select('id, phone, birth_date')
      .eq('phone', phoneVariant)
      .maybeSingle();

    if (memberData) {
      console.log('Found existing member:', memberData);
      existingMember = true;
      break;
    }
  }

  if (existingMember) {
    throw new Error('เบอร์โทรนี้ได้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ');
  }

  console.log('Creating new member with data:', {
    name: data.name.trim(),
    phone: cleanedPhone,
    birth_date: convertedBirthDate,
    gender: data.gender || null
  });

  // สร้างสมาชิกใหม่ใน members table
  const { error: memberError } = await supabase
    .from('members')
    .insert({
      name: data.name.trim(),
      phone: cleanedPhone,
      birth_date: convertedBirthDate,
      gender: data.gender || null,
      tier: 'silver',
      points: 0,
      total_spent: 0
    });

  if (memberError) {
    console.error('Member creation error:', memberError);
    if (memberError.code === '23505') {
      throw new Error('หมายเลขโทรศัพท์นี้มีอยู่แล้วในระบบ');
    } else {
      throw new Error('ไม่สามารถสร้างโปรไฟล์ได้');
    }
  }
};

export const updateCustomerProfile = async (customerId: string, data: CustomerProfile): Promise<void> => {
  const { error } = await supabase
    .from('members')
    .update({
      name: data.name,
      phone: data.phone,
      birth_date: data.birth_date,
      gender: data.gender
    })
    .eq('id', customerId);

  if (error) {
    throw new Error('ไม่สามารถอัพเดทข้อมูลได้');
  }
};
