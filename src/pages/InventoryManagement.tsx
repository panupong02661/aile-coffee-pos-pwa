
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import Header from '@/components/Header';
import IngredientsList from '@/components/IngredientsList';
import IngredientForm from '@/components/IngredientForm';
import StockMovementForm from '@/components/StockMovementForm';
import RecipeManagement from '@/components/RecipeManagement';
import InventoryReports from '@/components/InventoryReports';
import { DatabaseIngredient } from '@/hooks/useSupabaseData';

const InventoryManagement = () => {
  const { ingredients, loading, refetch } = useSupabaseData();
  const [activeTab, setActiveTab] = useState('stock');
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<DatabaseIngredient | null>(null);

  const lowStockIngredients = ingredients.filter(
    ingredient => ingredient.quantity <= ingredient.minimum_stock && ingredient.is_active
  );

  const handleIngredientSuccess = () => {
    refetch.ingredients();
    setShowIngredientForm(false);
    setEditingIngredient(null);
  };

  const handleStockMovementSuccess = () => {
    refetch.ingredients();
    refetch.stockMovements();
    setShowStockForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onToggleSidebar={() => {}}
          categories={[]}
          selectedCategory=""
          onCategorySelect={() => {}}
          gridColumns={4}
          setGridColumns={() => {}}
          itemSize="medium"
          setItemSize={() => {}}
          page="other"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={() => {}}
        categories={[]}
        selectedCategory=""
        onCategorySelect={() => {}}
        gridColumns={4}
        setGridColumns={() => {}}
        itemSize="medium"
        setItemSize={() => {}}
        page="other"
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการคลังสินค้า</h1>
          
          {lowStockIngredients.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                วัตถุดิบใกล้หมด {lowStockIngredients.length} รายการ
              </span>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              จัดการสต็อก
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              สูตรและต้นทุน
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              รายงาน
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              การเคลื่อนไหว
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">จัดการวัตถุดิบ</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowStockForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Stock Movement
                </Button>
                <Button
                  onClick={() => setShowIngredientForm(true)}
                  className="bg-coffee-600 hover:bg-coffee-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มวัตถุดิบ
                </Button>
              </div>
            </div>

            <IngredientsList
              ingredients={ingredients}
              onEdit={setEditingIngredient}
              onRefresh={refetch.ingredients}
            />
          </TabsContent>

          <TabsContent value="recipes">
            <RecipeManagement />
          </TabsContent>

          <TabsContent value="reports">
            <InventoryReports />
          </TabsContent>

          <TabsContent value="movements">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">ประวัติการเคลื่อนไหวสต็อก</h2>
              {/* Stock movements history will be shown here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <IngredientForm
        isOpen={showIngredientForm || !!editingIngredient}
        onClose={() => {
          setShowIngredientForm(false);
          setEditingIngredient(null);
        }}
        onSuccess={handleIngredientSuccess}
        editingIngredient={editingIngredient}
      />

      <StockMovementForm
        isOpen={showStockForm}
        onClose={() => setShowStockForm(false)}
        onSuccess={handleStockMovementSuccess}
        ingredients={ingredients}
      />
    </div>
  );
};

export default InventoryManagement;
