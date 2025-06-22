
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
      const { data, error } = await supabase
        .from('customer_gifts')
        .select('*')
        .eq('gift_code', code.toUpperCase());
      
      console.log('Debug check result:', { data, error });
      setResult({ data, error });
    } catch (err) {
      console.error('Debug error:', err);
      setResult({ error: err });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 border rounded shadow-lg">
      <div className="text-sm font-bold mb-2">Debug Code Checker</div>
      <div className="flex gap-2 mb-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="w-32"
        />
        <Button onClick={checkCode} size="sm">Check</Button>
      </div>
      {result && (
        <pre className="text-xs bg-gray-100 p-2 rounded max-w-md overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DebugCodeChecker;
