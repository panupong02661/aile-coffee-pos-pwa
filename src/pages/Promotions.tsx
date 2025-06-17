import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PromotionForm from '@/components/PromotionForm';
import Header from '@/components/Header';
import MainSidebar from '@/components/MainSidebar';

const Promotions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const { data: promotions = [], refetch } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select(`
          *,
          promotion_menu_items (
            menu_items (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบโปรโมชั่นนี้หรือไม่?')) return;
    
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบโปรโมชั่นได้', variant: 'destructive' });
    } else {
      toast({ title: 'สำเร็จ', description: 'ลบโปรโมชั่นสำเร็จ' });
      refetch();
    }
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'ส่วนลดเปอร์เซ็นต์';
      case 'amount': return 'ส่วนลดจำนวนเงิน';
      case 'buy_get': return 'ซื้อแถม';
      case 'free_item': return 'ของแถม';
      default: return type;
    }
  };

  const getTargetGroupLabel = (group: string) => {
    switch (group) {
      case 'all': return 'ทุกคน';
      case 'silver': return 'สมาชิกเงิน';
      case 'gold': return 'สมาชิกทอง';
      case 'platinum': return 'สมาชิกแพลตตินั่ม';
      default: return group;
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <MainSidebar />
      
      <div className={`flex-1 p-4 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto">
          <Header 
            onToggleSidebar={handleToggleSidebar}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-coffee-800">จัดการโปรโมชั่น</h1>
            <p className="text-coffee-600 mt-2">สร้างและจัดการโปรโมชั่นต่างๆ</p>
          </div>

          <Card className="border-coffee-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-coffee-800">รายการโปรโมชั่น</CardTitle>
              <Button 
                className="bg-coffee-600 hover:bg-coffee-700"
                onClick={() => {
                  setEditingPromotion(null);
                  setShowForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                สร้างโปรโมชั่น
              </Button>
            </CardHeader>
            <CardContent>
              {promotions.length === 0 ? (
                <div className="text-center py-8 text-coffee-500">
                  <p>ยังไม่มีโปรโมชั่น</p>
                  <p className="text-sm mt-2">คลิกปุ่ม "สร้างโปรโมชั่น" เพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promotion) => (
                    <div key={promotion.id} className="border border-coffee-100 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-coffee-800 mb-2">{promotion.name}</h3>
                          <p className="text-sm text-coffee-600 mb-3">{promotion.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-coffee-700">ประเภท:</span>
                              <p className="text-coffee-600">{getPromotionTypeLabel(promotion.type)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-coffee-700">ส่วนลด:</span>
                              <p className="text-coffee-600">
                                {promotion.type === 'percentage' ? `${promotion.discount_value}%` : `฿${promotion.discount_value}`}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-coffee-700">กลุ่มเป้าหมาย:</span>
                              <p className="text-coffee-600">{getTargetGroupLabel(promotion.target_group)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-coffee-700">การใช้งาน:</span>
                              <p className="text-coffee-600">
                                {promotion.used_count}{promotion.usage_limit ? `/${promotion.usage_limit}` : ''} ครั้ง
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 text-sm">
                            <span className="font-medium text-coffee-700">ระยะเวลา:</span>
                            <p className="text-coffee-600">
                              {new Date(promotion.start_date).toLocaleDateString('th-TH')} - {new Date(promotion.end_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>

                          {promotion.promotion_menu_items && promotion.promotion_menu_items.length > 0 && (
                            <div className="mt-3 text-sm">
                              <span className="font-medium text-coffee-700">เมนูที่ใช้ได้:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {promotion.promotion_menu_items.map((item: any, index: number) => (
                                  <span key={index} className="bg-coffee-100 text-coffee-700 px-2 py-1 rounded text-xs">
                                    {item.menu_items?.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            promotion.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {promotion.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingPromotion(promotion);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDelete(promotion.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <PromotionForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              refetch();
              setEditingPromotion(null);
            }}
            editPromotion={editingPromotion}
          />
        </div>
      </div>
    </div>
  );
};

export default Promotions;
