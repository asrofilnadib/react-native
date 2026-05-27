import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { RestaurantCard } from '@/components/ui/RestaurantCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { fetchRestaurants } from '@/features/restaurants/api';
import type { Restaurant } from '@/types';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [all, setAll] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetchRestaurants().then(setAll);
  }, []);

  const results = all.filter(
    (r) =>
      !query.trim() ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-background px-4 pt-2">
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search restaurants..." />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="py-8 text-center text-textLight">No results</Text>
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            compact
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
