import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { MenuRow } from '@/components/ui/MenuRow';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useCartStore } from '@/features/cart/store';
import { fetchMenuItems, fetchRestaurantById } from '@/features/restaurants/api';
import type { MenuItem, Restaurant } from '@/types';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.itemCount());
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [r, m] = await Promise.all([
        fetchRestaurantById(id),
        fetchMenuItems(id),
      ]);
      setRestaurant(r);
      setMenu(m);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#D32F2F" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-textLight">Restaurant not found</Text>
      </View>
    );
  }

  const popular = menu.filter((m) => m.isPopular);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <Image source={{ uri: restaurant.imageUrl }} className="h-56 w-full" />
        <View className="p-4">
          <Text className="text-2xl font-bold text-text">{restaurant.name}</Text>
          <Text className="mt-1 text-textLight">
            ⭐ {restaurant.rating} · {restaurant.category} · {restaurant.priceLevel}
          </Text>
          <Text className="mt-1 text-sm text-textLight">{restaurant.address}</Text>

          {popular.length > 0 ? (
            <>
              <Text className="mb-3 mt-6 text-lg font-bold text-text">Popular choices</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {popular.map((item) => (
                  <View key={item.id} className="mr-4 w-28 items-center">
                    <Image source={{ uri: item.imageUrl }} className="h-24 w-24 rounded-full" />
                    <Text className="mt-2 text-center text-xs font-medium text-text" numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}

          <Text className="mb-3 text-lg font-bold text-text">Menu</Text>
          {menu.map((item) => (
            <MenuRow
              key={item.id}
              item={item}
              onAdd={() =>
                addItem({
                  menuItemId: item.id,
                  restaurantId: restaurant.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                })
              }
            />
          ))}
        </View>
      </ScrollView>
      {itemCount > 0 ? (
        <View className="border-t border-gray-100 p-4">
          <PrimaryButton
            label={`View basket (${itemCount})`}
            onPress={() => router.push('/cart')}
          />
        </View>
      ) : null}
    </View>
  );
}
