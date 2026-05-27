import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantCard } from '@/components/ui/RestaurantCard';
import { mieSedapPalette } from '@/constants/colors';
import { fetchOfferRestaurants } from '@/features/restaurants/api';
import type { Restaurant } from '@/types';

export default function OffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOffers(await fetchOfferRestaurants());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="bg-primary px-4 pb-6 pt-4">
        <Text className="text-2xl font-bold text-white">Latest Offers</Text>
        <Text className="mt-1 text-white/90">{offers.length} restaurants with deals</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        {loading ? (
          <ActivityIndicator color={mieSedapPalette.primary} />
        ) : offers.length === 0 ? (
          <Text className="py-8 text-center text-textLight">No offers right now</Text>
        ) : (
          offers.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onPress={() => router.push(`/restaurant/${r.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
