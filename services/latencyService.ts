import { CONFIG } from '../constants/config';
import { LatencyResult } from '../types/network';

// Alternativa en Expo Go: Medimos RTT usando HTTP HEAD/GET en lugar de sockets TCP puros,
// debido a restricciones en módulos nativos sin un Development Build.
export async function measureLatency(): Promise<LatencyResult> {
  const hosts = CONFIG.LATENCY_HOSTS;
  const pings = 5; // Pings por host
  let rtts: number[] = [];
  let failures = 0;
  let totalSondas = hosts.length * pings;

  for (const host of hosts) {
    for (let i = 0; i < pings; i++) {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        // Usamos cache: no-store y un timestamp para evitar cache local
        await fetch(`${host}?t=${Date.now()}`, { 
          method: 'HEAD', 
          cache: 'no-store',
          signal: controller.signal as any
        });
        
        clearTimeout(timeoutId);
        const end = performance.now();
        rtts.push(end - start);
      } catch (error) {
        failures++;
      }
    }
  }

  if (rtts.length === 0) {
    return { min: 0, avg: 0, max: 0, jitter: 0, packetLoss: 100 };
  }

  const min = Math.min(...rtts);
  const max = Math.max(...rtts);
  const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
  
  // Cálculo de jitter basado en variación de RTTs consecutivos
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
    packetLoss: Math.round(packetLoss * 10) / 10
  };
}
