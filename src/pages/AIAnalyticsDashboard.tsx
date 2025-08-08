
import React, { useState } from 'react';
import MainSidebar from '@/components/MainSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AIAnalyticsDashboard from '@/components/analytics/AIAnalyticsDashboard';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';

const AIAnalyticsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-50">
      <MainSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1">
        <div className="p-4">
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(true)}
            categories={[]}
            selectedCategory=""
            onCategorySelect={() => {}}
            gridColumns={4}
            setGridColumns={() => {}}
            itemSize="medium"
            setItemSize={() => {}}
            page="other"
          />
          
          <div className="max-w-7xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl text-coffee-800 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  AI Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-lg">
                  ระบบวิเคราะห์ข้อมูลด้วยปัญญาประดิษฐ์ เพื่อให้ข้อมูลเชิงลึกและการทำนายที่แม่นยำ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">การทำนายแนวโน้ม</h3>
                      <p className="text-sm text-blue-700">วิเคราะห์ข้อมูลเพื่อทำนายอนาคต</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-purple-900">การแนะนำที่แม่นยำ</h3>
                      <p className="text-sm text-purple-700">ข้อเสนอแนะเพื่อเพิ่มประสิทธิภาพ</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <Lightbulb className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-900">ข้อมูลเชิงลึก</h3>
                      <p className="text-sm text-yellow-700">ค้นหาโอกาสและจุดที่ต้องปรับปรุง</p>
                    </div>
                  </div>
                </div>

                <AIAnalyticsDashboard />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsPage;
