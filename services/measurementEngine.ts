import { getNetworkStatus } from './networkService';
import { measureLatency } from './latencyService';
import { measureTcpLatency } from './tcpLatencyService';
import { measureThroughput } from './throughputService';
import { getCurrentLocation } from './locationService';
import { calculateNetworkQuality } from '../utils/calculations';
import { Measurement } from '../types/network';
import { notifyDegradation } from './notificationService';
import { insertMeasurement } from '../database/database';

export async function performFullMeasurement(saveToDb = true): Promise<Measurement> {
  const networkPromise = getNetworkStatus();
  const locationPromise = getCurrentLocation();
  const throughputPromise = measureThroughput();

  let latencyResult;
  let latencyMethod: 'tcp' | 'http' = 'tcp';
  try {
    latencyResult = await measureTcpLatency();
  } catch (error) {
    console.warn('TCP Latency failed, falling back to HTTP', error);
    latencyResult = await measureLatency();
    latencyMethod = 'http';
  }

  const [network, location, throughput] = await Promise.all([
    networkPromise,
    locationPromise,
    throughputPromise,
  ]);

  const quality = calculateNetworkQuality(
    latencyResult.avg,
    latencyResult.jitter,
    latencyResult.packetLoss,
    throughput.downloadMbps
  );

  const measurement: Measurement = {
    timestamp: Date.now(),
    network_type: network.type,
    operator: network.operator,
    rssi: network.rssi || null,
    latency_method: latencyMethod,
    rtt_min: latencyResult.min,
    rtt_avg: latencyResult.avg,
    rtt_max: latencyResult.max,
    jitter: latencyResult.jitter,
    packet_loss: latencyResult.packetLoss,
    download_mbps: throughput.downloadMbps,
    upload_mbps: throughput.uploadMbps,
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,
    accuracy: location?.accuracy || null,
    quality
  };

  if (saveToDb) {
    try {
      measurement.id = await insertMeasurement(measurement);
    } catch (e) {
      console.error('Failed to save measurement', e);
    }
  }

  // Notificar si hay degradación severa
  if (quality === 'poor' || quality === 'critical') {
    notifyDegradation(quality);
  }

  return measurement;
}
