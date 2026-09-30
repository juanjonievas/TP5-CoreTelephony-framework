import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import { useEffect, useState } from 'react';
import { getFilteredMeasurements, MeasurementFilters } from '../../database/database';
import { Measurement } from '../../types/network';

export default function MapScreen() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [filters, setFilters] = useState<MeasurementFilters>({ networkType: 'all', quality: 'all' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    const data = await getFilteredMeasurements(filters, 100);
    // Filtrar los que tienen ubicación válida
    setMeasurements(data.filter(m => m.latitude !== null && m.longitude !== null));
  };

  const initialRegion = measurements.length > 0
    ? {
        latitude: measurements[0].latitude!,
        longitude: measurements[0].longitude!,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: -34.6037, // Default Buenos Aires
        longitude: -58.3816,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  const getMarkerColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'green';
      case 'good': return 'yellow';
      case 'fair': return 'orange';
      case 'poor': return 'red';
      case 'critical': return 'purple';
      default: return 'gray';
    }
  };

  const heatmapPoints = measurements.map(m => {
    let weight = 1;
    if (m.rssi !== null) {
      // Convertir RSSI típico (-120 a -50) a un peso positivo (0 a 70)
      weight = Math.max(1, m.rssi + 120);
    } else {
      // Fallback
      weight = m.quality === 'excellent' ? 70 : m.quality === 'good' ? 50 : m.quality === 'fair' ? 30 : 10;
    }
    return {
      latitude: m.latitude!,
      longitude: m.longitude!,
      weight
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda del Mapa</Text>
        <Text style={styles.legendText}>🟢 Excelente | 🟡 Bueno | 🟠 Regular | 🔴 Malo</Text>
        <Text style={styles.legendText}>Heatmap: {Platform.OS === 'ios' ? 'No disponible en iOS Expo Go' : 'Usa RSSI real o fallback.'}</Text>
      </View>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {/* Marcadores individuales */}
        {measurements.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude!, longitude: m.longitude! }}
            title={`Red: ${m.network_type}`}
            description={`DL: ${m.download_mbps} Mbps | RTT: ${m.rtt_avg}ms | RSSI: ${m.rssi || 'N/A'}`}
            pinColor={getMarkerColor(m.quality)}
          />
        ))}

        {/* Heatmap (Solo Android, iOS Apple Maps no lo soporta de forma nativa sin Google SDK) */}
        {Platform.OS === 'android' && heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            radius={40}
            opacity={0.7}
            gradient={{
              colors: ['green', 'yellow', 'red'],
              startPoints: [0.1, 0.5, 1.0],
              colorMapSize: 256
            }}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  legend: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 8,
    zIndex: 10,
    elevation: 4
  },
  legendTitle: { fontWeight: 'bold', marginBottom: 4 },
  legendText: { fontSize: 12, color: '#333' }
});
