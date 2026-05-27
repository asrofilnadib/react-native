import '@/global.css';

import { ClerkLoaded, ClerkProvider } from '@clerk/expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { tokenCache } from '@clerk/expo/token-cache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen
            name="restaurant/[id]"
            options={{ headerShown: true, headerTintColor: '#D32F2F', title: 'Restaurant' }}
          />
          <Stack.Screen name="cart" options={{ headerShown: true, title: 'My Order' }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
          <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Track Order' }} />
          <Stack.Screen name="search" options={{ headerShown: true, title: 'Search' }} />
          <Stack.Screen name="filters" options={{ headerShown: true, title: 'Filters' }} />
          <Stack.Screen name="map" options={{ headerShown: true, title: 'Food Map' }} />
        </Stack>
        <StatusBar style="dark" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
