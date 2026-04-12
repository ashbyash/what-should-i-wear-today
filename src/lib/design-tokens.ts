// Design System Tokens — JS constants for framer-motion and runtime use

// Spring presets for framer-motion
export const SPRING = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 14 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
} as const;

// Duration tokens (seconds) — mirrors CSS variables for JS usage
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  pulse: 1.5,
} as const;

// Easing tokens — mirrors CSS variables for JS usage
export const EASING = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.45, 0, 0.55, 1] as [number, number, number, number],
} as const;

// Stagger step (seconds)
export const STAGGER_STEP = 0.08;

// Score bar gradient thresholds and colors
export const SCORE_GRADIENTS = {
  good: { threshold: 70, gradient: 'linear-gradient(90deg, #34d399, #4ade80)' },
  moderate: { threshold: 40, gradient: 'linear-gradient(90deg, #fbbf24, #facc15)' },
  bad: { threshold: 0, gradient: 'linear-gradient(90deg, #fb923c, #f87171)' },
} as const;

// Status color hex values for inline style usage
export const STATUS_COLORS = {
  good: '#4ade80',
  moderate: '#fbbf24',
  bad: '#f87171',
} as const;

export function getScoreGradient(percentage: number): string {
  if (percentage >= SCORE_GRADIENTS.good.threshold) return SCORE_GRADIENTS.good.gradient;
  if (percentage >= SCORE_GRADIENTS.moderate.threshold) return SCORE_GRADIENTS.moderate.gradient;
  return SCORE_GRADIENTS.bad.gradient;
}
