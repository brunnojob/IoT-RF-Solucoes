import { useState, useEffect } from 'react';
import { SensorReading, generateInitialData, generateNewReading } from '@/lib/simulatedData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useIoTData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50)
        .then(({ data, error }) => {
          if (!error && data) {
            setReadings(data as SensorReading[]);
            setIsConnected(true);
          }
        });

      const channel = supabase
        .channel('sensor_readings_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
          (payload) => {
            const newReading = payload.new as SensorReading;
            setReadings(prev => [...prev, newReading].slice(-50));
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      const data = generateInitialData(20);
      setReadings(data);
      const timer = setTimeout(() => setIsConnected(true), 1000);

      const interval = setInterval(() => {
        setReadings(prev => {
          const newReading = generateNewReading(prev.length);
          return [...prev, newReading].slice(-50);
        });
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, []);

  const latestReading = readings[readings.length - 1] ?? null;

  return { readings, latestReading, isConnected };
}