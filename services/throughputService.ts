import axios from 'axios';
import { CONFIG } from '../constants/config';
import { ThroughputResult } from '../types/network';

export async function measureThroughput(): Promise<ThroughputResult> {
  const apiUrl = CONFIG.API_URL;
  const downloadSize = CONFIG.THROUGHPUT_DOWNLOAD_SIZE; // MB
  
  let downloadMbps = 0;
  let uploadMbps = 0;
  let downloadBytes = 0;
  let uploadBytes = 0;
  let downloadDuration = 0;
  let uploadDuration = 0;

  // Test de Descarga
  try {
    const startDL = performance.now();
    const response = await axios.get(`${apiUrl}/download?size=${downloadSize}`, {
      responseType: 'arraybuffer',
      timeout: 10000 // 10s max
    });
    const endDL = performance.now();
    
    downloadBytes = response.data.byteLength;
    downloadDuration = (endDL - startDL) / 1000; // segundos
    
    // Mbps = (bytes * 8 bits/byte) / segundos / 1,000,000
    downloadMbps = (downloadBytes * 8) / downloadDuration / 1000000;
  } catch (error) {
    console.error('Download throughput test failed', error);
  }

  // Test de Subida
  try {
    // Generar un payload en memoria (ej: 1MB para subida rápida)
    const uploadPayloadSize = 1024 * 1024; // 1MB
    const dummyData = new Uint8Array(uploadPayloadSize);
    dummyData.fill(1);
    
    const startUL = performance.now();
    await axios.post(`${apiUrl}/upload`, dummyData, {
      headers: { 'Content-Type': 'application/octet-stream' },
      timeout: 10000
    });
    const endUL = performance.now();

    uploadBytes = uploadPayloadSize;
    uploadDuration = (endUL - startUL) / 1000;
    uploadMbps = (uploadBytes * 8) / uploadDuration / 1000000;
  } catch (error) {
    console.error('Upload throughput test failed', error);
  }

  return {
    downloadMbps: Number(downloadMbps.toFixed(2)),
    uploadMbps: Number(uploadMbps.toFixed(2)),
    downloadBytes,
    uploadBytes,
    downloadDuration,
    uploadDuration
  };
}
