import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { mieSedapPalette } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: mieSedapPalette.primary,
        tabBarInactiveTintColor: mieSedapPalette.textLight,
        tabBarStyle: {
          borderTopColor: '#eee',
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color }) => <TabIcon emoji="🍽️" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏷️" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <Text style={{ fontSize: 22, opacity: color === mieSedapPalette.primary ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}
