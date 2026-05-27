import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

const LINKS = [
  { href: '/(admin)/restaurants', title: 'Manage Restaurants', desc: 'Add, edit, delete restaurants' },
  { href: '/(admin)/map', title: 'Map & Locations', desc: 'Set restaurant coordinates on map' },
] as const;

export default function AdminDashboard() {
  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="mb-2 text-2xl font-bold text-text">MealsToGo Admin</Text>
      <Text className="mb-8 text-textLight">Master data for restaurants and menu items</Text>
      {LINKS.map((item) => (
        <Link key={item.href} href={item.href} asChild>
          <Pressable className="mb-4 rounded-xl bg-white p-5 shadow-sm">
            <Text className="text-lg font-bold text-primary">{item.title}</Text>
            <Text className="mt-1 text-textLight">{item.desc}</Text>
          </Pressable>
        </Link>
      ))}
      <View className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <Text className="font-semibold text-text">URL</Text>
        <Text className="mt-1 text-sm text-textLight">
          Open this panel at /admin on web (e.g. localhost:8081/admin)
        </Text>
      </View>
    </ScrollView>
  );
}
