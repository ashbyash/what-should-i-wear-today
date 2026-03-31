'use client';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'outer' | 'inner';
  isLight?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  variant = 'outer',
  isLight = false,
  className = '',
  onClick,
}: GlassCardProps) {
  const styles = variant === 'outer'
    ? {
        background: isLight ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.15)',
        border: isLight ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.2)',
      }
    : {
        background: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
        border: isLight ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.15)',
      };

  const radius = variant === 'outer' ? 'rounded-[18px]' : 'rounded-xl';
  const padding = variant === 'outer' ? 'p-5' : 'p-3';
  const blur = variant === 'outer' ? 'backdrop-blur-[20px]' : '';

  return (
    <div
      className={`${radius} ${padding} ${blur} ${className}`}
      style={styles}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function GlassInner({
  children,
  isLight = false,
  className = '',
}: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="inner" isLight={isLight} className={className}>
      {children}
    </GlassCard>
  );
}
