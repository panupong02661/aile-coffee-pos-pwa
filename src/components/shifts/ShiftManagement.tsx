
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData, DatabaseShift } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, DollarSign, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const ShiftManagement = () => {
  const { shifts, refetch } = useSupabaseData();
  const { toast } = useToast();
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);

  const activeShift = shifts.find(shift => shift.status === 'active');

  const handleStartShift = async () => {
    setIsStartingShift(true);
    try {
      const { error } = await supabase.from('shifts').insert({
        shift_start: new Date().toISOString(),
        opening_cash: parseFloat(openingCash) || 0,
        status: 'active',
        notes: notes || null
      });

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'เริ่มเวรทำงานแล้ว',
      });

      setOpeningCash('');
      setNotes('');
      refetch.shifts();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถเริ่มเวรทำงานได้',
        variant: 'destructive',
      });
    } finally {
      setIsStartingShift(false);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;

    setIsClosingShift(true);
    try {
      const closingAmount = parseFloat(closingCash) || 0;
      const difference = closingAmount - activeShift.opening_cash;

      const { error } = await supabase
        .from('shifts')
        .update({
          shift_end: new Date().toISOString(),
          closing_cash: closingAmount,
          cash_difference: difference,
          status: 'closed',
          notes: notes || activeShift.notes
        })
        .eq('id', activeShift.id);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'ปิดเวรทำงานแล้ว',
      });

      setClosingCash('');
      setNotes('');
      refetch.shifts();
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถปิดเวรทำงานได้',
        variant: 'destructive',
      });
    } finally {
      setIsClosingShift(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">จัดการเวรทำงาน</h1>
        {activeShift && (
          <Badge variant="secondary" className="text-lg px-3 py-1">
            <Clock className="w-4 h-4 mr-2" />
            เวรกำลังทำงาน
          </Badge>
        )}
      </div>

      {/* Current Shift Status */}
      {activeShift ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              เวรปัจจุบัน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>เวลาเริ่มเวร</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(activeShift.shift_start).toLocaleString('th-TH')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activeShift.shift_start), { 
                    addSuffix: true, 
                    locale: th 
                  })}
                </p>
              </div>
              <div>
                <Label>เงินเปิดลิ้นชัก</Label>
                <p className="text-lg font-semibold">
                  ฿{activeShift.opening_cash.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>หมายเหตุ</Label>
                <p className="text-sm text-muted-foreground">
                  {activeShift.notes || '-'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">ปิดเวรทำงาน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="closing-cash">เงินปิดลิ้นชัก</Label>
                  <Input
                    id="closing-cash"
                    type="number"
                    step="0.01"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="close-notes">หมายเหตุ</Label>
                  <Textarea
                    id="close-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="หมายเหตุเพิ่มเติม..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
              <Button
                onClick={handleCloseShift}
                disabled={isClosingShift || !closingCash}
                className="mt-4"
                variant="destructive"
              >
                {isClosingShift ? 'กำลังปิดเวร...' : 'ปิดเวรทำงาน'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              เริ่มเวรทำงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opening-cash">เงินเปิดลิ้นชัก</Label>
                <Input
                  id="opening-cash"
                  type="number"
                  step="0.01"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="start-notes">หมายเหตุ</Label>
                <Textarea
                  id="start-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
            <Button
              onClick={handleStartShift}
              disabled={isStartingShift}
              className="w-full md:w-auto"
            >
              {isStartingShift ? 'กำลังเริ่มเวร...' : 'เริ่มเวรทำงาน'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            ประวัติเวรทำงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                ยังไม่มีประวัติเวรทำงาน
              </p>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={shift.status === 'active' ? 'default' : 'secondary'}>
                        {shift.status === 'active' ? 'กำลังทำงาน' : 'ปิดแล้ว'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(shift.shift_start).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    {shift.cash_difference !== null && (
                      <Badge 
                        variant={shift.cash_difference >= 0 ? 'default' : 'destructive'}
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        {shift.cash_difference >= 0 ? '+' : ''}
                        ฿{shift.cash_difference.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">เริ่ม:</span>
                      <p>{new Date(shift.shift_start).toLocaleTimeString('th-TH')}</p>
                    </div>
                    {shift.shift_end && (
                      <div>
                        <span className="text-muted-foreground">ปิด:</span>
                        <p>{new Date(shift.shift_end).toLocaleTimeString('th-TH')}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">เปิดลิ้นชัก:</span>
                      <p>฿{shift.opening_cash.toLocaleString()}</p>
                    </div>
                    {shift.closing_cash !== null && (
                      <div>
                        <span className="text-muted-foreground">ปิดลิ้นชัก:</span>
                        <p>฿{shift.closing_cash.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {shift.notes && (
                    <div>
                      <span className="text-sm text-muted-foreground">หมายเหตุ:</span>
                      <p className="text-sm">{shift.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftManagement;
