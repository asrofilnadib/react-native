import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';

import { getLocalAdminData } from '@/features/admin/api';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { SEED_MENU_ITEMS, SEED_RESTAURANTS } from '@/lib/seed-data';
import type { MenuItem, Restaurant } from '@/types';

function mapRestaurant(id: string, data: DocumentData): Restaurant {
  const loc = data.location;
  return {
    id,
    name: data.name ?? '',
    imageUrl: data.imageUrl ?? '',
    category: data.category ?? '',
    priceLevel: data.priceLevel ?? '$$',
    rating: data.rating ?? 0,
    ratingCount: data.ratingCount,
    address: data.address ?? '',
    deliveryTime: data.deliveryTime,
    location: {
      latitude: loc?.latitude ?? 0,
      longitude: loc?.longitude ?? 0,
    },
    isActive: data.isActive !== false,
    offerIds: data.offerIds,
    hasOffer: data.hasOffer ?? false,
  };
}

function mapMenuItem(id: string, data: DocumentData): MenuItem {
  return {
    id,
    name: data.name ?? '',
    restaurantId: data.restaurantId ?? '',
    description: data.description ?? '',
    price: data.price ?? 0,
    imageUrl: data.imageUrl ?? '',
    isPopular: data.isPopular ?? false,
    category: data.category ?? '',
  };
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    const local = getLocalAdminData().restaurants;
    const list = local.length > 0 ? local : SEED_RESTAURANTS;
    return list.filter((r) => r.isActive);
  }
  const snap = await getDocs(collection(db, 'restaurants'));
  const list = snap.docs
    .map((d) => mapRestaurant(d.id, d.data()))
    .filter((r) => r.isActive);
  return list.length > 0 ? list : SEED_RESTAURANTS;
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    const local = getLocalAdminData().restaurants;
    const list = local.length > 0 ? local : SEED_RESTAURANTS;
    return list.find((r) => r.id === id) ?? null;
  }
  const snap = await getDoc(doc(db, 'restaurants', id));
  if (!snap.exists()) {
    return SEED_RESTAURANTS.find((r) => r.id === id) ?? null;
  }
  return mapRestaurant(snap.id, snap.data());
}

export async function fetchMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    const local = getLocalAdminData().menuItems;
    const list = local.length > 0 ? local : SEED_MENU_ITEMS;
    return list.filter((m) => m.restaurantId === restaurantId);
  }
  const q = query(collection(db, 'menuItems'), where('restaurantId', '==', restaurantId));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => mapMenuItem(d.id, d.data()));
  if (list.length > 0) return list;
  return SEED_MENU_ITEMS.filter((m) => m.restaurantId === restaurantId);
}

export async function fetchOfferRestaurants(): Promise<Restaurant[]> {
  const all = await fetchRestaurants();
  return all.filter((r) => r.hasOffer || (r.offerIds?.length ?? 0) > 0);
}
