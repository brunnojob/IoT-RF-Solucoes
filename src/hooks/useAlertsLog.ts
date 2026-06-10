import { useEffect, useRef, useState } from 'react';
import { SensorReading } from './useIoTData';

export type AlertType = 'temperatura' | 'umidade' | 'presenca';

export interface AlertLogEntry {
  id: string;
  tipo: AlertType;
  mensagem: string;
  valor: string;
  timestamp: string; // ISO
}

const STORAGE_KEY = 'rf_alertas_sms_log';
const MAX_ENTRIES = 100;
const COOLDOWN_MS = 60_000;

const TEMP_CRITICA = 32; // > 32 °C
const UMI_CRITICA = 60;  // > 60 %

function loadLog(): AlertLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: AlertLogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function useAlertsLog(latest: SensorReading | null) {
  const [entries, setEntries] = useState<AlertLogEntry[]>(() => loadLog());
  const lastSentRef = useRef<Record<AlertType, number>>({
    temperatura: 0,
    umidade: 0,
    presenca: 0,
  });

  useEffect(() => {
    if (!latest) return;

    const now = Date.now();
    const novos: AlertLogEntry[] = [];

    const push = (tipo: AlertType, mensagem: string, valor: string) => {
      if (now - lastSentRef.current[tipo] < COOLDOWN_MS) return;
      lastSentRef.current[tipo] = now;
      novos.push({
        id: `${tipo}-${now}-${Math.random().toString(36).slice(2, 7)}`,
        tipo,
        mensagem,
        valor,
        timestamp: latest.created_at ?? new Date().toISOString(),
      });
    };

    if (latest.temperatura > TEMP_CRITICA) {
      push('temperatura', `Temperatura crítica (>${TEMP_CRITICA}°C)`, `${latest.temperatura.toFixed(1)} °C`);
    }

    if (latest.umidade > UMI_CRITICA) {
      push('umidade', `Umidade crítica (>${UMI_CRITICA}%)`, `${latest.umidade.toFixed(0)} %`);
    }

    if (latest.presenca) {
      push('presenca', 'Presença detectada em zona crítica', 'Movimento < 3m');
    }

    if (novos.length) {
      setEntries((prev) => {
        const merged = [...novos, ...prev].slice(0, MAX_ENTRIES);
        saveLog(merged);
        return merged;
      });
    }
  }, [latest]);

  const clear = () => {
    setEntries([]);
    saveLog([]);
  };

  return { entries, clear };
}
