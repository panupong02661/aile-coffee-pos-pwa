import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category_id: string | null;
}

const RecommendedMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .limit(8);

      if (error) throw error;
      if (data) setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('ไม่สามารถโหลดเมนูแนะนำได้');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <h3 className="text-lg font-semibold mb-3 px-4">เมนูแนะนำ</h3>
        <div className="px-4">
          <div className="bg-muted rounded-xl p-6 animate-pulse">
            <div className="h-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <h3 className="text-lg font-semibold mb-3 px-4">เมนูแนะนำ</h3>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="px-4">
          {menuItems.map((item) => (
            <CarouselItem key={item.id} className="basis-2/5 sm:basis-1/3 md:basis-1/4">
              <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">🍽️</div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-1 mb-1">{item.name}</h4>
                  <p className="text-primary font-bold text-base">฿{item.price}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default RecommendedMenu;
