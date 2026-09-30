import * as Notifications from 'expo-notifications';
import { QualityLevel } from '../types/network';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let lastNotificationTime = 0;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos de cooldown

export async function notifyDegradation(quality: QualityLevel) {
  if (quality === 'excellent' || quality === 'good') return;

  const now = Date.now();
  if (now - lastNotificationTime < COOLDOWN_MS) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  let title = 'Degradación de red detectada';
  let body = 'La calidad de tu conexión actual es ';
  
  if (quality === 'fair') body += 'regular.';
  if (quality === 'poor') body += 'mala.';
  if (quality === 'critical') body += 'crítica. Podrías experimentar desconexiones.';

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { quality },
    },
    trigger: null, // Enviar de inmediato
  });

  lastNotificationTime = now;
}
