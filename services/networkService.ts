import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NativeModules, Platform } from 'react-native';
import { NetworkType } from '../types/network';

// Intentar cargar el módulo nativo, si no existe devolvemos null
const CellularInfo = NativeModules.CellularInfoModule || null;

export async function getNetworkStatus() {
  const state = await NetInfo.fetch();
  
  let networkType: NetworkType = 'unknown';
  if (state.type === 'wifi') networkType = 'wifi';
  else if (state.type === 'cellular') networkType = 'cellular';
  else if (state.type === 'ethernet') networkType = 'ethernet';
  else if (state.type === 'none') networkType = 'none';

  let operator = null;
  let rssi = null;

  if (state.type === 'cellular') {
    if (Platform.OS === 'android' && CellularInfo) {
      try {
        const cellularData = await CellularInfo.getCellularInfo();
        operator = cellularData.operator || (state.details as any)?.carrier || 'Desconocido';
        rssi = cellularData.rssi || null;
        if (cellularData.networkType) {
          // Podríamos ajustar el networkType más específicamente (ej 4G, 5G)
        }
      } catch (e) {
        console.warn('Error reading native cellular info', e);
        operator = (state.details as any)?.carrier || 'Desconocido';
      }
    } else {
      operator = (state.details as any)?.carrier || 'Desconocido (Expo Go)';
    }
  }

  return {
    type: networkType,
    operator,
    rssi,
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable
  };
}
