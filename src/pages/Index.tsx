import { Thermometer, Droplets, Package, LogOut } from 'lucide-react';
import { useIoTData } from '@/hooks/useIoTData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEstoque } from '@/hooks/useEstoque';
import { SensorCard } from '@/components/iot/SensorCard';
import { PresenceCard } from '@/components/iot/PresenceCard';
import { ConnectionIndicator } from '@/components/iot/ConnectionIndicator';
import { HistoryChart } from '@/components/iot/HistoryChart';
import { ReadingsTable } from '@/components/iot/ReadingsTable';
import { EstoqueSection } from '@/components/iot/EstoqueSection';
import { MovimentacoesTable } from '@/components/iot/MovimentacoesTable';

const Index = () => {
  const { readings, latestReading, isConnected } = useIoTData();
  const { produtos, movimentacoes, loading, adicionarProduto, entradaEstoque, saidaEstoque } = useEstoque();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Painel de Monitoramento IoT
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoramento empresarial em tempo real — Arduino/ESP32
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionIndicator connected={isConnected} />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorCard
            title="Temperatura"
            value={latestReading?.temperatura ?? '--'}
            unit="°C"
            icon={<Thermometer className="w-4 h-4" />}
            variant="primary"
          />
          <SensorCard
            title="Umidade"
            value={latestReading?.umidade ?? '--'}
            unit="%"
            icon={<Droplets className="w-4 h-4" />}
            variant="accent"
          />
          <PresenceCard detected={latestReading?.presenca ?? false} />
          <SensorCard
            title="Estoque Total"
            value={produtos.reduce((sum, p) => sum + p.quantidade_atual, 0) || '--'}
            unit="un"
            icon={<Package className="w-4 h-4" />}
            variant="warning"
          />
        </section>

        <section>
          <HistoryChart readings={readings} />
        </section>

        <section>
          <EstoqueSection
            produtos={produtos}
            loading={loading}
            onAdicionarProduto={adicionarProduto}
            onEntrada={entradaEstoque}
            onSaida={saidaEstoque}
          />
        </section>

        <section>
          <MovimentacoesTable movimentacoes={movimentacoes} produtos={produtos} />
        </section>

        <section>
          <ReadingsTable readings={readings} />
        </section>

        <footer className="text-center text-xs text-muted-foreground py-4 border-t border-border">
          Dashboard IoT — Monitoramento Empresarial em Tempo Real
        </footer>
      </div>
    </div>
  );
};

export default Index;