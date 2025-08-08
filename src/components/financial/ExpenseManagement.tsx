
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Receipt, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Expense {
  id: string;
  category_id?: string;
  amount: number;
  expense_date: string;
  description?: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  expense_categories?: {
    name: string;
  };
}

const ExpenseManagement = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  const [expenseForm, setExpenseForm] = useState({
    category_id: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    receipt_url: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [selectedMonth]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('sort_order');
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดหมวดหมู่ค่าใช้จ่ายได้', variant: 'destructive' });
      return;
    }
    
    setCategories(data || []);
  };

  const fetchExpenses = async () => {
    const startDate = selectedMonth + '-01';
    const endDate = new Date(selectedMonth + '-01');
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_categories (name)
      `)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate.toISOString().split('T')[0])
      .order('expense_date', { ascending: false });
    
    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลค่าใช้จ่ายได้', variant: 'destructive' });
      return;
    }
    
    setExpenses(data || []);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('expense_categories')
          .update({
            name: categoryForm.name,
            description: categoryForm.description,
            sort_order: categoryForm.sort_order,
            is_active: categoryForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'แก้ไขหมวดหมู่เรียบร้อยแล้ว' });
      } else {
        const { error } = await supabase
          .from('expense_categories')
          .insert([categoryForm]);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'เพิ่มหมวดหมู่เรียบร้อยแล้ว' });
      }

      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', sort_order: 0, is_active: true });
      fetchCategories();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update({
            category_id: expenseForm.category_id || null,
            amount: expenseForm.amount,
            expense_date: expenseForm.expense_date,
            description: expenseForm.description,
            receipt_url: expenseForm.receipt_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'แก้ไขค่าใช้จ่ายเรียบร้อยแล้ว' });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{
            category_id: expenseForm.category_id || null,
            amount: expenseForm.amount,
            expense_date: expenseForm.expense_date,
            description: expenseForm.description,
            receipt_url: expenseForm.receipt_url,
            created_by: 'admin'
          }]);

        if (error) throw error;
        toast({ title: 'สำเร็จ', description: 'บันทึกค่าใช้จ่ายเรียบร้อยแล้ว' });
      }

      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      setExpenseForm({
        category_id: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        receipt_url: ''
      });
      fetchExpenses();
    } catch (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category: ExpenseCategory) => {
    if (!confirm('คุณต้องการลบหมวดหมู่นี้หรือไม่?')) return;

    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', category.id);

    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบหมวดหมู่ได้', variant: 'destructive' });
      return;
    }

    toast({ title: 'สำเร็จ', description: 'ลบหมวดหมู่เรียบร้อยแล้ว' });
    fetchCategories();
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (!confirm('คุณต้องการลบรายการค่าใช้จ่ายนี้หรือไม่?')) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id);

    if (error) {
      toast({ title: 'ข้อผิดพลาด', description: 'ไม่สามารถลบรายการค่าใช้จ่ายได้', variant: 'destructive' });
      return;
    }

    toast({ title: 'สำเร็จ', description: 'ลบรายการค่าใช้จ่ายเรียบร้อยแล้ว' });
    fetchExpenses();
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: { name: string; total: number } } = {};
    
    expenses.forEach(expense => {
      const categoryName = expense.expense_categories?.name || 'ไม่ระบุหมวดหมู่';
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { name: categoryName, total: 0 };
      }
      categoryTotals[categoryName].total += expense.amount;
    });

    return Object.values(categoryTotals);
  };

  const openEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order,
      is_active: category.is_active
    });
    setIsCategoryDialogOpen(true);
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      category_id: expense.category_id || '',
      amount: expense.amount,
      expense_date: expense.expense_date,
      description: expense.description || '',
      receipt_url: expense.receipt_url || ''
    });
    setIsExpenseDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รวมค่าใช้จ่ายเดือนนี้</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{getTotalExpenses().toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนรายการ</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ค่าใช้จ่ายเฉลี่ยต่อวัน</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{expenses.length > 0 ? Math.round(getTotalExpenses() / new Date().getDate()).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            หมวดหมู่ค่าใช้จ่าย
          </CardTitle>
          <CardDescription>จัดการหมวดหมู่ค่าใช้จ่ายต่างๆ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">หมวดหมู่ทั้งหมด</h3>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '', sort_order: 0, is_active: true });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มหมวดหมู่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">ชื่อหมวดหมู่</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="กรอกชื่อหมวดหมู่"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">คำอธิบาย</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="คำอธิบายหมวดหมู่ (ไม่บังคับ)"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-sort">ลำดับการแสดง</Label>
                    <Input
                      id="category-sort"
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditCategory(category)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-500">
                    {getExpensesByCategory().find(cat => cat.name === category.name)?.total.toLocaleString() || '0'} บาท
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            จัดการค่าใช้จ่าย
          </CardTitle>
          <CardDescription>บันทึกและจัดการค่าใช้จ่ายทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="month-select">เลือกเดือน:</Label>
              <Input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingExpense(null);
                  setExpenseForm({
                    category_id: '',
                    amount: 0,
                    expense_date: new Date().toISOString().split('T')[0],
                    description: '',
                    receipt_url: ''
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มค่าใช้จ่าย
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? 'แก้ไขค่าใช้จ่าย' : 'เพิ่มค่าใช้จ่ายใหม่'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="expense-category">หมวดหมู่</Label>
                    <Select value={expenseForm.category_id} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">ไม่ระบุหมวดหมู่</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expense-amount">จำนวนเงิน (บาท)</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-date">วันที่</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={expenseForm.expense_date}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, expense_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-description">รายละเอียด</Label>
                    <Textarea
                      id="expense-description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="รายละเอียดค่าใช้จ่าย"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="receipt-url">URL ใบเสร็จ (ไม่บังคับ)</Label>
                    <Input
                      id="receipt-url"
                      type="url"
                      value={expenseForm.receipt_url}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, receipt_url: e.target.value }))}
                      placeholder="https://example.com/receipt.jpg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                      ยกเลิก
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead>ใบเสร็จ</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.expense_date).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {expense.expense_categories?.name || 'ไม่ระบุ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">
                        {expense.description || 'ไม่มีรายละเอียด'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(expense.created_at).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ฿{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {expense.receipt_url ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Receipt className="w-3 h-3" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditExpense(expense)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteExpense(expense)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {expenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีค่าใช้จ่ายในเดือนนี้
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Summary by Category */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปค่าใช้จ่ายตามหมวดหมู่</CardTitle>
          <CardDescription>ค่าใช้จ่ายแยกตามหมวดหมู่ในเดือน {new Date(selectedMonth + '-01').toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getExpensesByCategory().map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {((category.total / getTotalExpenses()) * 100).toFixed(1)}% ของค่าใช้จ่ายทั้งหมด
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">฿{category.total.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {getExpensesByCategory().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีข้อมูลค่าใช้จ่าย
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;
