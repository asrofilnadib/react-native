import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { getClerkRole } from '@/lib/clerk';

const MENU_ITEMS = [
  { label: 'Profile', route: null },
  { label: 'Payment Method', route: null },
  { label: 'Order History', route: null },
  { label: 'Delivery address', route: null },
  { label: 'Settings', route: null },
  { label: 'Support Center', route: null },
];

export default function AccountScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const role = getClerkRole(user?.publicMetadata as Record<string, unknown>);

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-4">
        <View className="items-center py-8">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-xl font-bold text-text">
            {user?.fullName ?? user?.username ?? 'User'}
          </Text>
          <Text className="text-textLight">
            {user?.primaryEmailAddress?.emailAddress ?? ''}
          </Text>
        </View>

        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            className="flex-row items-center justify-between border-b border-gray-100 py-4">
            <Text className="text-base text-text">{item.label}</Text>
            <Text className="text-textLight">›</Text>
          </Pressable>
        ))}

        {role === 'admin' ? (
          <Pressable
            onPress={() => router.push('/(admin)')}
            className="mt-4 flex-row items-center justify-between rounded-xl bg-primary/10 px-4 py-4">
            <Text className="font-semibold text-primary">Admin Panel</Text>
            <Text className="text-primary">›</Text>
          </Pressable>
        ) : null}

        <View className="mt-8 pb-8">
          <PrimaryButton label="Sign out" variant="outline" onPress={onSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
