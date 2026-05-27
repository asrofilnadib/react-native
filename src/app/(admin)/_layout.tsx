import { useAuth, useUser } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, Platform, Text, View } from 'react-native';

import { getClerkRole } from '@/lib/clerk';

export default function AdminLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const role = getClerkRole(user?.publicMetadata as Record<string, unknown>);

  if (Platform.OS !== 'web') {
    return <Redirect href="/(tabs)" />;
  }

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#D32F2F" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (role !== 'admin') {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <Text className="text-xl font-bold text-text">Access denied</Text>
        <Text className="mt-2 text-center text-textLight">
          Admin role required. Set publicMetadata.role to &quot;admin&quot; in Clerk dashboard.
        </Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#D32F2F' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="restaurants/index" options={{ title: 'Restaurants' }} />
      <Stack.Screen name="restaurants/[id]/menu" options={{ title: 'Menu Items' }} />
      <Stack.Screen name="map" options={{ title: 'Map Locations' }} />
    </Stack>
  );
}
