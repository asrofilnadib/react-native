import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { LeafletMap } from '@/components/map/LeafletMap';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { subscribeToOrder } from '@/features/orders/api';
import { fetchRestaurantById } from '@/features/restaurants/api';
import { formatIdr } from '@/lib/format';
import type { Order } from '@/types';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Restaurant');

  useEffect(() => {
    if (!id) return;
    return subscribeToOrder(id, setOrder);
  }, [id]);

  useEffect(() => {
    const rid = order?.items[0]?.restaurantId;
    if (!rid) return;
    fetchRestaurantById(rid).then((r) => {
      if (r) setRestaurantName(r.name);
    });
  }, [order?.items]);

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#D32F2F" />
      </View>
    );
  }

  const isPaid = ['paid', 'preparing', 'ready', 'delivering', 'completed'].includes(order.status);
  const isSuccess = order.status === 'paid' || order.status === 'completed';

  if (showMap && order.items[0]?.restaurantId) {
    return (
      <View className="flex-1">
        <LeafletMap
          height="100%"
          markers={[
            {
              id: 'restaurant',
              title: restaurantName,
              latitude: -6.245775,
              longitude: 106.986666,
            },
            {
              id: 'rider',
              title: 'Jason (Rider)',
              latitude: -6.248,
              longitude: 106.989,
            },
          ]}
        />
        <View className="absolute bottom-8 left-4 right-4">
          <PrimaryButton label="Back to timeline" onPress={() => setShowMap(false)} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-2">
      {isSuccess && order.status === 'paid' ? (
        <View className="mb-6 items-center py-4">
          <Text className="text-5xl">✅</Text>
          <Text className="mt-2 text-xl font-bold text-text">Thank you for your order</Text>
          <Text className="text-textLight">Total paid: {formatIdr(order.total)}</Text>
        </View>
      ) : (
        <Text className="mb-4 text-lg font-bold text-text">
          Estimated delivery · 05:30 PM
        </Text>
      )}

      <View className="mb-4 flex-row items-center rounded-xl bg-gray-50 p-4">
        <Text className="mr-3 text-3xl">🛵</Text>
        <View>
          <Text className="font-bold text-text">Jason Stroll</Text>
          <Text className="text-sm text-textLight">⭐ 4.8 · Your rider</Text>
        </View>
      </View>

      {isPaid ? <OrderTimeline status={order.status} /> : (
        <Text className="text-textLight">Waiting for payment confirmation...</Text>
      )}

      <View className="mt-4 gap-3 pb-8">
        {isPaid ? (
          <PrimaryButton label="Track on map" onPress={() => setShowMap(true)} />
        ) : null}
        <PrimaryButton
          label="Order something else"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </ScrollView>
  );
}
