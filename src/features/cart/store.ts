import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CartItem } from '@/types';

const DELIVERY_FEE = 15000;

type CartState = {
  items: CartItem[];
  deliveryNotes: string;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  setDeliveryNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  deliveryFee: () => number;
  total: () => number;
  restaurantId: () => string | null;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryNotes: '',

      addItem: (item, quantity = 1) => {
        const currentRestaurant = get().restaurantId();
        if (currentRestaurant && currentRestaurant !== item.restaurantId) {
          set({ items: [], deliveryNotes: '' });
        }
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          ),
        }));
      },

      setDeliveryNotes: (notes) => set({ deliveryNotes: notes }),

      clearCart: () => set({ items: [], deliveryNotes: '' }),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      deliveryFee: () => (get().items.length > 0 ? DELIVERY_FEE : 0),

      total: () => get().subtotal() + get().deliveryFee(),

      restaurantId: () => get().items[0]?.restaurantId ?? null,

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'mealstogo-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
