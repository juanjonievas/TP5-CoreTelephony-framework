import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getMeasurements } from '../database/database';
import { Measurement } from '../types/network';

export async function exportDataAsCSV() {
  const data = await getMeasurements(1000);
  if (data.length === 0) return false;

  const header = 'timestamp,network_type,operator,rssi,latency_method,rtt_min,rtt_avg,rtt_max,jitter,packet_loss,download_mbps,upload_mbps,latitude,longitude,quality\n';
  
  const rows = data.map(m => {
    return `${m.timestamp},${m.network_type},${m.operator || ''},${m.rssi || ''},${m.latency_method},${m.rtt_min},${m.rtt_avg},${m.rtt_max},${m.jitter},${m.packet_loss},${m.download_mbps},${m.upload_mbps},${m.latitude || ''},${m.longitude || ''},${m.quality}`;
  }).join('\n');

  const csv = header + rows;
  const uri = FileSystem.documentDirectory + 'network_measurements.csv';
  
  await FileSystem.writeAsStringAsync(uri, csv);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
    return true;
  }
  return false;
}

export async function exportDataAsJSON() {
  const data = await getMeasurements(1000);
  if (data.length === 0) return false;

  const json = JSON.stringify(data, null, 2);
  const uri = FileSystem.documentDirectory + 'network_measurements.json';
  
  await FileSystem.writeAsStringAsync(uri, json);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
    return true;
  }
  return false;
}
