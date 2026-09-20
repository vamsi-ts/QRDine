import type { Role } from '../types';

export const roleHome: Partial<Record<Role, string>> = {
  ADMIN: '/admin/dashboard',
  WAITER: '/waiter/orders',
  KITCHEN: '/kitchen/orders'
};

export function homeForRole(role: Role) {
  return roleHome[role] ?? '/admin/login';
}