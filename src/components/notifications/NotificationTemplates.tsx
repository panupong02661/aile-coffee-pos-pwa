
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Edit, Trash2, MessageSquare, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { NotificationTemplate, NotificationService } from './NotificationService';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'ออเดอร์ใหม่',
      title: 'มีออเดอร์ใหม่!',
      body: 'ออเดอร์ #{{orderNumber}} ยอดรวม {{amount}} บาท',
      category: 'orders',
      usage: 245
    },
    {
      id: '2', 
      name: 'สต็อกต่ำ',
      title: 'แจ้งเตือนสต็อก',
      body: 'วัตถุดิบ {{itemName}} เหลือ {{quantity}} {{unit}}',
      category: 'inventory',
      usage: 89
    },
    {
      id: '3',
      name: 'โปรโมชั่นพิเศษ',
      title: 'โปรโมชั่นใหม่!',
      body: 'รับส่วนลด {{discount}}% สำหรับ {{menuItem}}',
      category: 'promotions', 
      usage: 156
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    title: '',
    body: '',
    category: 'orders'
  });

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.title || !newTemplate.body) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        variant: 'destructive'
      });
      return;
    }

    const template: NotificationTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      usage: 0
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: '', title: '', body: '', category: 'orders' });
    
    toast({
      title: 'สำเร็จ',
      description: 'สร้างเทมเพลตการแจ้งเตือนแล้ว'
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: 'สำเร็จ',
      description: 'ลบเทมเพลตแล้ว'
    });
  };

  const handleTestNotification = (template: NotificationTemplate) => {
    const success = NotificationService.sendTestNotification(template);
    if (success) {
      toast({
        title: 'ส่งการทดสอบแล้ว',
        description: 'ตรวจสอบการแจ้งเตือนในเบราว์เซอร์'
      });
      
      // Update usage count
      setTemplates(templates.map(t => 
        t.id === template.id ? { ...t, usage: t.usage + 1 } : t
      ));
    } else {
      toast({
        title: 'ไม่สามารถส่งได้',
        description: 'กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์',
        variant: 'destructive'
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'orders': return Bell;
      case 'inventory': return AlertTriangle;
      case 'promotions': return TrendingUp;
      case 'system': return MessageSquare;
      default: return Bell;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'orders': return 'bg-blue-100 text-blue-800';
      case 'inventory': return 'bg-orange-100 text-orange-800';
      case 'promotions': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* สร้างเทมเพลตใหม่ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            สร้างเทมเพลตการแจ้งเตือน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">ชื่อเทมเพลต</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="เช่น ออเดอร์ใหม่"
              />
            </div>
            <div>
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">ออเดอร์</SelectItem>
                  <SelectItem value="inventory">สินค้าคงคลัง</SelectItem>
                  <SelectItem value="promotions">โปรโมชั่น</SelectItem>
                  <SelectItem value="system">ระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="title">หัวข้อการแจ้งเตือน</Label>
            <Input
              id="title"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
              placeholder="เช่น มีออเดอร์ใหม่!"
            />
          </div>

          <div>
            <Label htmlFor="body">เนื้อหาการแจ้งเตือน</Label>
            <Textarea
              id="body"
              value={newTemplate.body}
              onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
              placeholder="ใช้ตัวแปรเช่น {{orderNumber}}, {{amount}}, {{itemName}}"
              rows={3}
            />
          </div>

          <Button onClick={handleCreateTemplate} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            สร้างเทมเพลต
          </Button>
        </CardContent>
      </Card>

      {/* รายการเทมเพลต */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            เทมเพลตการแจ้งเตือนทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => {
              const IconComponent = getCategoryIcon(template.category);
              return (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <IconComponent className="w-6 h-6 text-gray-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {template.usage}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{template.title}</p>
                      <p className="text-sm text-gray-600">{template.body}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestNotification(template)}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      ทดสอบ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTemplates;
