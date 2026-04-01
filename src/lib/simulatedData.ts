/**
 * simulatedData.ts
 * 
 * Módulo de simulação de dados IoT.
 * Simula dados que viriam de sensores Arduino/ESP32 via Supabase.
 * 
 * Em produção, substitua por chamadas ao Supabase Realtime:
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
 */

export interface SensorReading {
  id: number;
  temperatura: number;
  umidade: number;
  presenca: boolean;
  estoque: number;
  created_at: string;
}

/** Gera uma leitura aleatória simulando um sensor */
function generateReading(id: number, baseTime: Date): SensorReading {
  return {
    id,
    temperatura: parseFloat((20 + Math.random() * 15).toFixed(1)),
    umidade: parseFloat((40 + Math.random() * 40).toFixed(1)),
    presenca: Math.random() > 0.5,
    estoque: Math.floor(50 + Math.random() * 150),
    created_at: new Date(baseTime.getTime() - (id * 60000)).toISOString(),
  };
}

/** Gera um histórico inicial de leituras */
export function generateInitialData(count = 20): SensorReading[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => generateReading(count - i, now));
}

/** Gera uma nova leitura em tempo real */
export function generateNewReading(lastId: number): SensorReading {
  return generateReading(lastId + 1, new Date());
}
