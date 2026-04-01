/**
 * PresenceCard.tsx
 * 
 * Card especial para exibir o status do sensor de presença.
 * Mostra "Presença detectada" ou "Sem presença" com indicadores visuais.
 */

import { Eye, EyeOff } from 'lucide-react';

interface PresenceCardProps {
  detected: boolean;
}

export function PresenceCard({ detected }: PresenceCardProps) {
  return (
    <div className={`bg-card rounded-lg border p-5 transition-all duration-300 ${
      detected 
        ? 'border-success/30 glow-success' 
        : 'border-border'
    }`}>
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-3">
        {detected ? (
          <Eye className="w-4 h-4 text-success" />
        ) : (
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Sensor de Presença
        </span>
      </div>

      {/* Status com indicador visual pulsante */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          detected ? 'bg-success animate-pulse' : 'bg-muted-foreground'
        }`} />
        <span className={`text-lg font-semibold ${
          detected ? 'text-success' : 'text-muted-foreground'
        }`}>
          {detected ? 'Presença detectada' : 'Sem presença'}
        </span>
      </div>
    </div>
  );
}
