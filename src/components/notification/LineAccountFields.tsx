import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, KeyRound, Loader2, Trash2 } from 'lucide-react';

export type LineScope =
  | 'default'
  | 'online_orders'
  | 'pos_orders'
  | 'daily_reports'
  | 'monthly_reports';

interface LineAccountFieldsProps {
  shopId: string | null;
  scope: LineScope;
  /** ถ้าเป็น true จะแสดงตัวเลือก "ใช้บัญชีเริ่มต้นของร้าน" */
  allowUseDefault?: boolean;
  title?: string;
  description?: string;
}

interface StatusItem {
  scope: string;
  configured: boolean;
  tokenLast4: string | null;
  secretConfigured: boolean;
}

const LineAccountFields = ({
  shopId,
  scope,
  allowUseDefault = true,
  title = 'บัญชี LINE ที่ใช้ส่ง',
  description,
}: LineAccountFieldsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<StatusItem | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<StatusItem | null>(null);

  const loadStatus = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('line-credentials', {
        body: { action: 'list', shopId },
      });
      if (error) throw error;
      const items: StatusItem[] = data?.items || [];
      setStatus(items.find((i) => i.scope === scope) || null);
      setDefaultStatus(items.find((i) => i.scope === 'default') || null);
    } catch (e: any) {
      console.error('load line credentials failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, scope]);

  const handleSave = async () => {
    if (!shopId) {
      toast({ title: 'ยังไม่พบข้อมูลสาขา', description: 'กรุณารอสักครู่แล้วลองใหม่', variant: 'destructive' });
      return;
    }
    if (!token.trim()) {
      toast({ title: 'กรุณากรอก Channel Access Token', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      const { data, error } = await supabase.functions.invoke('line-credentials', {
        body: {
          action: 'save',
          shopId,
          scope,
          channelAccessToken: token.trim(),
          channelSecret: secret.trim(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setToken('');
      setSecret('');
      await loadStatus();
      toast({ title: 'บันทึกบัญชี LINE แล้ว ✅', description: 'การแจ้งเตือนนี้จะส่งจากบัญชีที่บันทึกไว้' });
    } catch (e: any) {
      toast({ title: 'บันทึกไม่สำเร็จ', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!shopId) return;
    try {
      setSaving(true);
      const { error } = await supabase.functions.invoke('line-credentials', {
        body: { action: 'clear', shopId, scope },
      });
      if (error) throw error;
      await loadStatus();
      toast({ title: 'ลบบัญชีเฉพาะรายการนี้แล้ว', description: 'จะกลับไปใช้บัญชีเริ่มต้น' });
    } catch (e: any) {
      toast({ title: 'ลบไม่สำเร็จ', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const usingDefault = !status?.configured;

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          <Label className="font-medium">{title}</Label>
        </div>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status?.configured ? (
          <Badge variant="default">ตั้งค่าแล้ว ••••{status.tokenLast4}</Badge>
        ) : allowUseDefault ? (
          <Badge variant="secondary">
            {defaultStatus?.configured ? 'ใช้บัญชีเริ่มต้นของร้าน' : 'ใช้บัญชีกลางของระบบ'}
          </Badge>
        ) : (
          <Badge variant="secondary">ยังไม่ตั้งค่า</Badge>
        )}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <Label className="text-xs">Channel Access Token</Label>
          <div className="flex gap-2">
            <Input
              type={showToken ? 'text' : 'password'}
              autoComplete="off"
              placeholder={status?.configured ? 'กรอกใหม่เพื่อเปลี่ยนบัญชี' : 'วาง Token จาก LINE Developers'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button type="button" size="icon" variant="outline" onClick={() => setShowToken((v) => !v)}>
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs">Channel Secret (ถ้ามี)</Label>
          <Input
            type="password"
            autoComplete="off"
            placeholder={status?.secretConfigured ? 'บันทึกไว้แล้ว' : 'วาง Channel Secret'}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || !shopId}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          บันทึกบัญชี
        </Button>
        {status?.configured && (
          <Button size="sm" variant="outline" onClick={handleClear} disabled={saving}>
            <Trash2 className="w-4 h-4 mr-1" />
            {allowUseDefault ? 'กลับไปใช้บัญชีเริ่มต้น' : 'ลบบัญชีนี้'}
          </Button>
        )}
      </div>

      {allowUseDefault && usingDefault && (
        <p className="text-xs text-muted-foreground">
          ไม่ต้องกรอกก็ได้ ระบบจะใช้บัญชีเริ่มต้นของร้าน หากอยากให้การแจ้งเตือนนี้ส่งจากบัญชี LINE คนละบัญชี ให้กรอกแล้วกดบันทึก
        </p>
      )}
    </div>
  );
};

export default LineAccountFields;
