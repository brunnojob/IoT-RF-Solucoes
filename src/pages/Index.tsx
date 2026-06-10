import { Thermometer, Droplets, Activity, LogOut } from 'lucide-react';
import { useIoTData } from '@/hooks/useIoTData';
import { useAuth } from '@/contexts/AuthContext';
import { useSmsAlerts } from '@/hooks/useSmsAlerts';
import { Button } from '@/components/ui/button';
import { SensorCard } from '@/components/iot/SensorCard';
import { PresenceCard } from '@/components/iot/PresenceCard';
import { ConnectionIndicator } from '@/components/iot/ConnectionIndicator';
import { HistoryChart } from '@/components/iot/HistoryChart';
import { ReadingsTable } from '@/components/iot/ReadingsTable';
import { SensorInfoSection } from '@/components/iot/SensorInfoSection';
import { AlertsLogSection } from '@/components/iot/AlertsLogSection';
import { useAlertsLog } from '@/hooks/useAlertsLog';

const Index = () => {
  const { readings, latestReading, isConnected } = useIoTData();
  const { logout } = useAuth();
  const { entries: alertEntries } = useAlertsLog(latestReading);

  // Dispara SMS via Twilio quando os limites são ultrapassados
  useSmsAlerts(latestReading);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel de Monitoramento IoT</h1>
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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </section>

        <section>
          <HistoryChart readings={readings} />
        </section>

        <section>
          <SensorInfoSection latestReading={latestReading} />
        </section>

        <section>
          <AlertsLogSection entries={alertEntries} />
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
