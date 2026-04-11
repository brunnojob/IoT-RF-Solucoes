import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionIndicatorProps {
  connected: boolean;
}

export function ConnectionIndicator({ connected }: ConnectionIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      connected
        ? 'bg-success/10 text-success'
        : 'bg-destructive/10 text-destructive'
    }`}>
      {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      <div className={`w-2 h-2 rounded-full ${
        connected ? 'bg-success animate-pulse' : 'bg-destructive'
      }`} />
      <span>{connected ? 'Conectado' : 'Desconectado'}</span>
    </div>
  );
}