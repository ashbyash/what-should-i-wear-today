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

export function getThemeColors(isLight: boolean): ThemeColors {
  return {
    primary: isLight ? 'text-slate-900' : 'text-glass-primary',
    secondary: isLight ? 'text-slate-700' : 'text-glass-secondary',
    muted: isLight ? 'text-slate-500' : 'text-glass-muted',
    border: isLight ? 'border-black/10' : 'border-white/10',
    borderStrong: isLight ? 'border-black/20' : 'border-white/20',
    bg: isLight ? 'bg-black/5' : 'bg-white/10',
    bgStrong: isLight ? 'bg-black/10' : 'bg-white/15',
    hoverBg: isLight ? 'hover:bg-black/10' : 'hover:bg-white/10',
    activeBg: isLight ? 'active:bg-black/15' : 'active:bg-white/20',
    focusRing: isLight ? 'focus:ring-black/20' : 'focus:ring-white/30',
  };
}
