export type Role = 'ADMIN' | 'WAITER' | 'KITCHEN' | 'CUSTOMER';
export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: Category;
  available: boolean;
  createdAt: string;
}

export interface RestaurantTable {
  id: number;
  tableNumber: number;
  active: boolean;
  qrCodeUrl: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface OrderItemRequest {
  menuItemId: number;
  quantity: number;
  specialInstruction?: string;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  specialInstruction?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface DashboardStats {
  totalOrders: number;
  todaysOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSales: number;
  revenueChart: {
    date: string;
    sales: number;
    orders: number;
  }[];
  topItems: {
    name: string;
    quantitySold: number;
  }[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstruction: string;
}