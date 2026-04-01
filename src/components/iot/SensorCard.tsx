/**
 * SensorCard.tsx
 * 
 * Card reutilizável para exibir um valor de sensor.
 * Usa tokens do design system para cores e estilos.
 */

import { ReactNode } from 'react';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
}

const variantClasses: Record<string, string> = {
  primary: 'border-primary/30 glow-primary',
  accent: 'border-accent/30 glow-warning',
  success: 'border-success/30 glow-success',
  warning: 'border-warning/30 glow-warning',
};

const valueClasses: Record<string, string> = {
  primary: 'text-data',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning-custom',
};

export function SensorCard({ title, value, unit, icon, variant = 'primary' }: SensorCardProps) {
  return (
    <div className={`bg-card rounded-lg border p-5 transition-all duration-300 ${variantClasses[variant]}`}>
      {/* Cabeçalho do card com ícone e título */}
      <div className="flex items-center gap-2 mb-3">
        <span className={valueClasses[variant]}>{icon}</span>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>

      {/* Valor principal do sensor */}
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold font-mono ${valueClasses[variant]}`}>
          {value}
        </span>
        {unit && (
          <span className="text-lg text-muted-foreground font-mono">{unit}</span>
        )}
      </div>
    </div>
  );
}
