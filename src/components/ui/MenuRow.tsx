import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { formatIdr } from '@/lib/format';
import type { MenuItem } from '@/types';

type Props = {
  item: MenuItem;
  onAdd: () => void;
};

export function MenuRow({ item, onAdd }: Props) {
  return (
    <View className="mb-4 flex-row border-b border-gray-100 pb-4">
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-2">
          <Text className="font-semibold text-text">{item.name}</Text>
          {item.isPopular ? (
            <View className="rounded bg-primary/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-primary">Popular</Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-1 text-sm text-textLight" numberOfLines={2}>
          {item.description}
        </Text>
        <Text className="mt-2 font-semibold text-text">{formatIdr(item.price)}</Text>
      </View>
      <Pressable onPress={onAdd} className="items-center">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="mb-2 h-20 w-20 rounded-lg" />
        ) : null}
        <View className="rounded-full bg-primary px-3 py-1">
          <Text className="font-bold text-white">+</Text>
        </View>
      </Pressable>
    </View>
  );
}
