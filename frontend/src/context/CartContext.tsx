import { createContext, useContext, useMemo, useState } from 'react';
import type { CartItem, MenuItem } from '../types';

interface CartState {
  tableNumber: number | null;
  items: CartItem[];
  setTableNumber: (tableNumber: number) => void;
  addItem: (menuItem: MenuItem) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateInstruction: (menuItemId: number, specialInstruction: string) => void;
  removeItem: (menuItemId: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [tableNumber, setTableNumber] = useState<number | null>(() => Number(sessionStorage.getItem('tableNumber')) || null);
  const [items, setItems] = useState<CartItem[]>([]);

  function rememberTable(value: number) {
    setTableNumber(value);
    sessionStorage.setItem('tableNumber', String(value));
  }

  function addItem(menuItem: MenuItem) {
    setItems((current) => {
      const existing = current.find((item) => item.menuItem.id === menuItem.id);
      if (existing) {
        return current.map((item) => item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { menuItem, quantity: 1, specialInstruction: '' }];
    });
  }

  function updateQuantity(menuItemId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((current) => current.map((item) => item.menuItem.id === menuItemId ? { ...item, quantity } : item));
  }

  function updateInstruction(menuItemId: number, specialInstruction: string) {
    setItems((current) => current.map((item) => item.menuItem.id === menuItemId ? { ...item, specialInstruction } : item));
  }

  function removeItem(menuItemId: number) {
    setItems((current) => current.filter((item) => item.menuItem.id !== menuItemId));
  }

  function clear() {
    setItems([]);
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.menuItem.price) * item.quantity, 0), [items]);

  return <CartContext.Provider value={{ tableNumber, items, setTableNumber: rememberTable, addItem, updateQuantity, updateInstruction, removeItem, clear, total }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}