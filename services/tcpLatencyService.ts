import { CONFIG } from '../constants/config';
import { LatencyResult } from '../types/network';

// Intentamos importar de forma segura para que Expo Go no explote
let TcpSocket: any = null;
try {
  TcpSocket = require('react-native-tcp-socket').default;
} catch (e) {
  console.warn('react-native-tcp-socket no disponible en este entorno (Expo Go)');
}

export interface TcpLatencyResult {
  host: string;
  success: boolean;
  rtt: number | null;
  error?: string;
}

export async function measureTcpLatency(): Promise<LatencyResult & { method: 'tcp' }> {
  if (!TcpSocket) {
    throw new Error('TCP Socket module is not available in Expo Go');
  }
  // Quitamos el protocolo para el socket
  const hosts = CONFIG.LATENCY_HOSTS.map(h => h.replace('https://', '').replace('http://', '').split('/')[0]);
  const pings = 5;
  const timeoutMs = 3000;
  
  let rtts: number[] = [];
  let failures = 0;
  let totalSondas = hosts.length * pings;

  for (const host of hosts) {
    for (let i = 0; i < pings; i++) {
      try {
        const rtt = await pingHost(host, 443, timeoutMs);
        rtts.push(rtt);
      } catch (error) {
        failures++;
      }
    }
  }

  if (rtts.length === 0) {
    throw new Error('All TCP pings failed');
  }

  const min = Math.min(...rtts);
  const max = Math.max(...rtts);
  const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
  
  let jitterSum = 0;
  for (let i = 1; i < rtts.length; i++) {
    jitterSum += Math.abs(rtts[i] - rtts[i - 1]);
  }
  const jitter = rtts.length > 1 ? jitterSum / (rtts.length - 1) : 0;
  const packetLoss = (failures / totalSondas) * 100;

  return {
    min: Math.round(min),
    avg: Math.round(avg),
    max: Math.round(max),
    jitter: Math.round(jitter),
    packetLoss: Math.round(packetLoss * 10) / 10,
    method: 'tcp'
  };
}

function pingHost(host: string, port: number, timeoutMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    let hasResponded = false;

    const client = TcpSocket.createConnection({ host, port, tls: false }, () => {
      if (!hasResponded) {
        hasResponded = true;
        const end = performance.now();
        client.destroy();
        resolve(end - start);
      }
    });

    client.on('error', (err) => {
      if (!hasResponded) {
        hasResponded = true;
        client.destroy();
        reject(err);
      }
    });

    setTimeout(() => {
      if (!hasResponded) {
        hasResponded = true;
        client.destroy();
        reject(new Error('Timeout'));
      }
    }, timeoutMs);
  });
}
