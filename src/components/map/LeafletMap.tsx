import { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { mieSedapPalette } from '@/constants/colors';
import { MAP_CENTER } from '@/types';

export type MapMarker = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  markers: MapMarker[];
  center?: { latitude: number; longitude: number };
  zoom?: number;
  height?: number | string;
  interactive?: boolean;
  onMarkerPress?: (id: string) => void;
};

function buildLeafletHtml(
  markers: MapMarker[],
  center: { latitude: number; longitude: number },
  zoom: number,
  interactive: boolean,
): string {
  const markersJson = JSON.stringify(markers);
  const primary = mieSedapPalette.primary;
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const markers = ${markersJson};
    const map = L.map('map', { zoomControl: ${interactive} }).setView([${center.latitude}, ${center.longitude}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);
    const icon = L.divIcon({
      className: 'custom-pin',
      html: '<div style="background:${primary};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });
    markers.forEach(m => {
      const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(map);
      marker.bindPopup('<b>' + m.title + '</b>');
      marker.on('click', () => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker', id: m.id }));
        }
      });
    });
    if (markers.length > 1) {
      const group = L.featureGroup(markers.map(m => L.marker([m.latitude, m.longitude])));
      map.fitBounds(group.getBounds().pad(0.2));
    }
  </script>
</body>
</html>`;
}

export function LeafletMap({
  markers,
  center = MAP_CENTER,
  zoom = 14,
  height = '100%',
  interactive = true,
  onMarkerPress,
}: Props) {
  const html = useMemo(
    () => buildLeafletHtml(markers, center, zoom, interactive),
    [markers, center, zoom, interactive],
  );

  if (Platform.OS === 'web') {
    return (
      <View style={{ height: height as number, minHeight: 300 }}>
        <iframe
          title="map"
          srcDoc={html}
          style={{ border: 0, width: '100%', height: '100%', minHeight: 300 }}
        />
      </View>
    );
  }

  return (
    <View style={{ height: typeof height === 'number' ? height : 400, flex: height === '100%' ? 1 : undefined }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'marker' && onMarkerPress) {
              onMarkerPress(data.id);
            }
          } catch {
            // ignore
          }
        }}
      />
    </View>
  );
}
