'use client';

import { useMemo } from 'react';
import { getTimeOfDay, TIME_GRADIENTS, TIME_TEXT_COLORS } from '@/lib/theme';

interface TimeBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function TimeBackground({ children, className = '' }: TimeBackgroundProps) {
  const { gradientStyle, isLight } = useMemo(() => {
    const timeOfDay = getTimeOfDay();
    const gradient = TIME_GRADIENTS[timeOfDay];
    return {
      gradientStyle: { background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})` },
      isLight: TIME_TEXT_COLORS[timeOfDay].isLight,
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      data-theme="dark"
      style={gradientStyle}
    >
      {isLight && (
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
