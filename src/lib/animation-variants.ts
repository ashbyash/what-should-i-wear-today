import type { TargetAndTransition, Transition } from 'framer-motion';

// 공통 애니메이션 variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
} as const;

export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

// 날씨별 이모지 애니메이션 설정
export const weatherAnimations: Record<string, { animate: TargetAndTransition; transition: Transition }> = {
  clear: {
    animate: { rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  clouds: {
    animate: { x: [-3, 3, -3], opacity: [0.9, 1, 0.9] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  rain: {
    animate: { y: [0, 3, 0] },
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
  },
  drizzle: {
    animate: { y: [0, 2, 0], opacity: [0.8, 1, 0.8] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  thunderstorm: {
    animate: { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  snow: {
    animate: { y: [0, 5, 0], rotate: [0, 180, 360] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  mist: {
    animate: { opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  default: {
    animate: { scale: [1, 1.02, 1] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};
