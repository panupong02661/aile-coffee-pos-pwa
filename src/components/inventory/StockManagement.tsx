import { useState } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package, AlertTriangle, ArrowUp, ArrowDown, Edit } from 'lucide-react';

const StockManagement = () => {
  const { 
    ingredients, 
    stockMovements,
    getLowStockIngredients,
    refetch,
    loading 
  } = useSupabaseData();
  
  const { toast } = useToast();
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  
  // Stock Movement Form
  const [movementForm, setMovementForm] = useState({
    ingredient_id: '',
    movement_type: 'purchase' as 'purchase' | 'adjustment' | 'usage' | 'waste',
    quantity_change: 0,
    cost_per_unit: 0,
    reference_number: '',
    notes: ''
  });

  // New Ingredient Form
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    category: 'other',
    quantity: 0,
    unit: 'g',
    minimum_stock: 10,
    cost_per_unit: 0,
    supplier: ''
  });

  const categories = [
    { value: 'coffee', label: 'กาแฟ' },
    { value: 'dairy', label: 'นม & ของแทน' },
    { value: 'sweetener', label: 'สารให้ความหวาน' },
    { value: 'syrup', label: 'ไซรัป' },
    { value: 'bakery', label: 'เบเกอรี่' },
    { value: 'packaging', label: 'บรรจุภัณฑ์' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  const movementTypes = [
    { value: 'purchase', label: 'ซื้อเข้า' },
    { value: 'adjustment', label: 'ปรับยอด' },
    { value: 'usage', label: 'ใช้งาน' },
    { value: 'waste', label: 'สูญเสีย/เสียหาย' }
  ];

  const units = [
    { value: 'g', label: 'กรัม (g)' },
    { value: 'kg', label: 'กิโลกรัม (kg)' },
    { value: 'ml', label: 'มิลลิลิตร (ml)' },
    { value: 'L', label: 'ลิตร (L)' },
    { value: 'pcs', label: 'ชิ้น (pcs)' }
  ];

  const handleStockMovement = async () => {
    if (!movementForm.ingredient_id || movementForm.quantity_change === 0) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    try {
      // Insert stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          ingredient_id: movementForm.ingredient_id,
          movement_type: movementForm.movement_type,
          quantity_change: movementForm.quantity_change,
          cost_per_unit: movementForm.cost_per_unit,
          reference_number: movementForm.reference_number,
          notes: movementForm.notes,
          created_by: 'admin'
        }]);

      if (movementError) throw movementError;

      // Update ingredient quantity
      const ingredient = ingredients.find(i => i.id === movementForm.ingredient_id);
      if (ingredient) {
        const newQuantity = ingredient.quantity + movementForm.quantity_change;
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ quantity: newQuantity })
          .eq('id', movementForm.ingredient_id);

        if (updateError) throw updateError;
      }

      toast({ title: 'สำเร็จ', description: 'บันทึกการเคลื่อนไหวสต็อกแล้ว' });
      setIsAddingStock(false);
      setMovementForm({
        ingredient_id: '',
        movement_type: 'purchase',
        quantity_change: 0,
        cost_per_unit: 0,
        reference_number: '',
        notes: ''
      });
      refetch.ingredients();
      refetch.stockMovements();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    }
  };

  const handleAddIngredient = async () => {
    if (!ingredientForm.name.trim()) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อวัตถุดิบ', variant: 'destructive' });
      return;
    }

    console.log('[StockManagement] Adding ingredient:', ingredientForm);

    try {
      // Prepare ingredient data with proper structure
      const ingredientData = {
        name: ingredientForm.name.trim(),
        category: ingredientForm.category || 'other',
        quantity: Number(ingredientForm.quantity) || 0,
        unit: ingredientForm.unit || 'g',
        minimum_stock: Number(ingredientForm.minimum_stock) || 10,
        cost_per_unit: Number(ingredientForm.cost_per_unit) || 0,
        supplier: ingredientForm.supplier?.trim() || '',
        sort_order: ingredients.length + 1,
        is_active: true
      };

      console.log('[StockManagement] Prepared data:', ingredientData);

      const { data: insertedData, error } = await supabase
        .from('ingredients')
        .insert([ingredientData])
        .select();

      if (error) {
        console.error('[StockManagement] Insert error:', error);
        throw error;
      }

      console.log('[StockManagement] Insert successful:', insertedData);

      toast({ 
        title: 'สำเร็จ', 
        description: `เพิ่มวัตถุดิบ "${ingredientForm.name}" แล้ว` 
      });
      
      setIsAddingIngredient(false);
      
      // Reset form
      setIngredientForm({
        name: '',
        category: 'other',
        quantity: 0,
        unit: 'g',
        minimum_stock: 10,
        cost_per_unit: 0,
        supplier: ''
      });
      
      // Refresh data
      await refetch.ingredients();
      
    } catch (error: any) {
      console.error('[StockManagement] Full error details:', error);
      
      let errorMessage = 'ไม่สามารถเพิ่มวัตถุดิบได้';
      
      if (error?.message) {
        if (error.message.includes('duplicate')) {
          errorMessage = 'ชื่อวัตถุดิบซ้ำกับที่มีอยู่แล้ว';
        } else if (error.message.includes('null')) {
          errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
        } else {
          errorMessage = `เกิดข้อผิดพลาด: ${error.message}`;
        }
      }
      
      toast({ 
        title: 'ข้อผิดพลาด', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateIngredient = async () => {
    if (!editingIngredient?.name) {
      toast({ title: 'ข้อผิดพลาด', description: 'กรุณากรอกชื่อวัตถุดิบ', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('ingredients')
        .update({
          name: editingIngredient.name,
          category: editingIngredient.category,
          unit: editingIngredient.unit,
          minimum_stock: editingIngredient.minimum_stock,
          cost_per_unit: editingIngredient.cost_per_unit,
          supplier: editingIngredient.supplier
        })
        .eq('id', editingIngredient.id);

      if (error) throw error;

      toast({ title: 'สำเร็จ', description: 'อัปเดตข้อมูลวัตถุดิบแล้ว' });
      setEditingIngredient(null);
      refetch.ingredients();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถอัปเดตข้อมูลได้', variant: 'destructive' });
    }
  };

  const moveIngredient = async (ingredientId: string, direction: 'up' | 'down') => {
    const currentIndex = ingredients.findIndex(i => i.id === ingredientId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= ingredients.length) return;

    const current = ingredients[currentIndex];
    const target = ingredients[targetIndex];

    try {
      // Swap sort orders
      await supabase
        .from('ingredients')
        .update({ sort_order: target.sort_order })
        .eq('id', current.id);

      await supabase
        .from('ingredients')
        .update({ sort_order: current.sort_order })
        .eq('id', target.id);

      refetch.ingredients();
    } catch (error) {
      console.error('Error moving ingredient:', error);
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถเปลี่ยนตำแหน่งได้', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  }

  const lowStockItems = getLowStockIngredients();
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, typeof ingredients>);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isAddingStock} onOpenChange={setIsAddingStock}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Package className="h-4 w-4 mr-2" />
              Stock Movement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>บันทึกการเคลื่อนไหวสต็อก</DialogTitle>
              <DialogDescription>
                เพิ่ม/ลด สต็อกวัตถุดิบ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="ingredient">วัตถุดิบ</Label>
                <Select
                  value={movementForm.ingredient_id}
                  onValueChange={(value) => setMovementForm({ ...movementForm, ingredient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกวัตถุดิบ" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} (เหลือ {ingredient.quantity} {ingredient.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="movement_type">ประเภท</Label>
                <Select
                  value={movementForm.movement_type}
                  onValueChange={(value: any) => setMovementForm({ ...movementForm, movement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">จำนวน (+ เพิ่ม, - ลด)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={movementForm.quantity_change}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity_change: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="cost_per_unit">ต้นทุนต่อหน่วย (ถ้ามี)</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  value={movementForm.cost_per_unit}
                  onChange={(e) => setMovementForm({ ...movementForm, cost_per_unit: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="reference">เลขที่อ้างอิง</Label>
                <Input
                  id="reference"
                  value={movementForm.reference_number}
                  onChange={(e) => setMovementForm({ ...movementForm, reference_number: e.target.value })}
                  placeholder="เลขที่ใบเสร็จ, Order เลขที่"
                />
              </div>

              <div>
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  placeholder="หมายเหตุเพิ่มเติม"
                />
              </div>

              <Button onClick={handleStockMovement} className="w-full">
                บันทึก
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มวัตถุดิบ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มวัตถุดิบใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">ชื่อวัตถุดิบ *</Label>
                <Input
                  id="name"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  placeholder="กรอกชื่อวัตถุดิบ"
                />
              </div>

              <div>
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select
                  value={ingredientForm.category}
                  onValueChange={(value) => setIngredientForm({ ...ingredientForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">จำนวนเริ่มต้น</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={ingredientForm.quantity}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, quantity: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="unit">หน่วย</Label>
                  <Select
                    value={ingredientForm.unit}
                    onValueChange={(value) => setIngredientForm({ ...ingredientForm, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimum_stock">สต็อกขั้นต่ำ</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    min="0"
                    value={ingredientForm.minimum_stock}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, minimum_stock: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="cost_per_unit">ต้นทุนต่อหน่วย</Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={ingredientForm.cost_per_unit}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, cost_per_unit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplier">ผู้จัดจำหน่าย</Label>
                <Input
                  id="supplier"
                  value={ingredientForm.supplier}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, supplier: e.target.value })}
                  placeholder="ระบุชื่อผู้จัดจำหน่าย (ถ้ามี)"
                />
              </div>

              <Button onClick={handleAddIngredient} className="w-full">
                เพิ่มวัตถุดิบ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="low-stock" className="text-orange-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            สต็อกต่ำ ({lowStockItems.length})
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label} ({groupedIngredients[cat.value]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ingredients.map((ingredient, index) => (
              <Card key={ingredient.id} className={ingredient.quantity <= ingredient.minimum_stock ? 'border-orange-300 bg-orange-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveIngredient(ingredient.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveIngredient(ingredient.id, 'down')}
                        disabled={index === ingredients.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIngredient({ ...ingredient })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant={ingredient.quantity <= ingredient.minimum_stock ? 'destructive' : 'secondary'}>
                    {categories.find(c => c.value === ingredient.category)?.label || ingredient.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>จำนวนคงเหลือ:</span>
                      <span className={ingredient.quantity <= ingredient.minimum_stock ? 'text-orange-600 font-medium' : ''}>
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>สต็อกขั้นต่ำ:</span>
                      <span>{ingredient.minimum_stock} {ingredient.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ต้นทุนต่อหน่วย:</span>
                      <span>฿{ingredient.cost_per_unit}</span>
                    </div>
                    {ingredient.supplier && (
                      <div className="flex justify-between">
                        <span>ผู้จัดจำหน่าย:</span>
                        <span className="text-sm">{ingredient.supplier}</span>
                      </div>
                    )}
                    {ingredient.quantity <= ingredient.minimum_stock && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        ต้องเติมสต็อก {ingredient.minimum_stock - ingredient.quantity} {ingredient.unit}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low-stock">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((ingredient) => (
              <Card key={ingredient.id} className="border-orange-300 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    {ingredient.name}
                  </CardTitle>
                  <Badge variant="destructive">
                    {categories.find(c => c.value === ingredient.category)?.label || ingredient.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>จำนวนคงเหลือ:</span>
                      <span className="text-orange-600 font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>สต็อกขั้นต่ำ:</span>
                      <span>{ingredient.minimum_stock} {ingredient.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ต้องเติมสต็อก:</span>
                      <span className="text-red-600 font-medium">
                        {ingredient.minimum_stock - ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(groupedIngredients[cat.value] || []).map((ingredient) => (
                <Card key={ingredient.id} className={ingredient.quantity <= ingredient.minimum_stock ? 'border-orange-300 bg-orange-50' : ''}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                    <Badge variant={ingredient.quantity <= ingredient.minimum_stock ? 'destructive' : 'secondary'}>
                      {cat.label}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>จำนวนคงเหลือ:</span>
                        <span className={ingredient.quantity <= ingredient.minimum_stock ? 'text-orange-600 font-medium' : ''}>
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>สต็อกขั้นต่ำ:</span>
                        <span>{ingredient.minimum_stock} {ingredient.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ต้นทุนต่อหน่วย:</span>
                        <span>฿{ingredient.cost_per_unit}</span>
                      </div>
                      {ingredient.supplier && (
                        <div className="flex justify-between">
                          <span>ผู้จัดจำหน่าย:</span>
                          <span className="text-sm">{ingredient.supplier}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Ingredient Dialog */}
      <Dialog open={!!editingIngredient} onOpenChange={() => setEditingIngredient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขวัตถุดิบ</DialogTitle>
          </DialogHeader>
          {editingIngredient && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">ชื่อวัตถุดิบ</Label>
                <Input
                  id="edit-name"
                  value={editingIngredient.name}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-category">หมวดหมู่</Label>
                <Select
                  value={editingIngredient.category}
                  onValueChange={(value) => setEditingIngredient({ ...editingIngredient, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-unit">หน่วย</Label>
                <Select
                  value={editingIngredient.unit}
                  onValueChange={(value) => setEditingIngredient({ ...editingIngredient, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-minimum-stock">สต็อกขั้นต่ำ</Label>
                  <Input
                    id="edit-minimum-stock"
                    type="number"
                    value={editingIngredient.minimum_stock}
                    onChange={(e) => setEditingIngredient({ ...editingIngredient, minimum_stock: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-cost-per-unit">ต้นทุนต่อหน่วย</Label>
                  <Input
                    id="edit-cost-per-unit"
                    type="number"
                    step="0.01"
                    value={editingIngredient.cost_per_unit}
                    onChange={(e) => setEditingIngredient({ ...editingIngredient, cost_per_unit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-supplier">ผู้จัดจำหน่าย</Label>
                <Input
                  id="edit-supplier"
                  value={editingIngredient.supplier || ''}
                  onChange={(e) => setEditingIngredient({ ...editingIngredient, supplier: e.target.value })}
                />
              </div>

              <Button onClick={handleUpdateIngredient} className="w-full">
                บันทึกการแก้ไข
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;
