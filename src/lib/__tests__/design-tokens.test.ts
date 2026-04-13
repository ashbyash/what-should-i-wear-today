import { describe, it, expect } from 'vitest';
import {
  getScoreGradient,
  SCORE_GRADIENTS,
  STATUS_COLORS,
  SPRING,
  DURATION,
  EASING,
  STAGGER_STEP,
} from '../design-tokens';

describe('getScoreGradient', () => {
  it('returns good gradient for percentage >= 70', () => {
    expect(getScoreGradient(70)).toBe(SCORE_GRADIENTS.good.gradient);
    expect(getScoreGradient(100)).toBe(SCORE_GRADIENTS.good.gradient);
  });

  it('returns moderate gradient for percentage >= 40 and < 70', () => {
    expect(getScoreGradient(40)).toBe(SCORE_GRADIENTS.moderate.gradient);
    expect(getScoreGradient(69)).toBe(SCORE_GRADIENTS.moderate.gradient);
  });

  it('returns bad gradient for percentage < 40', () => {
    expect(getScoreGradient(0)).toBe(SCORE_GRADIENTS.bad.gradient);
    expect(getScoreGradient(39)).toBe(SCORE_GRADIENTS.bad.gradient);
  });

  it('handles boundary value 69.999 as moderate', () => {
    expect(getScoreGradient(69.999)).toBe(SCORE_GRADIENTS.moderate.gradient);
  });
});

describe('design token constants', () => {
  it('STATUS_COLORS has good, moderate, bad keys', () => {
    expect(STATUS_COLORS).toHaveProperty('good');
    expect(STATUS_COLORS).toHaveProperty('moderate');
    expect(STATUS_COLORS).toHaveProperty('bad');
  });

  it('SPRING has gentle and bouncy presets', () => {
    expect(SPRING.gentle.type).toBe('spring');
    expect(SPRING.bouncy.type).toBe('spring');
  });

  it('DURATION values are positive numbers', () => {
    expect(DURATION.fast).toBeGreaterThan(0);
    expect(DURATION.normal).toBeGreaterThan(0);
    expect(DURATION.slow).toBeGreaterThan(0);
    expect(DURATION.pulse).toBeGreaterThan(0);
  });

  it('EASING arrays have 4 elements', () => {
    expect(EASING.out).toHaveLength(4);
    expect(EASING.inOut).toHaveLength(4);
  });

  it('STAGGER_STEP is a positive number', () => {
    expect(STAGGER_STEP).toBeGreaterThan(0);
  });
});
