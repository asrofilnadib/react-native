import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { adminDeleteMenuItem, adminUpsertMenuItem } from '@/features/admin/api';
import { fetchMenuItems } from '@/features/restaurants/api';
import { formatIdr } from '@/lib/format';
import type { MenuItem } from '@/types';

export default function AdminMenuScreen() {
  const { id: restaurantId } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '45000',
    category: 'Main',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isPopular: false,
  });

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setItems(await fetchMenuItems(restaurantId));
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!restaurantId) return;
    await adminUpsertMenuItem({
      id: editing?.id,
      restaurantId,
      name: form.name,
      description: form.description,
      price: parseInt(form.price, 10) || 0,
      category: form.category,
      imageUrl: form.imageUrl,
      isPopular: form.isPopular,
    });
    setModal(false);
    load();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {items.map((item) => (
          <View key={item.id} className="mb-3 flex-row justify-between rounded-xl bg-white p-4">
            <View className="flex-1">
              <Text className="font-bold text-text">{item.name}</Text>
              <Text className="text-sm text-textLight">{formatIdr(item.price)}</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  setEditing(item);
                  setForm({
                    name: item.name,
                    description: item.description,
                    price: String(item.price),
                    category: item.category,
                    imageUrl: item.imageUrl,
                    isPopular: item.isPopular,
                  });
                  setModal(true);
                }}
                className="px-2 py-1">
                <Text className="text-primary">Edit</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert('Delete', 'Remove item?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await adminDeleteMenuItem(item.id);
                        load();
                      },
                    },
                  ])
                }>
                <Text className="text-error">Del</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="p-4">
        <PrimaryButton
          label="+ Add Menu Item"
          onPress={() => {
            setEditing(null);
            setForm({
              name: '',
              description: '',
              price: '45000',
              category: 'Main',
              imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
              isPopular: false,
            });
            setModal(true);
          }}
        />
      </View>

      <Modal visible={modal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView className="max-h-[80%] rounded-t-2xl bg-white p-6">
            <Text className="mb-4 text-xl font-bold">Menu Item</Text>
            {(['name', 'description', 'price', 'category', 'imageUrl'] as const).map((key) => (
              <View key={key} className="mb-3">
                <Text className="mb-1 capitalize">{key}</Text>
                <TextInput
                  value={String(form[key])}
                  onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
                  className="rounded-lg border border-gray-200 px-3 py-2"
                />
              </View>
            ))}
            <Pressable
              onPress={() => setForm((f) => ({ ...f, isPopular: !f.isPopular }))}
              className="mb-4">
              <Text>Popular: {form.isPopular ? 'Yes ✓' : 'No'}</Text>
            </Pressable>
            <PrimaryButton label="Save" onPress={save} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
