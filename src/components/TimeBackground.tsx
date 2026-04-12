'use client';

import { useMemo } from 'react';
import { getTimeOfDay, TIME_GRADIENTS } from '@/lib/theme';
import { useClientHour } from '@/lib/useClientHour';

interface TimeBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function TimeBackground({ children, className = '' }: TimeBackgroundProps) {
  const clientHour = useClientHour();
  const gradientStyle = useMemo(() => {
    const timeOfDay = getTimeOfDay(clientHour);
    const gradient = TIME_GRADIENTS[timeOfDay];
    return { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})` };
  }, [clientHour]);

  return (
    <div
      className={`relative ${className}`}
      data-theme="dark"
      style={gradientStyle}
    >
      {children}
    </div>
  );
}
