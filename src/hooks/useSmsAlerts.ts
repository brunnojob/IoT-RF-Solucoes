import { useEffect, useRef } from 'react';
import { supabase as cloudSupabase } from '@/integrations/supabase/client';
import { SensorReading } from './useIoTData';
import { toast } from '@/hooks/use-toast';

const TEMP_MIN = 22;
const TEMP_MAX = 30;
const UMI_MIN = 20;
const UMI_MAX = 70;
const COOLDOWN_MS = 60_000;

type AlertKind = 'presenca' | 'temperatura' | 'umidade';

export function useSmsAlerts(latest: SensorReading | null) {
  const lastSentRef = useRef<Record<AlertKind, number>>({
    presenca: 0,
    temperatura: 0,
    umidade: 0,
  });

  useEffect(() => {
    if (!latest) return;
    const now = Date.now();
    const alerts: { kind: AlertKind; message: string }[] = [];

    if (latest.presenca && now - lastSentRef.current.presenca > COOLDOWN_MS) {
      alerts.push({
        kind: 'presenca',
        message: `ALERTA PRESENCA: movimento detectado em zona critica. Temp ${latest.temperatura.toFixed(1)}C / Umid ${latest.umidade.toFixed(0)}%`,
      });
    }
    if ((latest.temperatura > TEMP_MAX || latest.temperatura < TEMP_MIN) &&
        now - lastSentRef.current.temperatura > COOLDOWN_MS) {
      alerts.push({
        kind: 'temperatura',
        message: `ALERTA TEMPERATURA: ${latest.temperatura.toFixed(1)}C (faixa ${TEMP_MIN}-${TEMP_MAX}C)`,
      });
    }
    if ((latest.umidade > UMI_MAX || latest.umidade < UMI_MIN) &&
        now - lastSentRef.current.umidade > COOLDOWN_MS) {
      alerts.push({
        kind: 'umidade',
        message: `ALERTA UMIDADE: ${latest.umidade.toFixed(0)}% (faixa ${UMI_MIN}-${UMI_MAX}%)`,
      });
    }

    if (!alerts.length) return;

    const dataHora = new Date(latest.created_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    alerts.forEach(async ({ kind, message }) => {
      lastSentRef.current[kind] = now;
      const fullMessage = `SISTEMA RF - ${message} - ${dataHora}`;
      try {
        const { error } = await cloudSupabase.functions.invoke('send-sms-alert', {
          body: { message: fullMessage, kind },
        });
        if (error) throw error;
        toast({ title: '📲 SMS enviado', description: `Alerta de ${kind} disparado via Twilio.` });
      } catch (e: any) {
        console.error('Erro ao enviar SMS:', e);
        toast({
          title: '❌ Falha no SMS',
          description: e.message ?? 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    });
  }, [latest]);
}
