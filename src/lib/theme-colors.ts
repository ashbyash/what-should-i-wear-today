export interface ThemeColors {
  primary: string;
  secondary: string;
  muted: string;
  border: string;
  borderStrong: string;
  bg: string;
  bgStrong: string;
  hoverBg: string;
  activeBg: string;
  focusRing: string;
}

export function getThemeColors(_isLight?: boolean): ThemeColors {
  return {
    primary: 'text-glass-primary',
    secondary: 'text-glass-secondary',
    muted: 'text-glass-muted',
    border: 'border-white/10',
    borderStrong: 'border-white/20',
    bg: 'bg-white/10',
    bgStrong: 'bg-white/15',
    hoverBg: 'hover:bg-white/10',
    activeBg: 'active:bg-white/20',
    focusRing: 'focus:ring-white/30',
  };
}
