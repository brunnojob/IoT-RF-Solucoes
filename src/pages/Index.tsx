/**
 * Index.tsx — Página principal do Dashboard IoT
 * 
 * Exibe dados de sensores em tempo real com:
 * - Cards de temperatura, umidade, presença e estoque
 * - Gráfico histórico de temperatura e umidade
 * - Tabela dos últimos registros
 * - Indicador de conexão em tempo real
 * 
 * Os dados são simulados. Para produção, integre com Supabase Realtime.
 */

import { Thermometer, Droplets, Package } from 'lucide-react';
import { useIoTData } from '@/hooks/useIoTData';
import { SensorCard } from '@/components/iot/SensorCard';
import { PresenceCard } from '@/components/iot/PresenceCard';
import { ConnectionIndicator } from '@/components/iot/ConnectionIndicator';
import { HistoryChart } from '@/components/iot/HistoryChart';
import { ReadingsTable } from '@/components/iot/ReadingsTable';

const Index = () => {
  // Hook que gerencia os dados IoT (simulados ou Supabase)
  const { readings, latestReading, isConnected } = useIoTData();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* === CABEÇALHO === */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Painel de Monitoramento IoT
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoramento empresarial em tempo real — Arduino/ESP32
            </p>
          </div>
          <ConnectionIndicator connected={isConnected} />
        </header>

        {/* === CARDS DE SENSORES === */}
        {/* Grid responsivo: 1 coluna mobile, 2 tablet, 4 desktop */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card de Temperatura */}
          <SensorCard
            title="Temperatura"
            value={latestReading?.temperatura ?? '--'}
            unit="°C"
            icon={<Thermometer className="w-4 h-4" />}
            variant="primary"
          />

          {/* Card de Umidade */}
          <SensorCard
            title="Umidade"
            value={latestReading?.umidade ?? '--'}
            unit="%"
            icon={<Droplets className="w-4 h-4" />}
            variant="accent"
          />

          {/* Card de Presença */}
          <PresenceCard detected={latestReading?.presenca ?? false} />

          {/* Card de Estoque */}
          <SensorCard
            title="Estoque"
            value={latestReading?.estoque ?? '--'}
            unit="un"
            icon={<Package className="w-4 h-4" />}
            variant="warning"
          />
        </section>

        {/* === GRÁFICO HISTÓRICO === */}
        <section>
          <HistoryChart readings={readings} />
        </section>

        {/* === TABELA DE REGISTROS === */}
        <section>
          <ReadingsTable readings={readings} />
        </section>

        {/* === RODAPÉ === */}
        <footer className="text-center text-xs text-muted-foreground py-4 border-t border-border">
          Dashboard IoT — Dados simulados para demonstração.
          Integre com Supabase Realtime e ESP32 para produção.
        </footer>
      </div>
    </div>
  );
};

export default Index;
