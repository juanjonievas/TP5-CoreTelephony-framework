import { QualityLevel } from '../types/network';
import { CONFIG } from '../constants/config';

export function calculateNetworkQuality(
  latency: number,
  jitter: number,
  packetLoss: number,
  downloadMbps: number
): QualityLevel {
  const { THRESHOLDS } = CONFIG;

  // Sistema de puntos (0 a 100, donde menor es mejor)
  let score = 0;

  // Latencia
  if (latency <= THRESHOLDS.LATENCY.EXCELLENT) score += 0;
  else if (latency <= THRESHOLDS.LATENCY.GOOD) score += 10;
  else if (latency <= THRESHOLDS.LATENCY.FAIR) score += 30;
  else if (latency <= THRESHOLDS.LATENCY.POOR) score += 50;
  else score += 100;

  // Jitter
  if (jitter <= THRESHOLDS.JITTER.EXCELLENT) score += 0;
  else if (jitter <= THRESHOLDS.JITTER.GOOD) score += 10;
  else if (jitter <= THRESHOLDS.JITTER.FAIR) score += 20;
  else if (jitter <= THRESHOLDS.JITTER.POOR) score += 40;
  else score += 100;

  // Packet Loss
  if (packetLoss <= THRESHOLDS.PACKET_LOSS.EXCELLENT) score += 0;
  else if (packetLoss <= THRESHOLDS.PACKET_LOSS.GOOD) score += 20;
  else if (packetLoss <= THRESHOLDS.PACKET_LOSS.FAIR) score += 40;
  else if (packetLoss <= THRESHOLDS.PACKET_LOSS.POOR) score += 60;
  else score += 100;

  // Download Mbps (Invertido, mayor es mejor)
  if (downloadMbps >= THRESHOLDS.DOWNLOAD_MBPS.EXCELLENT) score += 0;
  else if (downloadMbps >= THRESHOLDS.DOWNLOAD_MBPS.GOOD) score += 10;
  else if (downloadMbps >= THRESHOLDS.DOWNLOAD_MBPS.FAIR) score += 30;
  else if (downloadMbps >= THRESHOLDS.DOWNLOAD_MBPS.POOR) score += 50;
  else score += 100;

  // Determinar nivel basado en score total
  if (score <= 20) return 'excellent';
  if (score <= 50) return 'good';
  if (score <= 90) return 'fair';
  if (score <= 150) return 'poor';
  return 'critical';
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
