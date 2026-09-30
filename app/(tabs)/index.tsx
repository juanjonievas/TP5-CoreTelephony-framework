import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../hooks/useStore';
import { performFullMeasurement } from '../../services/measurementEngine';
import { Network, Activity, Download, Upload, MapPin, AlertCircle } from 'lucide-react-native';
import { QualityLevel } from '../../types/network';

export default function MonitorScreen() {
  const { currentMeasurement, isMeasuring, setCurrentMeasurement, setIsMeasuring } = useStore();

  const handleMeasure = async () => {
    setIsMeasuring(true);
    try {
      const result = await performFullMeasurement(true);
      setCurrentMeasurement(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMeasuring(false);
    }
  };

  const getQualityColor = (quality: QualityLevel) => {
    switch (quality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'fair': return '#FFC107';
      case 'poor': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getQualityLabel = (quality: QualityLevel) => {
    switch (quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'fair': return 'Regular';
      case 'poor': return 'Mala';
      case 'critical': return 'Crítica';
      default: return 'Desconocida';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Network QoS Monitor</Text>
        </View>

        {currentMeasurement && (
          <View style={styles.card}>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(currentMeasurement.quality) }]}>
              <Text style={styles.qualityText}>{getQualityLabel(currentMeasurement.quality)}</Text>
            </View>
            
            <View style={styles.row}>
              <Network color="#555" size={20} />
              <Text style={styles.label}>Tipo de Red: </Text>
              <Text style={styles.value}>{currentMeasurement.network_type.toUpperCase()}</Text>
            </View>
            {currentMeasurement.operator && (
              <View style={styles.row}>
                <Text style={styles.label}>Operador: </Text>
                <Text style={styles.value}>{currentMeasurement.operator}</Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Activity color="#555" size={20} />
                <Text style={styles.gridLabel}>Latencia</Text>
                <Text style={styles.gridValue}>{currentMeasurement.rtt_avg} ms</Text>
              </View>
              <View style={styles.gridItem}>
                <Activity color="#555" size={20} />
                <Text style={styles.gridLabel}>Jitter</Text>
                <Text style={styles.gridValue}>{currentMeasurement.jitter} ms</Text>
              </View>
              <View style={styles.gridItem}>
                <AlertCircle color="#555" size={20} />
                <Text style={styles.gridLabel}>Pérdida Pqts</Text>
                <Text style={styles.gridValue}>{currentMeasurement.packet_loss}%</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Download color="#555" size={20} />
                <Text style={styles.gridLabel}>Descarga</Text>
                <Text style={styles.gridValue}>{currentMeasurement.download_mbps} Mbps</Text>
              </View>
              <View style={styles.gridItem}>
                <Upload color="#555" size={20} />
                <Text style={styles.gridLabel}>Subida</Text>
                <Text style={styles.gridValue}>{currentMeasurement.upload_mbps} Mbps</Text>
              </View>
            </View>

            {currentMeasurement.latitude && (
              <>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <MapPin color="#555" size={20} />
                  <Text style={styles.label}>Ubicación: </Text>
                  <Text style={styles.value}>
                    {currentMeasurement.latitude.toFixed(4)}, {currentMeasurement.longitude?.toFixed(4)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {!currentMeasurement && !isMeasuring && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay mediciones recientes.</Text>
            <Text style={styles.emptySubText}>Toca "Iniciar Medición" para evaluar la red.</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, isMeasuring && styles.buttonDisabled]} 
          onPress={handleMeasure}
          disabled={isMeasuring}
        >
          {isMeasuring ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Medición</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scroll: { padding: 16 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 24 },
  qualityBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 16 },
  qualityText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 16, color: '#666', marginLeft: 8 },
  value: { fontSize: 16, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 16 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  gridItem: { flex: 1, alignItems: 'center' },
  gridLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  gridValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  emptyState: { alignItems: 'center', marginVertical: 40 },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#A0C8FF' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
