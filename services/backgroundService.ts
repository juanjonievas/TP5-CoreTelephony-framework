import { NativeModules, Platform } from 'react-native';
// Retenemos expo-task-manager como fallback opcional si se requiere
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { performFullMeasurement } from './measurementEngine';

const ForegroundModule = NativeModules.ForegroundModule;
const BACKGROUND_FETCH_TASK = 'network-monitor-background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await performFullMeasurement(true);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
  if (Platform.OS === 'android' && ForegroundModule) {
    try {
      await ForegroundModule.startService();
      return;
    } catch (e) {
      console.warn('Failed to start native foreground service, falling back to Expo Fetch', e);
    }
  }
  
  // Fallback
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundFetchAsync() {
  if (Platform.OS === 'android' && ForegroundModule) {
    try {
      await ForegroundModule.stopService();
      return;
    } catch (e) {
      console.warn('Failed to stop native foreground service', e);
    }
  }
  
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}
