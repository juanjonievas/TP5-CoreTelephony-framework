import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { exportDataAsCSV, exportDataAsJSON } from '../../services/exportService';
import { clearMeasurements } from '../../database/database';
import { registerBackgroundFetchAsync, unregisterBackgroundFetchAsync } from '../../services/backgroundService';
import { useState } from 'react';

export default function SettingsScreen() {
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);

  const handleExportCSV = async () => {
    const success = await exportDataAsCSV();
    if (!success) Alert.alert('Error', 'No hay datos para exportar.');
  };

  const handleExportJSON = async () => {
    const success = await exportDataAsJSON();
    if (!success) Alert.alert('Error', 'No hay datos para exportar.');
  };

  const handleClearData = () => {
    Alert.alert('Confirmar', '¿Borrar todo el historial?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: async () => {
          await clearMeasurements();
          Alert.alert('Éxito', 'Historial borrado.');
      }}
    ]);
  };

  const toggleBackground = async (value: boolean) => {
    try {
      if (value) {
        await registerBackgroundFetchAsync();
      } else {
        await unregisterBackgroundFetchAsync();
      }
      setBackgroundEnabled(value);
    } catch (e) {
      Alert.alert('Error', 'No se pudo configurar el proceso en segundo plano.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Configuración</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos</Text>
        <TouchableOpacity style={styles.button} onPress={handleExportCSV}>
          <Text style={styles.buttonText}>Exportar a CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleExportJSON}>
          <Text style={styles.buttonText}>Exportar a JSON</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearData}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Borrar Historial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segundo Plano (Expo Fetch)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Mediciones Periódicas</Text>
          <Switch value={backgroundEnabled} onValueChange={toggleBackground} />
        </View>
        <Text style={styles.helperText}>
          Nota: En Expo Go, la ejecución en segundo plano depende del SO y puede no ser exacta.
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  button: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  dangerButton: { backgroundColor: '#FFEBEE' },
  buttonText: { color: '#1976D2', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, color: '#333' },
  helperText: { fontSize: 12, color: '#999', marginTop: 8 }
});
