import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Text, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'Find foods you love',
    subtitle: 'Discover restaurants and dishes near you.',
    emoji: '🍔',
  },
  {
    key: '2',
    title: 'Fast Delivery',
    subtitle: 'Get your favorite meals delivered quickly.',
    emoji: '🛵',
  },
  {
    key: '3',
    title: 'Live Tracking',
    subtitle: 'Track your order from kitchen to your door.',
    emoji: '📍',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    router.replace('/(auth)/sign-in');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <Text className="mb-6 text-8xl">{item.emoji}</Text>
            <Text className="mb-3 text-center text-2xl font-bold text-text">{item.title}</Text>
            <Text className="text-center text-base text-textLight">{item.subtitle}</Text>
          </View>
        )}
      />
      <View className="flex-row justify-center gap-2 pb-4">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${i === index ? 'w-6 bg-primary' : 'w-2 bg-gray-300'}`}
          />
        ))}
      </View>
      <View className="px-6 pb-8">
        {index < SLIDES.length - 1 ? (
          <PrimaryButton
            label="Next"
            onPress={() => listRef.current?.scrollToIndex({ index: index + 1 })}
          />
        ) : (
          <PrimaryButton label="Get Started" onPress={finish} />
        )}
        <View className="mt-3">
          <PrimaryButton label="Log in" variant="outline" onPress={finish} />
        </View>
      </View>
    </SafeAreaView>
  );
}
