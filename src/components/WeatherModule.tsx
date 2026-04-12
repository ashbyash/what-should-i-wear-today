'use client';

import { GlassInner } from './GlassCard';

interface WeatherModuleProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  description: string;
  color?: string;
}

export default function WeatherModule({
  icon,
  label,
  value,
  unit,
  description,
  color,
}: WeatherModuleProps) {
  return (
    <GlassInner className="flex flex-col gap-2">
      {/* Header: icon + label */}
      <div className="flex items-center gap-1.5">
        <span className="text-[13px]" aria-hidden="true">{icon}</span>
        <span className="text-module-label text-skin-muted uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Value */}
      <div>
        <span
          className="text-[24px] font-light leading-none"
          style={color ? { color } : { color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-body text-skin-muted ml-1">{unit}</span>
        )}
      </div>

      {/* Description */}
      <span className="text-caption text-skin-muted">{description}</span>
    </GlassInner>
  );
}
