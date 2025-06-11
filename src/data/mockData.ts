
import { MenuItem, Category, Addon, DashboardStats } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: 'ทั้งหมด', description: 'เมนูทั้งหมด', sort_order: 0, is_active: true },
  { id: '2', name: 'กาแฟร้อน', description: 'เครื่องดื่มกาแฟร้อน', sort_order: 1, is_active: true },
  { id: '3', name: 'กาแฟเย็น', description: 'เครื่องดื่มกาแฟเย็น', sort_order: 2, is_active: true },
  { id: '4', name: 'ชาและเครื่องดื่ม', description: 'ชาและเครื่องดื่มอื่นๆ', sort_order: 3, is_active: true },
  { id: '5', name: 'เบเกอรี่', description: 'ขนมปังและเค้ก', sort_order: 4, is_active: true },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Americano',
    price: 45,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop',
    description: 'กาแฟอเมริกาโน่รสชาติกลมกล่อม',
    category_id: '2',
    is_available: true,
    calculated_cost: 15
  },
  {
    id: '2',
    name: 'Cappuccino',
    price: 55,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    description: 'คาปูชิโน่หอมกรุ่นด้วยฟองนมนุ่ม',
    category_id: '2',
    is_available: true,
    calculated_cost: 20
  },
  {
    id: '3',
    name: 'Latte',
    price: 60,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&h=300&fit=crop',
    description: 'ลาเต้นมนุ่มรสชาติหวานมัน',
    category_id: '2',
    is_available: true,
    calculated_cost: 22
  },
  {
    id: '4',
    name: 'Iced Americano',
    price: 45,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop',
    description: 'อเมริกาโน่เย็นสดชื่น',
    category_id: '3',
    is_available: true,
    calculated_cost: 15
  },
  {
    id: '5',
    name: 'Iced Latte',
    price: 60,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&h=300&fit=crop',
    description: 'ลาเต้เย็นหอมกรุ่น',
    category_id: '3',
    is_available: true,
    calculated_cost: 22
  },
  {
    id: '6',
    name: 'Green Tea Latte',
    price: 65,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop',
    description: 'ชาเขียวลาเต้หอมหวาน',
    category_id: '4',
    is_available: true,
    calculated_cost: 25
  },
  {
    id: '7',
    name: 'Croissant',
    price: 45,
    image: 'https://images.unsplash.com/photo-1555507036-e785abea0e5d?w=300&h=300&fit=crop',
    description: 'ครัวซองต์เนยสดกรอบนอกนุ่มใน',
    category_id: '5',
    is_available: true,
    calculated_cost: 18
  },
  {
    id: '8',
    name: 'Chocolate Cake',
    price: 85,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop',
    description: 'เค้กช็อกโกแลตเข้มข้น',
    category_id: '5',
    is_available: true,
    calculated_cost: 35
  }
];

export const mockAddons: Addon[] = [
  { id: '1', name: 'Extra Shot', price: 15, category: 'shot', is_required: false, allow_multiple: true },
  { id: '2', name: 'Double Shot', price: 25, category: 'shot', is_required: false, allow_multiple: false },
  { id: '3', name: 'หวานน้อย (25%)', price: 0, category: 'sweetness', is_required: true, allow_multiple: false },
  { id: '4', name: 'หวานปกติ (50%)', price: 0, category: 'sweetness', is_required: true, allow_multiple: false },
  { id: '5', name: 'หวานมาก (100%)', price: 0, category: 'sweetness', is_required: true, allow_multiple: false },
  { id: '6', name: 'วิปครีม', price: 10, category: 'topping', is_required: false, allow_multiple: true },
  { id: '7', name: 'เจลลี่', price: 8, category: 'topping', is_required: false, allow_multiple: true },
  { id: '8', name: 'ขนาด S', price: -5, category: 'size', is_required: true, allow_multiple: false },
  { id: '9', name: 'ขนาด M', price: 0, category: 'size', is_required: true, allow_multiple: false },
  { id: '10', name: 'ขนาด L', price: 10, category: 'size', is_required: true, allow_multiple: false },
];

export const mockDashboardStats: DashboardStats = {
  todaySales: 12450,
  todayOrders: 48,
  todayCustomers: 35,
  salesGrowth: 12.5
};
