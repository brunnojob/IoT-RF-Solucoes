import { SensorReading } from '@/hooks/useIoTData';

interface ReadingsTableProps {
  readings: SensorReading[];
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  const recentReadings = [...readings].reverse().slice(0, 10);

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Últimos Registros
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Horário</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Temp (°C)</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Umid (%)</th>
              <th className="text-center py-2 px-3 text-muted-foreground font-medium">Presença</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {recentReadings.map((reading) => (
              <tr key={reading.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                  {new Date(reading.created_at).toLocaleTimeString('pt-BR')}
                </td>
                <td className="py-2 px-3 text-right font-mono text-data">
                  {reading.temperatura}
                </td>
                <td className="py-2 px-3 text-right font-mono text-accent">
                  {reading.umidade}
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    reading.presenca
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      reading.presenca ? 'bg-success' : 'bg-muted-foreground'
                    }`} />
                    {reading.presenca ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono text-warning-custom">
                  {reading.estoque}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}