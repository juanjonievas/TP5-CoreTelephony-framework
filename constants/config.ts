export const CONFIG = {
  // Configuración de Calidad de Red (Umbrales)
  THRESHOLDS: {
    LATENCY: {
      EXCELLENT: 50,  // ms
      GOOD: 100,
      FAIR: 200,
      POOR: 500,
    },
    JITTER: {
      EXCELLENT: 10,
      GOOD: 20,
      FAIR: 50,
      POOR: 100,
    },
    PACKET_LOSS: {
      EXCELLENT: 0,
      GOOD: 2,
      FAIR: 5,
      POOR: 10,
    },
    DOWNLOAD_MBPS: {
      EXCELLENT: 50,
      GOOD: 20,
      FAIR: 5,
      POOR: 1,
    }
  },
  
  // Variables de entorno o defaults
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000',
  THROUGHPUT_DOWNLOAD_SIZE: parseInt(process.env.EXPO_PUBLIC_THROUGHPUT_DOWNLOAD_SIZE || '5', 10),
  LATENCY_HOSTS: [
    process.env.EXPO_PUBLIC_LATENCY_HOST_1 || 'https://1.1.1.1',
    process.env.EXPO_PUBLIC_LATENCY_HOST_2 || 'https://8.8.8.8',
    process.env.EXPO_PUBLIC_LATENCY_HOST_3 || 'https://www.google.com'
  ]
};
