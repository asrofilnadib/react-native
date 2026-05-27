import { Link } from 'expo-router';
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
import { adminDeleteRestaurant, adminUpsertRestaurant } from '@/features/admin/api';
import { fetchRestaurants } from '@/features/restaurants/api';
import { MAP_CENTER } from '@/types';
import type { Restaurant } from '@/types';

const emptyForm = {
  name: '',
  category: 'Burger',
  priceLevel: '$$',
  rating: '4.5',
  address: '',
  imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  deliveryTime: '20-30 min',
};

export default function AdminRestaurantsScreen() {
  const [list, setList] = useState<Restaurant[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setList(await fetchRestaurants());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({
      name: r.name,
      category: r.category,
      priceLevel: r.priceLevel,
      rating: String(r.rating),
      address: r.address,
      imageUrl: r.imageUrl,
      deliveryTime: r.deliveryTime ?? '20-30 min',
    });
    setModal(true);
  };

  const save = async () => {
    await adminUpsertRestaurant({
      id: editing?.id,
      name: form.name,
      category: form.category,
      priceLevel: form.priceLevel,
      rating: parseFloat(form.rating) || 4.5,
      address: form.address,
      imageUrl: form.imageUrl,
      deliveryTime: form.deliveryTime,
      location: editing?.location ?? MAP_CENTER,
      isActive: true,
      hasOffer: false,
    });
    setModal(false);
    load();
  };

  const remove = (id: string) => {
    Alert.alert('Delete', 'Remove this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await adminDeleteRestaurant(id);
          load();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {list.map((r) => (
          <View key={r.id} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <Text className="font-bold text-text">{r.name}</Text>
            <Text className="text-sm text-textLight">
              {r.category} · ⭐ {r.rating} · {r.address}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <Link href={`/(admin)/restaurants/${r.id}/menu`} asChild>
                <Pressable className="rounded-lg bg-primary/10 px-3 py-2">
                  <Text className="text-sm font-semibold text-primary">Menu</Text>
                </Pressable>
              </Link>
              <Pressable onPress={() => openEdit(r)} className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-sm">Edit</Text>
              </Pressable>
              <Pressable onPress={() => remove(r.id)} className="rounded-lg bg-error/10 px-3 py-2">
                <Text className="text-sm text-error">Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="border-t border-gray-200 p-4">
        <PrimaryButton label="+ Add Restaurant" onPress={openCreate} />
      </View>

      <Modal visible={modal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <ScrollView className="max-h-[85%] rounded-t-2xl bg-white p-6">
            <Text className="mb-4 text-xl font-bold">{editing ? 'Edit' : 'New'} Restaurant</Text>
            {(['name', 'category', 'priceLevel', 'rating', 'address', 'imageUrl', 'deliveryTime'] as const).map(
              (key) => (
                <View key={key} className="mb-3">
                  <Text className="mb-1 capitalize text-text">{key}</Text>
                  <TextInput
                    value={form[key]}
                    onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />
                </View>
              ),
            )}
            <PrimaryButton label="Save" onPress={save} />
            <View className="mt-2">
              <PrimaryButton label="Cancel" variant="outline" onPress={() => setModal(false)} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
