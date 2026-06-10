import { useMemo } from 'react';
import { SensorReading } from './useIoTData';

export type AlertType = 'temperatura' | 'umidade' | 'presenca';

export interface AlertLogEntry {
  id: string;
  tipo: AlertType;
  mensagem: string;
  valor: string;
  timestamp: string; // ISO
}

const TEMP_CRITICA = 32; // > 32 °C
const UMI_CRITICA = 60;  // > 60 %

export function useAlertsLog(latest: SensorReading | null) {
  const entries = useMemo<AlertLogEntry[]>(() => {
    if (!latest) return [];

    const timestamp = latest.created_at ?? new Date().toISOString();
    const ativos: AlertLogEntry[] = [];

    if (latest.temperatura > TEMP_CRITICA) {
      ativos.push({
        id: `temp-${timestamp}`,
        tipo: 'temperatura',
        mensagem: `Temperatura crítica (>${TEMP_CRITICA}°C)`,
        valor: `${latest.temperatura.toFixed(1)} °C`,
        timestamp,
      });
    }

    if (latest.umidade > UMI_CRITICA) {
      ativos.push({
        id: `umi-${timestamp}`,
        tipo: 'umidade',
        mensagem: `Umidade crítica (>${UMI_CRITICA}%)`,
        valor: `${latest.umidade.toFixed(0)} %`,
        timestamp,
      });
    }

    if (latest.presenca) {
      ativos.push({
        id: `pres-${timestamp}`,
        tipo: 'presenca',
        mensagem: 'Presença detectada em zona crítica',
        valor: 'Movimento < 3m',
        timestamp,
      });
    }

    return ativos;
  }, [latest]);

  return { entries };
}
