import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getFilteredMeasurements, MeasurementFilters } from '../../database/database';
import { Measurement } from '../../types/network';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MeasurementFilters>({ networkType: 'all', quality: 'all' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    const data = await getFilteredMeasurements(filters, 50);
    setMeasurements(data);
    setLoading(false);
  };

  const clearFilters = () => {
    setFilters({ networkType: 'all', quality: 'all' });
  };

  const renderItem = ({ item }: { item: Measurement }) => (
    <View style={styles.item}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>{format(item.timestamp, 'dd/MM/yyyy HH:mm')}</Text>
        <Text style={[styles.quality, { color: getQualityColor(item.quality) }]}>
          {item.quality.toUpperCase()}
        </Text>
      </View>
      <View style={styles.detailsRow}>
        <Text style={styles.text}>{item.network_type}</Text>
        <Text style={styles.text}>{item.rtt_avg}ms</Text>
        <Text style={styles.text}>⬇ {item.download_mbps} Mbps</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial ({measurements.length})</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterBtnText}>{showFilters ? 'Ocultar Filtros' : 'Filtros'}</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Red:</Text>
          <View style={styles.row}>
            {['all', 'wifi', 'cellular'].map(t => (
              <TouchableOpacity key={t} style={[styles.filterChip, filters.networkType === t && styles.activeChip]} onPress={() => setFilters({ ...filters, networkType: t })}>
                <Text style={styles.chipText}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>Calidad:</Text>
          <View style={styles.row}>
            {['all', 'excellent', 'good', 'poor'].map(q => (
              <TouchableOpacity key={q} style={[styles.filterChip, filters.quality === q && styles.activeChip]} onPress={() => setFilters({ ...filters, quality: q })}>
                <Text style={styles.chipText}>{q.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Limpiar filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={measurements}
          keyExtractor={(item) => item.id?.toString() || item.timestamp.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay datos con estos filtros.</Text>}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'excellent': return '#4CAF50';
    case 'good': return '#8BC34A';
    case 'fair': return '#FFC107';
    case 'poor': return '#FF9800';
    case 'critical': return '#F44336';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  filterBtnText: { color: '#007AFF', fontSize: 16 },
  filterContainer: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#fff', marginBottom: 8 },
  filterLabel: { fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  filterChip: { backgroundColor: '#eee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  activeChip: { backgroundColor: '#007AFF' },
  chipText: { color: '#333' },
  clearBtn: { marginTop: 12, alignSelf: 'flex-start' },
  clearBtnText: { color: 'red' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  item: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  date: { fontSize: 14, color: '#666' },
  quality: { fontSize: 14, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  text: { fontSize: 14, color: '#333' },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' }
});
