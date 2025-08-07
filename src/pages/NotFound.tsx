
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Coffee className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-6xl font-bold text-primary mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            ไม่พบหน้าที่คุณกำลังมองหา
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            หน้าที่คุณต้องการเข้าถึงอาจถูกย้าย หรือไม่มีอยู่จริง
            กรุณาตรวจสอบ URL อีกครั้ง หรือกลับไปหน้าหลัก
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              asChild 
              className="flex-1"
              onClick={() => window.history.back()}
            >
              <Link to="#" onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าที่แล้ว
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                หน้าหลัก
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
