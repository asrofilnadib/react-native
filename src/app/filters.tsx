import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { CategoryChip } from '@/components/ui/CategoryChip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const SORT_OPTIONS = [
  'Most Popular',
  'Price High to Low',
  'Price Low to High',
  'Delivery Time',
];

const CUISINES = ['Fast Food', 'Asian', 'Burger', 'Pizza', 'Cafe', 'Western'];

export default function FiltersScreen() {
  const router = useRouter();
  const [sort, setSort] = useState('Most Popular');
  const [cuisine, setCuisine] = useState('Fast Food');

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary">← Back</Text>
        </Pressable>
        <Text className="text-lg font-bold text-text">Filters</Text>
        <Pressable onPress={() => { setSort('Most Popular'); setCuisine('Fast Food'); }}>
          <Text className="text-primary">Reset</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="mb-3 font-bold text-text">Sort by</Text>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => setSort(opt)}
            className="mb-2 flex-row items-center justify-between py-2">
            <Text className={sort === opt ? 'font-semibold text-primary' : 'text-text'}>
              {opt}
            </Text>
            {sort === opt ? <Text className="text-primary">✓</Text> : null}
          </Pressable>
        ))}
        <Text className="mb-3 mt-6 font-bold text-text">Cuisines</Text>
        <View className="mb-6 flex-row flex-wrap">
          {CUISINES.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={cuisine === c}
              onPress={() => setCuisine(c)}
            />
          ))}
        </View>
        <Text className="mb-2 font-bold text-text">Price range</Text>
        <Text className="mb-4 text-textLight">$0 — $100 (slider UI in next iteration)</Text>
      </ScrollView>
      <View className="p-4">
        <PrimaryButton label="Apply" onPress={() => router.back()} />
      </View>
    </View>
  );
}
