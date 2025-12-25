
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MenuExcelData {
  'ชื่อเมนู': string;
  'คำอธิบาย': string;
  'ราคา': number;
  'ต้นทุน': number;
  'หมวดหมู่': string;
  'รูปภาพ URL': string;
  'สถานะ': string;
}

export const useMenuExcel = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportMenuToExcel = async (menuItems: any[], categories: any[]) => {
    setIsExporting(true);
    try {
      // Create category lookup map
      const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<string, string>);

      // Transform menu data for Excel
      const excelData: MenuExcelData[] = menuItems.map(item => ({
        'ชื่อเมนู': item.name,
        'คำอธิบาย': item.description || '',
        'ราคา': Number(item.price),
        'ต้นทุน': Number(item.cost_price),
        'หมวดหมู่': categoryMap[item.category_id] || 'ไม่มีหมวดหมู่',
        'รูปภาพ URL': item.image_url || '',
        'สถานะ': item.is_available ? 'พร้อมจำหน่าย' : 'ไม่พร้อมจำหน่าย'
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { width: 30 }, // ชื่อเมนู
        { width: 40 }, // คำอธิบาย
        { width: 12 }, // ราคา
        { width: 12 }, // ต้นทุน
        { width: 20 }, // หมวดหมู่
        { width: 50 }, // รูปภาพ URL
        { width: 20 }  // สถานะ
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Menu');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `menu_export_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success(`ส่งออกข้อมูลเมนูสำเร็จ: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setIsExporting(false);
    }
  };

  const importMenuFromExcel = async (file: File, categories: any[], onSuccess: () => void) => {
    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Read as JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
      
      console.log('📊 Import Excel - Total rows:', jsonData.length);
      console.log('📊 First row sample:', jsonData[0]);
      console.log('📊 Available keys:', jsonData.length > 0 ? Object.keys(jsonData[0]) : []);

      if (jsonData.length === 0) {
        toast.error('ไม่พบข้อมูลในไฟล์');
        return;
      }

      // ลบเมนูเก่าทั้งหมดก่อน import
      console.log('📊 Deleting all existing menu items...');
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // ลบทั้งหมด
      
      if (deleteError) {
        console.error('📊 Delete error:', deleteError);
        toast.error('ไม่สามารถลบเมนูเก่าได้: ' + deleteError.message);
        return;
      }
      console.log('📊 Deleted all existing menu items');

      // Create category lookup map (reverse)
      const categoryNameMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      }, {} as Record<string, string>);
      
      console.log('📊 Available categories:', Object.keys(categoryNameMap));

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process data rows
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = i + 2; // Excel row number (1-indexed, +1 for header)
        
        try {
          // Get values - handle both Thai and English keys
          const name = row['ชื่อเมนู'] || row['name'];
          const description = row['คำอธิบาย'] || row['description'];
          const price = row['ราคา'] || row['price'];
          const costPrice = row['ต้นทุน'] || row['cost_price'];
          const category = row['หมวดหมู่'] || row['category'];
          const imageUrl = row['รูปภาพ URL'] || row['image_url'];
          const status = row['สถานะ'] || row['status'];

          console.log(`📊 Row ${rowNum}:`, { name, price, category, status });

          // Validate required fields
          if (!name || String(name).trim() === '') {
            errors.push(`แถว ${rowNum}: ชื่อเมนูว่าง`);
            errorCount++;
            continue;
          }

          // Price can be 0 or empty, default to 0
          const priceNum = price !== undefined && price !== '' && price !== null ? Number(price) : 0;
          if (isNaN(priceNum)) {
            errors.push(`แถว ${rowNum}: ราคาไม่ถูกต้อง (${price})`);
            errorCount++;
            continue;
          }

          // Find category ID
          let categoryId = null;
          if (category && String(category).trim()) {
            const categoryName = String(category).trim();
            categoryId = categoryNameMap[categoryName] || null;
            if (!categoryId) {
              console.log(`📊 Category not found: "${categoryName}"`);
            }
          }

          const menuData = {
            name: String(name).trim(),
            description: description ? String(description).trim() : null,
            price: priceNum,
            cost_price: costPrice !== undefined && costPrice !== '' && costPrice !== null ? Number(costPrice) : 0,
            category_id: categoryId,
            image_url: imageUrl ? String(imageUrl).trim() : null,
            is_available: status === 'พร้อมจำหน่าย' || status === undefined || status === '' || status === null
          };

          // Insert new item (เนื่องจากลบเมนูเก่าแล้ว จึง insert ใหม่ทั้งหมด)
          const { error: insertError } = await supabase
            .from('menu_items')
            .insert(menuData);

          if (insertError) {
            console.error(`📊 Insert error for "${name}":`, insertError);
            errors.push(`แถว ${rowNum}: ${insertError.message}`);
            errorCount++;
            continue;
          }

          successCount++;
        } catch (error: any) {
          const errorMsg = error?.message || error?.toString() || JSON.stringify(error);
          console.error(`📊 Error processing row ${rowNum}:`, error);
          errors.push(`แถว ${rowNum}: ${errorMsg}`);
          errorCount++;
        }
      }

      console.log(`📊 Import complete: ${successCount} success, ${errorCount} errors`);

      // Show results
      if (successCount > 0) {
        toast.success(`นำเข้าข้อมูลสำเร็จ ${successCount} รายการ`);
        onSuccess();
      }

      if (errorCount > 0) {
        const errorMessage = `มีข้อผิดพลาด ${errorCount} รายการ:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`;
        toast.error(errorMessage);
        console.error('📊 All errors:', errors);
      }

      if (successCount === 0 && errorCount === 0) {
        toast.info('ไม่พบข้อมูลที่ต้องนำเข้า');
      }

    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || JSON.stringify(error);
      console.error('📊 Import error:', error);
      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + errorMsg);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportMenuToExcel,
    importMenuFromExcel,
    isExporting,
    isImporting
  };
};
