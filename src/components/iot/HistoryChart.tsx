import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SensorReading } from '@/hooks/useIoTData';

interface HistoryChartProps {
  readings: SensorReading[];
}

export function HistoryChart({ readings }: HistoryChartProps) {
  const chartData = readings.map(r => ({
    hora: new Date(r.created_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    Temperatura: r.temperatura,
    Umidade: r.umidade,
  }));

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Histórico de Temperatura e Umidade
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
            <XAxis
              dataKey="hora"
              stroke="hsl(215 15% 50%)"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
            />
            <YAxis
              stroke="hsl(215 15% 50%)"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 25% 10%)',
                border: '1px solid hsl(220 20% 18%)',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(210 20% 90%)' }}
            />
            <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="Temperatura"
              stroke="hsl(185 80% 50%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Umidade"
              stroke="hsl(30 90% 55%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}