import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useCartStore } from '@/features/cart/store';
import { formatIdr } from '@/lib/format';

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const deliveryNotes = useCartStore((s) => s.deliveryNotes);
  const setDeliveryNotes = useCartStore((s) => s.setDeliveryNotes);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const total = useCartStore((s) => s.total());

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="mb-2 text-6xl">🛒</Text>
        <Text className="text-xl font-bold text-text">Your basket is empty</Text>
        <Text className="mt-2 text-center text-textLight">
          Add some delicious food from a restaurant nearby.
        </Text>
        <View className="mt-6 w-full">
          <PrimaryButton label="Browse restaurants" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-2">
        {items.map((item) => (
          <View key={item.menuItemId} className="mb-4 flex-row items-center border-b border-gray-100 pb-4">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="mr-3 h-16 w-16 rounded-lg" />
            ) : null}
            <View className="flex-1">
              <Text className="font-semibold text-text">{item.name}</Text>
              <Text className="text-textLight">{formatIdr(item.price)}</Text>
              <View className="mt-2 flex-row items-center gap-3">
                <Pressable
                  onPress={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <Text className="text-lg">−</Text>
                </Pressable>
                <Text className="font-medium">x {item.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Text className="text-lg text-white">+</Text>
                </Pressable>
              </View>
            </View>
            <Text className="font-semibold text-text">
              {formatIdr(item.price * item.quantity)}
            </Text>
          </View>
        ))}
        <Pressable onPress={() => router.back()}>
          <Text className="mb-4 text-primary font-medium">Add more foods</Text>
        </Pressable>
        <Text className="mb-2 font-semibold text-text">Delivery instructions</Text>
        <TextInput
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          placeholder="Add notes for the driver..."
          placeholderTextColor="#757575"
          multiline
          className="mb-4 min-h-[80px] rounded-xl border border-gray-200 bg-gray-50 p-3 text-text"
        />
        <View className="mb-2 flex-row justify-between">
          <Text className="text-textLight">Subtotal</Text>
          <Text className="text-text">{formatIdr(subtotal)}</Text>
        </View>
        <View className="mb-4 flex-row justify-between">
          <Text className="text-textLight">Delivery cost</Text>
          <Text className="text-text">{formatIdr(deliveryFee)}</Text>
        </View>
      </ScrollView>
      <View className="border-t border-gray-100 p-4">
        <View className="mb-3 flex-row justify-between">
          <Text className="text-lg font-bold text-text">Total</Text>
          <Text className="text-lg font-bold text-primary">{formatIdr(total)}</Text>
        </View>
        <PrimaryButton label="Check out" onPress={() => router.push('/checkout')} />
      </View>
    </View>
  );
}
