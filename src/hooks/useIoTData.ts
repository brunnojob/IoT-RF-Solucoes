import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SensorReading {
  id: number;
  temperatura: number;
  umidade: number;
  presenca: boolean;
  created_at: string;
}

export function useIoTData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Carrega histórico inicial
    supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) setReadings(data as SensorReading[]);
      });

    // Inscreve-se em novas leituras em tempo real
    const channel = supabase
      .channel('sensor_readings_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          const nova = payload.new as SensorReading;
          setReadings((prev) => [...prev, nova].slice(-50));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const latestReading = readings[readings.length - 1] ?? null;

  return { readings, latestReading, isConnected };
}
