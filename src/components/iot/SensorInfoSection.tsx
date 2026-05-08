import { Activity, Thermometer, Droplets, ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';
import { SensorReading } from '@/hooks/useIoTData';

interface SensorInfoSectionProps {
  latestReading: SensorReading | null;
}

const TEMP_MIN = 22;
const TEMP_MAX = 30;
const UMI_MIN = 20;
const UMI_MAX = 70;

function formatHora(iso?: string) {
  if (!iso) return '--:--:--';
  return new Date(iso).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function formatData(iso?: string) {
  if (!iso) return '--/--/----';
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function SensorInfoSection({ latestReading }: SensorInfoSectionProps) {
  const temp = latestReading?.temperatura;
  const umi = latestReading?.umidade;
  const presenca = latestReading?.presenca ?? false;

  const tempAlerta = temp !== undefined && (temp > TEMP_MAX || temp < TEMP_MIN);
  const umiAlerta = umi !== undefined && (umi > UMI_MAX || umi < UMI_MIN);

  const presencaStatus = presenca
    ? { label: 'ZONA CRÍTICA', icon: ShieldX, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' }
    : { label: 'ZONA SEGURA', icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };

  const PresIcon = presencaStatus.icon;

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Monitoramento em Tempo Real
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatData(latestReading?.created_at)}</span>
          <span className="text-foreground font-bold">{formatHora(latestReading?.created_at)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Presença */}
        <div className={`p-4 rounded-md border ${presencaStatus.border} ${presencaStatus.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <PresIcon className={`w-4 h-4 ${presencaStatus.color}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase">Presença</span>
          </div>
          <p className={`text-lg font-bold ${presencaStatus.color}`}>{presencaStatus.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {presenca ? 'Movimento detectado!' : 'Nenhum movimento'}
          </p>
        </div>

        {/* Temperatura */}
        <div className={`p-4 rounded-md border ${tempAlerta ? 'border-destructive/30 bg-destructive/10' : 'border-border bg-secondary/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className={`w-4 h-4 ${tempAlerta ? 'text-destructive' : 'text-primary'}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase">Temperatura</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${tempAlerta ? 'text-destructive' : 'text-foreground'}`}>
            {temp !== undefined ? temp.toFixed(1) : '--'}<span className="text-base text-muted-foreground"> °C</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {tempAlerta
              ? (temp! > TEMP_MAX ? `Acima do limite (>${TEMP_MAX}°C)` : `Abaixo do limite (<${TEMP_MIN}°C)`)
              : `Faixa OK (${TEMP_MIN}-${TEMP_MAX}°C)`}
          </p>
        </div>

        {/* Umidade */}
        <div className={`p-4 rounded-md border ${umiAlerta ? 'border-destructive/30 bg-destructive/10' : 'border-border bg-secondary/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className={`w-4 h-4 ${umiAlerta ? 'text-destructive' : 'text-primary'}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase">Umidade</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${umiAlerta ? 'text-destructive' : 'text-foreground'}`}>
            {umi !== undefined ? umi.toFixed(0) : '--'}<span className="text-base text-muted-foreground"> %</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {umiAlerta
              ? (umi! > UMI_MAX ? `Acima do limite (>${UMI_MAX}%)` : `Abaixo do limite (<${UMI_MIN}%)`)
              : `Faixa OK (${UMI_MIN}-${UMI_MAX}%)`}
          </p>
        </div>
      </div>

      {(tempAlerta || umiAlerta || presenca) && (
        <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive font-medium">
            Alerta ativo — notificação enviada ao WhatsApp dos responsáveis.
          </p>
        </div>
      )}
    </div>
  );
}
