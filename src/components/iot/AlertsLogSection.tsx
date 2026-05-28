import { AlertTriangle, Thermometer, Droplets, ShieldX, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertLogEntry, AlertType } from '@/hooks/useAlertsLog';

interface AlertsLogSectionProps {
  entries: AlertLogEntry[];
  onClear: () => void;
}

const TZ = 'America/Sao_Paulo';

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { timeZone: TZ });
}
function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: TZ });
}
function fmtDia(iso: string) {
  const d = new Date(iso).toLocaleDateString('pt-BR', { timeZone: TZ, weekday: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

const iconFor = (tipo: AlertType) => {
  if (tipo === 'temperatura') return Thermometer;
  if (tipo === 'umidade') return Droplets;
  return ShieldX;
};

export function AlertsLogSection({ entries, onClear }: AlertsLogSectionProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Registros de Alertas Críticos · SMS
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground ml-1">
            (Horário de Brasília · RJ)
          </span>
        </div>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpar
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Nenhum alerta crítico registrado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase border-b border-border">
                <th className="py-2 px-2 font-medium">Tipo</th>
                <th className="py-2 px-2 font-medium">Alerta</th>
                <th className="py-2 px-2 font-medium">Valor</th>
                <th className="py-2 px-2 font-medium">Dia</th>
                <th className="py-2 px-2 font-medium">Data</th>
                <th className="py-2 px-2 font-medium">Hora</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const Icon = iconFor(e.tipo);
                return (
                  <tr key={e.id} className="border-b border-border/40 hover:bg-secondary/30">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5 text-destructive">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs uppercase font-medium">{e.tipo}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-foreground">{e.mensagem}</td>
                    <td className="py-2 px-2 font-mono text-xs text-destructive">{e.valor}</td>
                    <td className="py-2 px-2 text-xs text-primary font-medium">{fmtDia(e.timestamp)}</td>
                    <td className="py-2 px-2 font-mono text-xs text-muted-foreground">{fmtData(e.timestamp)}</td>
                    <td className="py-2 px-2 font-mono text-xs text-foreground font-semibold">{fmtHora(e.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
