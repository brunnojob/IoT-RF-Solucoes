export interface SensorReading {
  id: number;
  temperatura: number;
  umidade: number;
  presenca: boolean;
  estoque: number;
  created_at: string;
}

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

export function generateInitialData(count = 20): SensorReading[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => generateReading(count - i, now));
}

export function generateNewReading(lastId: number): SensorReading {
  return generateReading(lastId + 1, new Date());
}