
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
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as MenuExcelData[];

      if (jsonData.length === 0) {
        toast.error('ไม่พบข้อมูลในไฟล์');
        return;
      }

      // Create category lookup map (reverse)
      const categoryNameMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id;
        return acc;
      }, {} as Record<string, string>);

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const row of jsonData) {
        try {
          // Validate required fields
          if (!row['ชื่อเมนู']) {
            errors.push(`แถว ${successCount + errorCount + 1}: ชื่อเมนูไม่สามารถว่างได้`);
            errorCount++;
            continue;
          }

          if (!row['ราคา'] || isNaN(Number(row['ราคา']))) {
            errors.push(`แถว ${successCount + errorCount + 1}: ราคาไม่ถูกต้อง`);
            errorCount++;
            continue;
          }

          // Find category ID
          let categoryId = null;
          if (row['หมวดหมู่'] && categoryNameMap[row['หมวดหมู่']]) {
            categoryId = categoryNameMap[row['หมวดหมู่']];
          }

          // Check if menu item exists
          const { data: existingItem, error: checkError } = await supabase
            .from('menu_items')
            .select('id')
            .eq('name', row['ชื่อเมนู'])
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          const menuData = {
            name: row['ชื่อเมนู'],
            description: row['คำอธิบาย'] || null,
            price: Number(row['ราคา']),
            cost_price: Number(row['ต้นทุน']) || 0,
            category_id: categoryId,
            image_url: row['รูปภาพ URL'] || null,
            is_available: row['สถานะ'] === 'พร้อมจำหน่าย',
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
          console.error(`Error processing row:`, error);
          errors.push(`แถว ${successCount + errorCount + 1}: ${error instanceof Error ? error.message : 'ข้อผิดพลาดไม่ทราบสาเหตุ'}`);
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

    } catch (error) {
      console.error('Import error:', error);
      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
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
