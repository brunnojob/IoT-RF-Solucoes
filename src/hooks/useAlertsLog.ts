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

const TEMP_MIN = 22;
const TEMP_MAX = 30;
const UMI_MIN = 20;
const UMI_MAX = 70;

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

    if (latest.temperatura > TEMP_MAX) {
      push('temperatura', `Temperatura acima do limite (>${TEMP_MAX}°C)`, `${latest.temperatura.toFixed(1)} °C`);
    } else if (latest.temperatura < TEMP_MIN) {
      push('temperatura', `Temperatura abaixo do limite (<${TEMP_MIN}°C)`, `${latest.temperatura.toFixed(1)} °C`);
    }

    if (latest.umidade > UMI_MAX) {
      push('umidade', `Umidade acima do limite (>${UMI_MAX}%)`, `${latest.umidade.toFixed(0)} %`);
    } else if (latest.umidade < UMI_MIN) {
      push('umidade', `Umidade abaixo do limite (<${UMI_MIN}%)`, `${latest.umidade.toFixed(0)} %`);
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
