import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/components/ui/CategoryChip';
import { RestaurantCard } from '@/components/ui/RestaurantCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { useCartStore } from '@/features/cart/store';
import { fetchRestaurants } from '@/features/restaurants/api';
import type { Restaurant } from '@/types';

const CATEGORIES = ['All', 'Offers', 'Burgers', 'Asian', 'Pizza', 'Cafe'];

export default function RestaurantsScreen() {
  const router = useRouter();
  const itemCount = useCartStore((s) => s.itemCount());
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = restaurants.filter((r) => {
    const matchCat =
      category === 'All' ||
      (category === 'Offers' ? r.hasOffer : r.category.toLowerCase().includes(category.toLowerCase()));
    const matchSearch =
      !search.trim() ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2">
          <Pressable onPress={() => router.push('/map')} className="mb-1">
            <Text className="text-xs text-textLight">Delivering to</Text>
            <Text className="font-semibold text-primary">Current location ▾</Text>
          </Pressable>
          <View className="mb-4 mt-3 flex-row items-center gap-2">
            <View className="flex-1">
              <SearchBar
                value={search}
                onChangeText={setSearch}
                onPress={() => router.push('/search')}
                editable={false}
              />
            </View>
            {itemCount > 0 ? (
              <Pressable
                onPress={() => router.push('/cart')}
                className="rounded-full bg-primary px-3 py-2">
                <Text className="font-bold text-white">🛒 {itemCount}</Text>
              </Pressable>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                label={c}
                active={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator className="my-12" color="#D32F2F" />
        ) : (
          <View className="px-4 pb-8">
            {featured ? (
              <>
                <Text className="mb-3 text-lg font-bold text-text">Featured</Text>
                <RestaurantCard
                  restaurant={featured}
                  onPress={() => router.push(`/restaurant/${featured.id}`)}
                />
              </>
            ) : null}
            <Text className="mb-3 text-lg font-bold text-text">All restaurants</Text>
            {filtered.slice(featured ? 1 : 0).map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                compact
                onPress={() => router.push(`/restaurant/${r.id}`)}
              />
            ))}
            {filtered.length === 0 ? (
              <Text className="text-center text-textLight">No restaurants found</Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
