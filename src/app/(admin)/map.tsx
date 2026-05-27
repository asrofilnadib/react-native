import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { LeafletMap } from '@/components/map/LeafletMap';
import { adminUpdateRestaurantLocation } from '@/features/admin/api';
import { fetchRestaurants } from '@/features/restaurants/api';
import { MAP_CENTER } from '@/types';
import type { Restaurant } from '@/types';

export default function AdminMapScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [pin, setPin] = useState<{ latitude: number; longitude: number }>({
    latitude: MAP_CENTER.latitude,
    longitude: MAP_CENTER.longitude,
  });

  const load = useCallback(async () => {
    const data = await fetchRestaurants();
    setRestaurants(data);
    if (data[0] && !selected) {
      setSelected(data[0]);
      setPin(data[0].location);
    }
  }, [selected]);

  useEffect(() => {
    load();
  }, [load]);

  const saveLocation = async () => {
    if (!selected) return;
    await adminUpdateRestaurantLocation(selected.id, pin.latitude, pin.longitude);
    load();
  };

  const markers = restaurants.map((r) => ({
    id: r.id,
    title: r.name,
    latitude: r.location.latitude,
    longitude: r.location.longitude,
  }));

  return (
    <View className="flex-1">
      <View style={{ height: 360 }}>
        <LeafletMap markers={markers} center={pin} zoom={13} height={360} />
      </View>
      <ScrollView className="flex-1 p-4">
        <Text className="mb-2 font-bold text-text">Select restaurant</Text>
        {restaurants.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => {
              setSelected(r);
              setPin(r.location);
            }}
            className={`mb-2 rounded-lg p-3 ${selected?.id === r.id ? 'bg-primary/10' : 'bg-white'}`}>
            <Text className={selected?.id === r.id ? 'font-bold text-primary' : 'text-text'}>
              {r.name}
            </Text>
          </Pressable>
        ))}
        {selected ? (
          <>
            <Text className="mb-2 mt-4 font-bold">Adjust coordinates</Text>
            <Text className="text-sm text-textLight">
              Lat: {pin.latitude.toFixed(6)}, Lng: {pin.longitude.toFixed(6)}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => setPin((p) => ({ ...p, latitude: p.latitude + 0.001 }))}
                className="rounded bg-gray-200 px-3 py-2">
                <Text>Lat +</Text>
              </Pressable>
              <Pressable
                onPress={() => setPin((p) => ({ ...p, latitude: p.latitude - 0.001 }))}
                className="rounded bg-gray-200 px-3 py-2">
                <Text>Lat −</Text>
              </Pressable>
              <Pressable
                onPress={() => setPin((p) => ({ ...p, longitude: p.longitude + 0.001 }))}
                className="rounded bg-gray-200 px-3 py-2">
                <Text>Lng +</Text>
              </Pressable>
              <Pressable
                onPress={() => setPin((p) => ({ ...p, longitude: p.longitude - 0.001 }))}
                className="rounded bg-gray-200 px-3 py-2">
                <Text>Lng −</Text>
              </Pressable>
              <Pressable
                onPress={() => setPin(MAP_CENTER)}
                className="rounded bg-secondary/30 px-3 py-2">
                <Text>Reset to center</Text>
              </Pressable>
            </View>
            <Pressable onPress={saveLocation} className="mt-4 rounded-xl bg-primary py-3">
              <Text className="text-center font-bold text-white">Save location for {selected.name}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
