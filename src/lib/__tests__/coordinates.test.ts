import { describe, it, expect } from 'vitest';
import { toGridCoordinate, toTMCoordinate } from '../coordinates';

describe('toGridCoordinate', () => {
  it('converts Seoul coordinates to known grid values (60, 127)', () => {
    const result = toGridCoordinate(37.5665, 126.978);
    expect(result.nx).toBe(60);
    expect(result.ny).toBe(127);
  });

  it('converts Busan coordinates to known grid values (98, 76)', () => {
    const result = toGridCoordinate(35.1796, 129.0756);
    expect(result.nx).toBe(98);
    expect(result.ny).toBe(76);
  });

  it('returns integer values for nx and ny', () => {
    const result = toGridCoordinate(37.5665, 126.978);
    expect(Number.isInteger(result.nx)).toBe(true);
    expect(Number.isInteger(result.ny)).toBe(true);
  });

  it('converts Jeju coordinates to valid range', () => {
    const result = toGridCoordinate(33.4996, 126.5312);
    expect(result.nx).toBeGreaterThan(40);
    expect(result.nx).toBeLessThan(80);
    expect(result.ny).toBeGreaterThan(20);
    expect(result.ny).toBeLessThan(50);
  });
});

describe('toTMCoordinate', () => {
  it('converts Seoul coordinates to TM values in expected range', () => {
    const result = toTMCoordinate(37.5665, 126.978);
    expect(result.tmX).toBeGreaterThan(190000);
    expect(result.tmX).toBeLessThan(210000);
    expect(result.tmY).toBeGreaterThan(440000);
    expect(result.tmY).toBeLessThan(460000);
  });

  it('returns numeric non-NaN values', () => {
    const result = toTMCoordinate(37.5665, 126.978);
    expect(typeof result.tmX).toBe('number');
    expect(typeof result.tmY).toBe('number');
    expect(Number.isNaN(result.tmX)).toBe(false);
    expect(Number.isNaN(result.tmY)).toBe(false);
  });
});
