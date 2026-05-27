import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { Restaurant } from '@/types';

type Props = {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
};

export function RestaurantCard({ restaurant, onPress, compact }: Props) {
  if (compact) {
    return (
      <Pressable onPress={onPress} className="mb-3 flex-row overflow-hidden rounded-xl bg-white shadow-sm">
        <Image
          source={{ uri: restaurant.imageUrl }}
          className="h-24 w-24"
          contentFit="cover"
        />
        <View className="flex-1 justify-center p-3">
          <Text className="font-bold text-text">{restaurant.name}</Text>
          <Text className="text-sm text-textLight">
            {restaurant.category} · {restaurant.priceLevel}
          </Text>
          <Text className="mt-1 text-sm text-text">
            ⭐ {restaurant.rating}
            {restaurant.ratingCount ? ` (${restaurant.ratingCount})` : ''}
          </Text>
          {restaurant.hasOffer ? (
            <Text className="mt-1 text-xs font-semibold text-primary">Offers available</Text>
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} className="mb-4 overflow-hidden rounded-2xl bg-white shadow-md">
      <Image
        source={{ uri: restaurant.imageUrl }}
        className="h-48 w-full"
        contentFit="cover"
      />
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-text">{restaurant.name}</Text>
          <Text className="font-semibold text-text">⭐ {restaurant.rating}</Text>
        </View>
        <Text className="mt-1 text-sm text-textLight">
          {restaurant.category} · {restaurant.deliveryTime ?? '20-30 min'}
        </Text>
        {restaurant.hasOffer ? (
          <View className="mt-2 self-start rounded bg-secondary/30 px-2 py-1">
            <Text className="text-xs font-semibold text-text">Special offer</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
