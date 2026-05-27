import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useCartStore } from '@/features/cart/store';
import { createOrder, createXenditPayment } from '@/features/orders/api';
import { formatIdr } from '@/lib/format';

export default function CheckoutScreen() {
  const { getToken } = useAuth();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const deliveryNotes = useCartStore((s) => s.deliveryNotes);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const total = useCartStore((s) => s.total());
  const [address, setAddress] = useState('Jl. Raya Bekasi — Current location');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  const discount = coupon.toUpperCase() === 'MISEDAP' ? 10000 : 0;
  const finalTotal = Math.max(0, total - discount);

  const onSendOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const token = (await getToken()) ?? '';
      const orderId = await createOrder({
        items,
        subtotal,
        deliveryFee,
        discount,
        total: finalTotal,
        deliveryNotes,
        addressSnapshot: address,
        clerkToken: token,
      });

      const { paymentUrl } = await createXenditPayment(orderId, token);

      if (paymentUrl.includes('mock-')) {
        const { mockMarkOrderPaid } = await import('@/features/orders/api');
        setTimeout(() => mockMarkOrderPaid(orderId), 2000);
      } else {
        await WebBrowser.openBrowserAsync(paymentUrl);
      }

      clearCart();
      router.replace(`/order/${orderId}`);
    } catch (e: unknown) {
      Alert.alert('Order failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-2">
      <View className="mb-4 flex-row justify-between rounded-xl bg-gray-50 p-4">
        <View className="flex-1">
          <Text className="text-xs text-textLight">Delivery address</Text>
          <Text className="font-medium text-text">{address}</Text>
        </View>
        <Text className="text-primary font-medium">Change</Text>
      </View>

      <View className="mb-4 rounded-xl bg-gray-50 p-4">
        <Text className="text-xs text-textLight">Payment method</Text>
        <Text className="font-medium text-text">Xendit (e-Wallet / VA / Card)</Text>
      </View>

      <Text className="mb-2 font-semibold text-text">Coupon</Text>
      <TextInput
        value={coupon}
        onChangeText={setCoupon}
        placeholder="Enter code (try MISEDAP)"
        placeholderTextColor="#757575"
        className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-text"
      />

      <View className="mb-2 flex-row justify-between">
        <Text className="text-textLight">Subtotal</Text>
        <Text>{formatIdr(subtotal)}</Text>
      </View>
      <View className="mb-2 flex-row justify-between">
        <Text className="text-textLight">Delivery</Text>
        <Text>{formatIdr(deliveryFee)}</Text>
      </View>
      {discount > 0 ? (
        <View className="mb-2 flex-row justify-between">
          <Text className="text-success">Discount</Text>
          <Text className="text-success">-{formatIdr(discount)}</Text>
        </View>
      ) : null}
      <View className="mb-6 flex-row justify-between">
        <Text className="text-lg font-bold text-text">Total</Text>
        <Text className="text-lg font-bold text-primary">{formatIdr(finalTotal)}</Text>
      </View>

      <PrimaryButton label="Send Order" onPress={onSendOrder} loading={loading} />
      <View className="h-8" />
    </ScrollView>
  );
}
