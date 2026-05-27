export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export type Restaurant = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  priceLevel: string;
  rating: number;
  ratingCount?: number;
  address: string;
  deliveryTime?: string;
  location: { latitude: number; longitude: number };
  isActive: boolean;
  offerIds?: string[];
  hasOffer?: boolean;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isPopular: boolean;
  category: string;
};

export type CartItem = {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type OrderItem = CartItem;

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryNotes?: string;
  addressSnapshot?: string;
  xenditInvoiceId?: string;
  paymentUrl?: string;
  createdAt?: { seconds: number };
};

export const MAP_CENTER = {
  latitude: -6.245775,
  longitude: 106.986666,
} as const;
