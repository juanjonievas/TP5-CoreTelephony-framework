import { Tabs } from 'expo-router';
import { Activity, History, Map as MapIcon, BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      headerShown: true,
      headerTitleStyle: { fontWeight: 'bold' }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Monitor', 
          tabBarIcon: ({ color }) => <Activity color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'Historial', 
          tabBarIcon: ({ color }) => <History color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: 'Mapa', 
          tabBarIcon: ({ color }) => <MapIcon color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="statistics" 
        options={{ 
          title: 'Estadísticas', 
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Ajustes', 
          tabBarIcon: ({ color }) => <Settings color={color} size={24} /> 
        }} 
      />
    </Tabs>
  );
}
