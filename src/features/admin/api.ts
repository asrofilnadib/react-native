import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  GeoPoint,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { SEED_MENU_ITEMS, SEED_RESTAURANTS } from '@/lib/seed-data';
import type { MenuItem, Restaurant } from '@/types';

let localRestaurants = [...SEED_RESTAURANTS];
let localMenuItems = [...SEED_MENU_ITEMS];

export async function adminUpsertRestaurant(
  data: Omit<Restaurant, 'id'> & { id?: string },
): Promise<string> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    if (data.id) {
      localRestaurants = localRestaurants.map((r) =>
        r.id === data.id ? { ...r, ...data, id: data.id } : r,
      );
      return data.id;
    }
    const id = `local-${Date.now()}`;
    localRestaurants.push({ ...data, id } as Restaurant);
    return id;
  }

  const payload = {
    name: data.name,
    imageUrl: data.imageUrl,
    category: data.category,
    priceLevel: data.priceLevel,
    rating: data.rating,
    ratingCount: data.ratingCount ?? 0,
    address: data.address,
    deliveryTime: data.deliveryTime ?? '20-30 min',
    location: new GeoPoint(data.location.latitude, data.location.longitude),
    isActive: data.isActive,
    hasOffer: data.hasOffer ?? false,
    offerIds: data.offerIds ?? [],
  };

  if (data.id) {
    await setDoc(doc(db, 'restaurants', data.id), payload, { merge: true });
    return data.id;
  }
  const ref = await addDoc(collection(db, 'restaurants'), payload);
  return ref.id;
}

export async function adminDeleteRestaurant(id: string): Promise<void> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    localRestaurants = localRestaurants.filter((r) => r.id !== id);
    localMenuItems = localMenuItems.filter((m) => m.restaurantId !== id);
    return;
  }
  await deleteDoc(doc(db, 'restaurants', id));
}

export async function adminUpsertMenuItem(
  data: Omit<MenuItem, 'id'> & { id?: string },
): Promise<string> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    if (data.id) {
      localMenuItems = localMenuItems.map((m) =>
        m.id === data.id ? { ...m, ...data, id: data.id } : m,
      );
      return data.id;
    }
    const id = `menu-${Date.now()}`;
    localMenuItems.push({ ...data, id } as MenuItem);
    return id;
  }

  const payload = {
    restaurantId: data.restaurantId,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isPopular: data.isPopular,
    category: data.category,
  };

  if (data.id) {
    await setDoc(doc(db, 'menuItems', data.id), payload, { merge: true });
    return data.id;
  }
  const ref = await addDoc(collection(db, 'menuItems'), payload);
  return ref.id;
}

export async function adminDeleteMenuItem(id: string): Promise<void> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    localMenuItems = localMenuItems.filter((m) => m.id !== id);
    return;
  }
  await deleteDoc(doc(db, 'menuItems', id));
}

export async function adminUpdateRestaurantLocation(
  id: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    localRestaurants = localRestaurants.map((r) =>
      r.id === id ? { ...r, location: { latitude, longitude } } : r,
    );
    return;
  }
  await updateDoc(doc(db, 'restaurants', id), {
    location: new GeoPoint(latitude, longitude),
  });
}

export function getLocalAdminData() {
  return { restaurants: localRestaurants, menuItems: localMenuItems };
}
