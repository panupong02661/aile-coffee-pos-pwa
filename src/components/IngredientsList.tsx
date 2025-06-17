
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, ChevronUp, ChevronDown, AlertTriangle, Search, Package } from 'lucide-react';
import { DatabaseIngredient } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IngredientsListProps {
  ingredients: DatabaseIngredient[];
  onEdit: (ingredient: DatabaseIngredient) => void;
  onRefresh: () => void;
}

const IngredientsList = ({ ingredients, onEdit, onRefresh }: IngredientsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();

  const categories = [...new Set(ingredients.map(i => i.category))];

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ingredient.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSortOrderChange = async (ingredient: DatabaseIngredient, direction: 'up' | 'down') => {
    const currentIndex = ingredients.findIndex(i => i.id === ingredient.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === ingredients.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetIngredient = ingredients[targetIndex];

    try {
      await Promise.all([
        supabase
          .from('ingredients')
          .update({ sort_order: targetIngredient.sort_order })
          .eq('id', ingredient.id),
        supabase
          .from('ingredients')
          .update({ sort_order: ingredient.sort_order })
          .eq('id', targetIngredient.id)
      ]);

      onRefresh();
      toast({ title: 'สำเร็จ', description: 'เปลี่ยนลำดับสำเร็จ' });
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเปลี่ยนลำดับได้', variant: 'destructive' });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coffee: 'bg-amber-100 text-amber-800',
      dairy: 'bg-blue-100 text-blue-800',
      syrup: 'bg-purple-100 text-purple-800',
      sweetener: 'bg-pink-100 text-pink-800',
      bakery: 'bg-orange-100 text-orange-800',
      packaging: 'bg-gray-100 text-gray-800',
      other: 'bg-green-100 text-green-800'
    };
    return colors[category] || colors.other;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหาวัตถุดิบ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.map((ingredient, index) => {
          const isLowStock = ingredient.quantity <= ingredient.minimum_stock;
          const stockPercentage = (ingredient.quantity / ingredient.minimum_stock) * 100;
          
          return (
            <Card key={ingredient.id} className={`relative ${isLowStock ? 'border-orange-300 bg-orange-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortOrderChange(ingredient, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSortOrderChange(ingredient, 'down')}
                      disabled={index === filteredIngredients.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(ingredient.category)}>
                    {ingredient.category}
                  </Badge>
                  {isLowStock && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      สต็อกต่ำ
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">สต็อกปัจจุบัน</span>
                  <span className={`font-bold ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">สต็อกขั้นต่ำ</span>
                  <span className="text-sm text-gray-900">
                    {ingredient.minimum_stock} {ingredient.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ราคาต่อหน่วย</span>
                  <span className="font-medium">
                    {formatCurrency(ingredient.cost_per_unit)}
                  </span>
                </div>

                {ingredient.supplier && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ผู้จัดจำหน่าย</span>
                    <span className="text-sm text-gray-900 truncate max-w-32">
                      {ingredient.supplier}
                    </span>
                  </div>
                )}

                {/* Stock Level Indicator */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>ระดับสต็อก</span>
                    <span>{Math.round(stockPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        stockPercentage <= 100 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(ingredient)}
                  className="w-full mt-3"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไข
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบวัตถุดิบ</h3>
          <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
        </div>
      )}
    </div>
  );
};

export default IngredientsList;
