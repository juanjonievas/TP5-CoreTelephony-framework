import * as SQLite from 'expo-sqlite';
import { Measurement } from '../types/network';

// Usamos la API sincrónica/asincrónica de expo-sqlite ~14.0.0
let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('network_monitor.db');
  }
  return db;
}

export async function setupDatabase() {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      network_type TEXT NOT NULL,
      operator TEXT,
      rtt_min REAL NOT NULL,
      rtt_avg REAL NOT NULL,
      rtt_max REAL NOT NULL,
      jitter REAL NOT NULL,
      packet_loss REAL NOT NULL,
      download_mbps REAL NOT NULL,
      upload_mbps REAL NOT NULL,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      rssi REAL,
      latency_method TEXT NOT NULL,
      quality TEXT NOT NULL
    );
  `);
}

export async function insertMeasurement(m: Measurement): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO measurements (
      timestamp, network_type, operator, rtt_min, rtt_avg, rtt_max, jitter, packet_loss,
      download_mbps, upload_mbps, latitude, longitude, accuracy, rssi, latency_method, quality
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      m.timestamp, m.network_type, m.operator || null, m.rtt_min, m.rtt_avg, m.rtt_max, m.jitter, m.packet_loss,
      m.download_mbps, m.upload_mbps, m.latitude || null, m.longitude || null, m.accuracy || null, m.rssi || null, m.latency_method, m.quality
    ]
  );
  return result.lastInsertRowId;
}

export async function getMeasurements(limit: number = 100): Promise<Measurement[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Measurement>('SELECT * FROM measurements ORDER BY timestamp DESC LIMIT ?', [limit]);
  return rows;
}

export interface MeasurementFilters {
  networkType?: string;
  startDate?: number;
  endDate?: number;
  quality?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // en metros
}

export async function getFilteredMeasurements(filters: MeasurementFilters, limit: number = 100): Promise<Measurement[]> {
  const database = await getDatabase();
  let query = 'SELECT * FROM measurements WHERE 1=1';
  const params: any[] = [];

  if (filters.networkType && filters.networkType !== 'all') {
    query += ' AND network_type = ?';
    params.push(filters.networkType);
  }

  if (filters.startDate) {
    query += ' AND timestamp >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND timestamp <= ?';
    params.push(filters.endDate);
  }

  if (filters.quality && filters.quality !== 'all') {
    query += ' AND quality = ?';
    params.push(filters.quality);
  }

  if (filters.latitude !== undefined && filters.longitude !== undefined && filters.radius !== undefined) {
    // Aproximación simple de Bounding Box (1 grado aprox = 111km)
    const radiusDeg = filters.radius / 111000;
    query += ' AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?';
    params.push(filters.latitude - radiusDeg, filters.latitude + radiusDeg);
    params.push(filters.longitude - radiusDeg, filters.longitude + radiusDeg);
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  return await database.getAllAsync<Measurement>(query, params);
}

export async function clearMeasurements(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM measurements');
}
