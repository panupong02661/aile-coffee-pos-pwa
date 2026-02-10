
import { useState } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Plus, Trash2, Calculator, TrendingUp } from 'lucide-react';

const RecipeManagement = () => {
  const { 
    menuItems,
    categories,
    ingredients,
    menuIngredients,
    getIngredientsForMenuItem,
    calculateMenuItemCost,
    calculateMenuItemProfit,
    calculateMenuItemMargin,
    refetch,
    loading 
  } = useSupabaseData();
  
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    ingredient_id: '',
    quantity_needed: 0
  });
  const [useCustomIngredient, setUseCustomIngredient] = useState(false);
  const [customIngredient, setCustomIngredient] = useState({
    name: '',
    quantity_needed: 0,
    unit: 'g',
    cost_per_unit: 0
  });

  const handleEditRecipe = async (menuItem: any) => {
    const currentIngredients = getIngredientsForMenuItem(menuItem.id);
    setRecipeIngredients(currentIngredients.map(mi => ({
      id: mi.id,
      ingredient_id: mi.ingredient_id,
      quantity_needed: mi.quantity_needed,
      ingredient: mi.ingredients
    })));
    setEditingRecipe(menuItem);
  };

  const handleAddIngredientToRecipe = () => {
    if (useCustomIngredient) {
      if (!customIngredient.name || customIngredient.quantity_needed <= 0) {
        toast({ title: 'ข้อผิดพลาด', description: 'กรุณาระบุชื่อวัตถุดิบและปริมาณ', variant: 'destructive' });
        return;
      }

      const customId = `custom-${Date.now()}`;
      setRecipeIngredients([...recipeIngredients, {
        id: null,
        ingredient_id: customId,
        quantity_needed: customIngredient.quantity_needed,
        is_custom: true,
        ingredient: {
          id: customId,
          name: customIngredient.name,
          unit: customIngredient.unit,
          cost_per_unit: customIngredient.cost_per_unit
        }
      }]);

      setCustomIngredient({ name: '', quantity_needed: 0, unit: 'g', cost_per_unit: 0 });
      return;
    }

    if (!newIngredient.ingredient_id || newIngredient.quantity_needed <= 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณาเลือกวัตถุดิบและระบุปริมาณ', variant: 'destructive' });
      return;
    }

    const ingredient = ingredients.find(i => i.id === newIngredient.ingredient_id);
    if (!ingredient) return;

    if (recipeIngredients.some(ri => ri.ingredient_id === newIngredient.ingredient_id)) {
      toast({ title: 'ข้อผิดพลาด', description: 'วัตถุดิบนี้มีในสูตรแล้ว', variant: 'destructive' });
      return;
    }

    setRecipeIngredients([...recipeIngredients, {
      id: null,
      ingredient_id: newIngredient.ingredient_id,
      quantity_needed: newIngredient.quantity_needed,
      ingredient: ingredient
    }]);

    setNewIngredient({ ingredient_id: '', quantity_needed: 0 });
  };

  const handleRemoveIngredientFromRecipe = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredientQuantity = (index: number, quantity: number) => {
    const updated = [...recipeIngredients];
    updated[index].quantity_needed = quantity;
    setRecipeIngredients(updated);
  };

  const handleSaveRecipe = async () => {
    if (!editingRecipe) return;

    try {
      // Delete existing recipe ingredients
      const { error: deleteError } = await supabase
        .from('menu_ingredients')
        .delete()
        .eq('menu_item_id', editingRecipe.id);

      if (deleteError) throw deleteError;

      // Insert new recipe ingredients (only non-custom ones go to DB)
      const dbIngredients = recipeIngredients.filter(ri => !ri.is_custom);
      if (dbIngredients.length > 0) {
        const { error: insertError } = await supabase
          .from('menu_ingredients')
          .insert(dbIngredients.map(ri => ({
            menu_item_id: editingRecipe.id,
            ingredient_id: ri.ingredient_id,
            quantity_needed: ri.quantity_needed
          })));

        if (insertError) throw insertError;
      }

      // Update menu item cost_price to include custom ingredients cost
      const totalCost = getCurrentRecipeCost();
      await supabase
        .from('menu_items')
        .update({ cost_price: totalCost })
        .eq('id', editingRecipe.id);

      toast({ title: 'สำเร็จ', description: 'บันทึกสูตรเมนูแล้ว' });
      setEditingRecipe(null);
      setRecipeIngredients([]);
      refetch.menuIngredients();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกสูตรได้', variant: 'destructive' });
    }
  };

  console.log('[RecipeManagement] Loading:', loading);
  console.log('[RecipeManagement] Menu items count:', menuItems?.length || 0);
  console.log('[RecipeManagement] Ingredients count:', ingredients?.length || 0);

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  const getCurrentRecipeCost = () => {
    return recipeIngredients.reduce((total, ri) => {
      const costPerUnit = ri.ingredient?.cost_per_unit || 0;
      return total + (ri.quantity_needed * costPerUnit);
    }, 0);
  };

  const getCurrentRecipeProfit = () => {
    if (!editingRecipe) return 0;
    return editingRecipe.price - getCurrentRecipeCost();
  };

  const getCurrentRecipeMargin = () => {
    if (!editingRecipe || editingRecipe.price === 0) return 0;
    return (getCurrentRecipeProfit() / editingRecipe.price) * 100;
  };

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          ทั้งหมด ({menuItems.length})
        </button>
        {categories.filter(c => c.is_active).map(cat => {
          const count = menuItems.filter(item => item.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenuItems.map((menuItem) => {
          const cost = calculateMenuItemCost(menuItem.id);
          const profit = calculateMenuItemProfit(menuItem.id);
          const margin = calculateMenuItemMargin(menuItem.id);
          const hasRecipe = getIngredientsForMenuItem(menuItem.id).length > 0;

          return (
            <Card key={menuItem.id} className={!hasRecipe ? 'border-yellow-300 bg-yellow-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{menuItem.name}</CardTitle>
                  {hasRecipe ? (
                    <Badge variant="default">
                      <ChefHat className="h-3 w-3 mr-1" />
                      มีสูตร
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      ไม่มีสูตร
                    </Badge>
                  )}
                </div>
                {menuItem.categories && (
                  <Badge variant="secondary">
                    {menuItem.categories.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ราคาขาย:</span>
                      <p className="font-medium">฿{menuItem.price}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ต้นทุน:</span>
                      <p className="font-medium">฿{cost.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">กำไร:</span>
                      <p className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ฿{profit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margin:</span>
                      <p className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {hasRecipe && (
                    <div className="text-xs text-muted-foreground">
                      <p>วัตถุดิบ: {getIngredientsForMenuItem(menuItem.id).length} รายการ</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleEditRecipe(menuItem)}
                    variant={hasRecipe ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    {hasRecipe ? 'แก้ไขสูตร' : 'สร้างสูตร'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Recipe Dialog */}
      <Dialog open={!!editingRecipe} onOpenChange={() => setEditingRecipe(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              สูตร: {editingRecipe?.name}
            </DialogTitle>
            <DialogDescription>
              จัดการวัตถุดิบและปริมาณในสูตรอาหาร
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cost Calculation Summary */}
            <Card className="bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  การคำนวณต้นทุน & กำไร
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">ราคาขาย</p>
                    <p className="text-xl font-bold">฿{editingRecipe?.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ต้นทุนรวม</p>
                    <p className="text-xl font-bold text-blue-600">฿{getCurrentRecipeCost().toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">กำไร</p>
                    <p className={`text-xl font-bold ${getCurrentRecipeProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ฿{getCurrentRecipeProfit().toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className={`text-xl font-bold ${getCurrentRecipeMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getCurrentRecipeMargin().toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Ingredient */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">เพิ่มวัตถุดิบในสูตร</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="custom-toggle" className="text-sm cursor-pointer">กำหนดเอง</Label>
                    <input
                      id="custom-toggle"
                      type="checkbox"
                      checked={useCustomIngredient}
                      onChange={(e) => setUseCustomIngredient(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {useCustomIngredient ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label>ชื่อวัตถุดิบ</Label>
                      <Input
                        value={customIngredient.name}
                        onChange={(e) => setCustomIngredient({ ...customIngredient, name: e.target.value })}
                        placeholder="เช่น น้ำกาแฟ"
                      />
                    </div>
                    <div>
                      <Label>ปริมาณ</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={customIngredient.quantity_needed}
                        onChange={(e) => setCustomIngredient({ ...customIngredient, quantity_needed: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>หน่วย</Label>
                      <Input
                        value={customIngredient.unit}
                        onChange={(e) => setCustomIngredient({ ...customIngredient, unit: e.target.value })}
                        placeholder="เช่น ml, g, ช้อน"
                      />
                    </div>
                    <div>
                      <Label>ต้นทุน/หน่วย (฿)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customIngredient.cost_per_unit}
                        onChange={(e) => setCustomIngredient({ ...customIngredient, cost_per_unit: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddIngredientToRecipe} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่ม
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ingredient-select">วัตถุดิบ</Label>
                      <Select
                        value={newIngredient.ingredient_id}
                        onValueChange={(value) => setNewIngredient({ ...newIngredient, ingredient_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกวัตถุดิบ" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients
                            .filter(ingredient => !recipeIngredients.some(ri => ri.ingredient_id === ingredient.id))
                            .map((ingredient) => (
                            <SelectItem key={ingredient.id} value={ingredient.id}>
                              {ingredient.name} (฿{ingredient.cost_per_unit}/{ingredient.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity-input">ปริมาณที่ใช้</Label>
                      <Input
                        id="quantity-input"
                        type="number"
                        step="0.1"
                        value={newIngredient.quantity_needed}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity_needed: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button onClick={handleAddIngredientToRecipe} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่ม
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipe Ingredients List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">วัตถุดิบในสูตร</CardTitle>
              </CardHeader>
              <CardContent>
                {recipeIngredients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">ยังไม่มีวัตถุดิบในสูตร</p>
                ) : (
                  <div className="space-y-3">
                    {recipeIngredients.map((ri, index) => (
                      <div key={`${ri.ingredient_id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{ri.ingredient?.name}</p>
                            {ri.is_custom && <Badge variant="outline" className="text-xs">กำหนดเอง</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ต้นทุน: ฿{ri.ingredient?.cost_per_unit || 0}/{ri.ingredient?.unit}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={ri.quantity_needed}
                            onChange={(e) => handleUpdateIngredientQuantity(index, Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground min-w-fit">
                            {ri.ingredient?.unit}
                          </span>
                          <div className="text-right min-w-fit">
                            <p className="text-sm font-medium">
                              ฿{((ri.ingredient?.cost_per_unit || 0) * ri.quantity_needed).toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveIngredientFromRecipe(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>ต้นทุนรวม:</span>
                        <span className="text-blue-600">฿{getCurrentRecipeCost().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setEditingRecipe(null)}>
                ยกเลิก
              </Button>
              <Button onClick={handleSaveRecipe}>
                บันทึกสูตร
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeManagement;
