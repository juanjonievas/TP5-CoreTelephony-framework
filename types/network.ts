export type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
export type QualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface LatencyResult {
  min: number;
  avg: number;
  max: number;
  jitter: number;
  packetLoss: number; // percentage
}

export interface ThroughputResult {
  downloadMbps: number;
  uploadMbps: number;
  downloadBytes: number;
  uploadBytes: number;
  downloadDuration: number;
  uploadDuration: number;
}

export interface Measurement {
  id?: number;
  timestamp: number;
  network_type: NetworkType;
  operator: string | null;
  rssi: number | null;
  latency_method: 'tcp' | 'http';
  rtt_min: number;
  rtt_avg: number;
  rtt_max: number;
  jitter: number;
  packet_loss: number;
  download_mbps: number;
  upload_mbps: number;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  quality: QualityLevel;
}

export interface MeasurementResult extends Measurement {}
