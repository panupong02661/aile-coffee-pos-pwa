
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
      
      // Read as array of arrays first to get headers
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (rawData.length < 2) {
        toast.error('ไม่พบข้อมูลในไฟล์');
        return;
      }

      // Get headers from first row
      const headers = rawData[0] as string[];
      console.log('Excel headers:', headers);
      
      // Map header indices
      const headerMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        if (header) {
          headerMap[header.trim()] = index;
        }
      });
      
      console.log('Header map:', headerMap);

      // Create category lookup map (reverse)
      const categoryNameMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      }, {} as Record<string, string>);

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process data rows (skip header)
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNum = i + 1; // Excel row number (1-indexed)
        
        try {
          // Get values by header index
          const name = row[headerMap['ชื่อเมนู']];
          const description = row[headerMap['คำอธิบาย']];
          const price = row[headerMap['ราคา']];
          const costPrice = row[headerMap['ต้นทุน']];
          const category = row[headerMap['หมวดหมู่']];
          const imageUrl = row[headerMap['รูปภาพ URL']];
          const status = row[headerMap['สถานะ']];

          // Validate required fields
          if (!name || String(name).trim() === '') {
            errors.push(`แถว ${rowNum}: ชื่อเมนูไม่สามารถว่างได้`);
            errorCount++;
            continue;
          }

          // Price can be 0 or empty, default to 0
          const priceNum = price !== undefined && price !== '' ? Number(price) : 0;
          if (isNaN(priceNum)) {
            errors.push(`แถว ${rowNum}: ราคาไม่ถูกต้อง (${price})`);
            errorCount++;
            continue;
          }

          // Find category ID
          let categoryId = null;
          if (category && categoryNameMap[String(category).trim()]) {
            categoryId = categoryNameMap[String(category).trim()];
          }

          // Check if menu item exists
          const { data: existingItem, error: checkError } = await supabase
            .from('menu_items')
            .select('id')
            .eq('name', String(name).trim())
            .maybeSingle();

          if (checkError) {
            throw checkError;
          }

          const menuData = {
            name: String(name).trim(),
            description: description ? String(description).trim() : null,
            price: priceNum,
            cost_price: costPrice !== undefined && costPrice !== '' ? Number(costPrice) : 0,
            category_id: categoryId,
            image_url: imageUrl ? String(imageUrl).trim() : null,
            is_available: status === 'พร้อมจำหน่าย' || status === undefined || status === '',
            updated_at: new Date().toISOString()
          };

          if (existingItem) {
            // Update existing item
            const { error: updateError } = await supabase
              .from('menu_items')
              .update(menuData)
              .eq('id', existingItem.id);

            if (updateError) throw updateError;
          } else {
            // Insert new item
            const { error: insertError } = await supabase
              .from('menu_items')
              .insert(menuData);

            if (insertError) throw insertError;
          }

          successCount++;
        } catch (error) {
          console.error(`Error processing row ${rowNum}:`, row, error);
          errors.push(`แถว ${rowNum}: ${error instanceof Error ? error.message : 'ข้อผิดพลาดไม่ทราบสาเหตุ'}`);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`นำเข้าข้อมูลสำเร็จ ${successCount} รายการ`);
        onSuccess();
      }

      if (errorCount > 0) {
        const errorMessage = `มีข้อผิดพลาด ${errorCount} รายการ:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`;
        toast.error(errorMessage);
      }

      if (successCount === 0 && errorCount === 0) {
        toast.info('ไม่พบข้อมูลที่ต้องนำเข้า');
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
