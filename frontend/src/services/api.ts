import axios from 'axios';
import type { Category, DashboardStats, MenuItem, Order, OrderItemRequest, OrderStatus, PaymentMethod, RestaurantTable, Role, User } from '../types';

export const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Allow AuthContext to handle clearing state
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  return fallback;
}

export const authApi = {
  login: (email: string, password: string) => api.post<{ role: Role; name: string }>('/auth/login', { email, password }),
  me: () => api.get<{ role: Role; name: string }>('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const categoryApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (payload: { name: string; description?: string }) => api.post<Category>('/categories', payload),
  update: (id: number, payload: { name: string; description?: string }) => api.put<Category>(`/categories/${id}`, payload),
  remove: (id: number) => api.delete(`/categories/${id}`)
};

export const menuApi = {
  list: (categoryId?: number) => api.get<MenuItem[]>('/menu-items', { params: categoryId ? { categoryId } : {} }),
  create: (payload: Omit<MenuItem, 'id' | 'category' | 'createdAt'> & { categoryId: number }) => api.post<MenuItem>('/menu-items', payload),
  update: (id: number, payload: Omit<MenuItem, 'id' | 'category' | 'createdAt'> & { categoryId: number }) => api.put<MenuItem>(`/menu-items/${id}`, payload),
  remove: (id: number) => api.delete(`/menu-items/${id}`)
};

export const tableApi = {
  list: () => api.get<RestaurantTable[]>('/tables'),
  create: (payload: { tableNumber: number; active: boolean }) => api.post<RestaurantTable>('/tables', payload),
  update: (id: number, payload: { tableNumber: number; active: boolean }) => api.put<RestaurantTable>(`/tables/${id}`, payload),
  remove: (id: number) => api.delete(`/tables/${id}`)
};

export const userApi = {
  list: () => api.get<User[]>('/users'),
  create: (payload: { name: string; email: string; password: string; role: Role; active: boolean }) => api.post<User>('/users', payload),
  update: (id: number, payload: { name: string; email: string; password?: string; role: Role; active: boolean }) => api.put<User>(`/users/${id}`, payload),
  remove: (id: number) => api.delete(`/users/${id}`)
};

export const orderApi = {
  list: (status?: OrderStatus) => api.get<Order[]>('/orders', { params: status ? { status } : {} }),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  tableOrders: (tableNumber: number) => api.get<Order[]>(`/orders/table/${tableNumber}`),
  create: (payload: { tableNumber: number; items: OrderItemRequest[] }) => api.post<Order>('/orders', payload),
  updateStatus: (id: number, status: OrderStatus, paymentMethod?: PaymentMethod) => api.put<Order>(`/orders/${id}/status`, { status, paymentMethod }),
  settleTablePayment: (tableNumber: number, paymentMethod: PaymentMethod) => api.put<Order[]>(`/orders/tables/${tableNumber}/settle-payment`, { paymentMethod }),
  stats: () => api.get<DashboardStats>('/orders/dashboard/stats')
};