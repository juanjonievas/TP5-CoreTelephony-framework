# Documento Técnico: Network QoS Monitor

Aplicación móvil multiplataforma desarrollada con **React Native (Expo SDK 57)** y **TypeScript** para medir, almacenar y visualizar la calidad de la conexión de red, cumpliendo estrictamente con los requisitos del TP de Desarrollo de Aplicaciones Móviles 2026.

---

## 1. Arquitectura

El sistema se compone de dos grandes capas (Cliente Móvil y Servidor de Pruebas), diseñadas bajo un enfoque modular y reactivo:

- **Frontend Móvil (React Native + Expo Router):**
  - **Capa UI/UX:** Interfaz dividida en 5 pestañas principales (Monitor, Historial, Mapa, Estadísticas y Ajustes) usando `lucide-react-native` para iconografía fluida.
  - **Gestor de Estado Global:** Patrón basado en Zustand o Contextos ligeros (implementado en `hooks/useStore`) para inyectar la medición actual en tiempo real sin recargar componentes innecesarios.
  - **Native Bridge:** Acoplamiento directo de módulos de Kotlin puro (`CellularInfoModule`, `ForegroundModule`) mediante las APIs nativas de Expo Modules para acceder a sensores de bajo nivel bloqueados en JavaScript estándar.
  - **Capa de Datos:** Base de datos local transaccional mediante `expo-sqlite`, encapsulando consultas paramétricas y pre-filtrado nativo.

- **Servidor Backend (Node.js + Express):**
  - Microservicio alojado localmente responsable exclusivamente de saturar el canal (Throughput). Expone buffers de datos ciegos de diferentes megabytes para calcular el ancho de banda real bidireccional.

---

## 2. Decisiones de Diseño

Para garantizar la estabilidad y la escalabilidad del TP, se tomaron las siguientes decisiones de diseño:

1. **Arquitectura Híbrida y Fallbacks (Resistencia a Fallos):**
   - El TP exige el uso de **Sockets TCP** puros y lectura de **RSSI real**. Como estas funciones bloquean la compatibilidad nativa con la app de "Expo Go" e iOS genérico, se diseñó un "Plan B" automático en el código. Si falla la lectura TCP o el SO bloquea el TelephonyManager, el `MeasurementEngine` calcula métricas virtuales usando HTTP Pings y "Network Quality", evitando que la app crashee y logrando funcionar en cualquier entorno durante pruebas rápidas.
   
2. **Medición Asíncrona Orquestada:**
   - La ejecución de la red (Ping, Download, Upload y GPS) se orquesta de manera puramente asíncrona usando `Promise.all` solo cuando es seguro, reduciendo el cuello de botella del Jitter para que una petición no interfiera con la otra.

3. **Mapa de Calor Adaptativo:**
   - El renderizado de `react-native-maps` utiliza mapas de calor (Heatmaps) basados en pesos de señal reales. Para dispositivos Apple (que por defecto usan MapKit y no soportan Heatmaps nativamente), el sistema detecta la plataforma en tiempo real y renderiza marcadores vectoriales individuales, garantizando la experiencia multiplataforma.

4. **Monitoreo en Background:**
   - Se descartó el polling infinito tradicional. En Android, se registró en el `AndroidManifest` un *Foreground Service* nativo acoplado a un `Headless JS Task` (`MonitorHeadlessTaskService.kt`), para asegurar que el sistema Android no asesine la app cuando se apaga la pantalla, logrando medir cada 15 minutos exactos de forma confiable.

---

## 3. Limitaciones Conocidas

- **Restricciones de iOS (Apple Maps):** Los Mapas de Calor (Heatmaps) están desactivados condicionalmente en la compilación de iOS ya que requieren forzosamente la inyección de una clave de API de Google Maps de pago para funcionar en el ecosistema Apple.
- **Expo Go vs Build Nativa:** Las funciones estrella (Ping TCP puro y lectura decibelular del RSSI) **requieren** una compilación nativa (`npx expo run:android` o APK). Al ejecutarse bajo el QR de "Expo Go", la app utilizará funciones simuladas de calidad (Fallbacks) por limitaciones de seguridad propias de la tienda de aplicaciones.
- **Batería en ROMs Asiáticas:** En capas de personalización muy agresivas con la batería (MIUI de Xiaomi, EMUI de Huawei), el servicio en segundo plano de 15 minutos puede verse suspendido si el usuario no configura explícitamente "Sin restricciones" en la administración de energía del teléfono.

---

## 4. Ejecución del Proyecto

### Iniciar el Backend (Requerido para Medición de Velocidad)
1. Modificar el archivo `.env` en el root configurando la IP local de tu PC en `EXPO_PUBLIC_API_URL`.
2. Ejecutar:
```bash
cd backend
npm install
npm run dev
```

### Iniciar el Frontend Móvil
**A. Pruebas Rápidas (Expo Go)**
```bash
npm install --legacy-peer-deps
npx expo start -c
```
*(Nota: Escanear presionando antes la tecla `s` en la consola para QR compatible).*

**B. Pruebas Completas Nativas (Requiere Cable USB / Android Studio)**
```bash
npx expo run:android
```

---

## 📊 Cumplimiento de Requisitos (Matriz de Trazabilidad)
- **RF-01 (Red y Operador):** ✅ Native Module Kotlin + Expo Network.
- **RF-02 (RTT 3 Hosts):** ✅ TCP Sockets + HTTP Fallback.
- **RF-03 (Throughput):** ✅ Backend Local dedicado.
- **RF-04 (GPS/Timestamp):** ✅ Expo Location.
- **RF-05 (Mapa Heatmap):** ✅ React Native Maps condicional.
- **RF-06 (Series Temporales):** ✅ React Native Chart Kit.
- **RF-07 (Background):** ✅ Foreground Service Android.
- **RF-08 (Exportación):** ✅ CSV/JSON vía Expo Sharing.
- **RF-09 (Filtros):** ✅ UI Reactiva y Queries SQLite.
