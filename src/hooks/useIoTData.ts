/**
 * useIoTData.ts
 * 
 * Hook personalizado para gerenciar dados IoT.
 * Atualmente usa dados simulados — para produção,
 * substitua pelo Supabase Realtime.
 * 
 * Exemplo com Supabase Realtime:
 * 
 *   const supabase = createClient(
 *     'SUA_SUPABASE_URL',   // <-- Coloque sua URL aqui
 *     'SUA_SUPABASE_KEY'    // <-- Coloque sua chave anon aqui
 *   );
 * 
 *   supabase
 *     .channel('sensor_data')
 *     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, 
 *       (payload) => { // novo dado })
 *     .subscribe();
 */

import { useState, useEffect, useCallback } from 'react';
import { SensorReading, generateInitialData, generateNewReading } from '@/lib/simulatedData';

export function useIoTData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Inicializa com dados históricos
  useEffect(() => {
    const data = generateInitialData(20);
    setReadings(data);
    // Simula conexão após 1 segundo
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simula recebimento de dados em tempo real (a cada 3 segundos)
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setReadings(prev => {
        const newReading = generateNewReading(prev.length);
        // Mantém últimos 50 registros
        const updated = [...prev, newReading];
        return updated.slice(-50);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Última leitura (mais recente)
  const latestReading = readings[readings.length - 1] ?? null;

  return { readings, latestReading, isConnected };
}
