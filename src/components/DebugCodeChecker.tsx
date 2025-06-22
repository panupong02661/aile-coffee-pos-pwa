
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const DebugCodeChecker = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);

  const checkCode = async () => {
    if (!code.trim()) return;
    
    try {
      const upperCode = code.toUpperCase().trim();
      
      const { data, error } = await supabase
        .from('customer_gifts')
        .select(`
          *,
          menu_items (
            id,
            name,
            price,
            is_available
          )
        `)
        .eq('gift_code', upperCode)
        .order('created_at', { ascending: false });
      
      console.log('Debug - ผลการตรวจสอบโค้ด:', { data, error });
      
      // วิเคราะห์ผลลัพธ์
      let analysis = {
        total_codes: data?.length || 0,
        available_codes: data?.filter(item => !item.is_used).length || 0,
        used_codes: data?.filter(item => item.is_used).length || 0,
        expired_codes: 0,
        details: data?.map(item => ({
          id: item.id,
          is_used: item.is_used,
          used_at: item.used_at,
          expires_at: item.expires_at,
          gift_type: item.gift_type,
          gift_name: item.gift_name,
          customer_id: item.customer_id
        })) || []
      };

      // ตรวจสอบโค้ดหมดอายุ
      if (data) {
        const currentDate = new Date();
        analysis.expired_codes = data.filter(item => 
          item.expires_at && new Date(item.expires_at) < currentDate
        ).length;
      }
      
      setResult({ data, error, analysis });
    } catch (err) {
      console.error('Debug error:', err);
      setResult({ error: err });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 border rounded shadow-lg max-w-lg">
      <div className="text-sm font-bold mb-2 text-green-600">🔍 Debug Code Checker</div>
      <div className="flex gap-2 mb-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ใส่โค้ด เช่น I2ECCM"
          className="w-40"
        />
        <Button onClick={checkCode} size="sm" className="bg-green-600 hover:bg-green-700">
          ตรวจสอบ
        </Button>
        <Button 
          onClick={() => setResult(null)} 
          size="sm" 
          variant="outline"
        >
          ล้าง
        </Button>
      </div>
      
      {result && (
        <div className="text-xs bg-gray-100 p-3 rounded max-h-80 overflow-auto">
          {result.analysis && (
            <div className="mb-3 p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-800 mb-1">📊 สรุปผล:</div>
              <div>โค้ดทั้งหมด: {result.analysis.total_codes}</div>
              <div className="text-green-600">✅ ใช้ได้: {result.analysis.available_codes}</div>
              <div className="text-red-600">❌ ใช้แล้ว: {result.analysis.used_codes}</div>
              <div className="text-orange-600">⏰ หมดอายุ: {result.analysis.expired_codes}</div>
            </div>
          )}
          
          <div className="font-semibold mb-1">🔧 ข้อมูลดิบ:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugCodeChecker;
