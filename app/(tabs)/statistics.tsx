import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getMeasurements } from '../../database/database';
import { Measurement } from '../../types/network';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';

export default function StatisticsScreen() {
  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const measurements = await getMeasurements(15);
    // Ordenar cronológicamente para el gráfico
    setData(measurements.reverse());
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay datos suficientes para estadísticas.</Text>
      </View>
    );
  }

  const labels = data.map(m => format(m.timestamp, 'HH:mm'));
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Evolución de Latencia (ms)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: data.map(m => m.rtt_avg) }]
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisSuffix="ms"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      
      <Text style={styles.title}>Evolución de Descarga (Mbps)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: data.map(m => m.download_mbps) }]
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisSuffix="M"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </SafeAreaView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffa726' }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 12, color: '#333' },
  chart: { marginVertical: 8, borderRadius: 16 },
  emptyText: { color: '#666', fontSize: 16 }
});
