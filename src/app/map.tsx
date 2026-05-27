import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { LeafletMap, type MapMarker } from '@/components/map/LeafletMap';
import { fetchRestaurants } from '@/features/restaurants/api';
import { MAP_CENTER } from '@/types';

export default function MapScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const restaurants = await fetchRestaurants();
      setMarkers(
        restaurants.map((r) => ({
          id: r.id,
          title: r.name,
          latitude: r.location.latitude,
          longitude: r.location.longitude,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#D32F2F" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LeafletMap
        markers={markers.length > 0 ? markers : [{ id: 'center', title: 'You', ...MAP_CENTER }]}
        center={MAP_CENTER}
        height="100%"
        onMarkerPress={(id) => router.push(`/restaurant/${id}`)}
      />
    </View>
  );
}
