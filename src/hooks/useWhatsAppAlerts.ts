import { useEffect, useRef } from 'react';
import { supabase as cloudSupabase } from '@/integrations/supabase/client';
import { SensorReading } from './useIoTData';
import { toast } from '@/hooks/use-toast';

const TEMP_MIN = 22;
const TEMP_MAX = 30;
const UMI_MIN = 20;
const UMI_MAX = 70;
const COOLDOWN_MS = 60_000; // 1 min entre alertas do mesmo tipo

type AlertKind = 'presenca' | 'temperatura' | 'umidade';

export function useWhatsAppAlerts(latest: SensorReading | null) {
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
        message: `🚨 *ALERTA DE PRESENÇA CRÍTICO!*\n\nMovimento detectado na zona crítica.\n\nTemperatura: ${latest.temperatura.toFixed(1)}°C\nUmidade: ${latest.umidade.toFixed(0)}%`,
      });
    }

    if ((latest.temperatura > TEMP_MAX || latest.temperatura < TEMP_MIN) &&
        now - lastSentRef.current.temperatura > COOLDOWN_MS) {
      alerts.push({
        kind: 'temperatura',
        message: `🌡️ *ALERTA DE TEMPERATURA!*\n\nValor atual: *${latest.temperatura.toFixed(1)}°C*\nFaixa tolerada: ${TEMP_MIN}°C a ${TEMP_MAX}°C`,
      });
    }

    if ((latest.umidade > UMI_MAX || latest.umidade < UMI_MIN) &&
        now - lastSentRef.current.umidade > COOLDOWN_MS) {
      alerts.push({
        kind: 'umidade',
        message: `💧 *ALERTA DE UMIDADE!*\n\nValor atual: *${latest.umidade.toFixed(0)}%*\nFaixa tolerada: ${UMI_MIN}% a ${UMI_MAX}%`,
      });
    }

    if (alerts.length === 0) return;

    const dataHora = new Date(latest.created_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    alerts.forEach(async ({ kind, message }) => {
      lastSentRef.current[kind] = now;
      const fullMessage = `*SISTEMA DE SEGURANÇA - RF*\n\n${message}\n\n📅 ${dataHora}`;

      try {
        const { error } = await cloudSupabase.functions.invoke('send-whatsapp-alert', {
          body: { message: fullMessage, kind },
        });
        if (error) throw error;
        toast({ title: '📱 WhatsApp enviado', description: `Alerta de ${kind} disparado.` });
      } catch (e: any) {
        console.error('Erro ao enviar WhatsApp:', e);
        toast({
          title: '❌ Falha no WhatsApp',
          description: e.message ?? 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    });
  }, [latest]);
}
