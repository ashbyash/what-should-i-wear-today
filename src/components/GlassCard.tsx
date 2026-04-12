'use client';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'outer' | 'inner';
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  variant = 'outer',
  className = '',
  onClick,
}: GlassCardProps) {
  const isOuter = variant === 'outer';

  const styles: React.CSSProperties = {
    background: isOuter ? 'var(--glass-bg-outer)' : 'var(--glass-bg-inner)',
    border: `1px solid ${isOuter ? 'var(--glass-border-outer)' : 'var(--glass-border-inner)'}`,
    borderRadius: isOuter ? 'var(--glass-radius-outer)' : 'var(--glass-radius-inner)',
    padding: isOuter ? 'var(--layout-card-padding-outer)' : 'var(--layout-card-padding-inner)',
    ...(isOuter ? {
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
      boxShadow: 'var(--glass-shadow), var(--glass-glow)',
    } : {}),
  };

  return (
    <div className={className} style={styles} onClick={onClick}>
      {children}
    </div>
  );
}

export function GlassInner({
  children,
  className = '',
}: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard variant="inner" className={className}>
      {children}
    </GlassCard>
  );
}
