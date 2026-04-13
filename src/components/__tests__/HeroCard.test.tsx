import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { makeWeatherData, makeOutingScore } from '@/lib/__tests__/helpers/factories';

const mockUseAIMessage = vi.fn();

// Mock framer-motion — cache components to avoid remount on every render
const motionCache = new Map<string, React.ComponentType<Record<string, unknown>>>();
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  m: new Proxy({} as Record<string, unknown>, {
    get: (_target: unknown, tag: string) => {
      if (!motionCache.has(tag)) {
        const Comp = React.forwardRef(function MotionMock(
          props: Record<string, unknown>,
          ref: React.Ref<unknown>
        ) {
          const filtered = Object.fromEntries(
            Object.entries(props).filter(([key]) =>
              !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants', 'layout'].includes(key)
            )
          );
          return React.createElement(tag as string, { ...filtered, ref });
        });
        motionCache.set(tag, Comp as unknown as React.ComponentType<Record<string, unknown>>);
      }
      return motionCache.get(tag);
    },
  }),
}));

// Mock GlassCard
vi.mock('../GlassCard', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-card', className }, children),
  GlassInner: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-inner', className }, children),
}));

// Mock useAIMessage with per-test control
vi.mock('@/lib/useAIMessage', () => ({
  useAIMessage: (...args: unknown[]) => mockUseAIMessage(...args),
}));

import HeroCard from '../HeroCard';

describe('HeroCard', () => {
  const defaultProps = {
    locationName: '서울 강남구',
    weather: makeWeatherData({ temperature: 22, feelsLike: 20, weatherMain: 'Clear' }),
    score: makeOutingScore({ total: 85, level: 'excellent', message: '좋은 날씨!' }),
  };

  beforeEach(() => {
    mockUseAIMessage.mockReturnValue({ message: null, isLoading: false });
  });

  it('renders location name', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('서울 강남구')).toBeInTheDocument();
  });

  it('renders temperature', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('22°')).toBeInTheDocument();
  });

  it('renders feels-like temperature', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('체감 20°')).toBeInTheDocument();
  });

  it('renders score total', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders weather label in Korean', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('맑음')).toBeInTheDocument();
  });

  it('renders AI message when weatherContext is provided', () => {
    mockUseAIMessage.mockReturnValue({ message: '오늘 외출하기 좋아요!', isLoading: false });
    render(<HeroCard {...defaultProps} weatherContext={{ temperature: 22, feelsLike: 20, weatherMain: 'Clear', pm25: 10 }} />);
    expect(screen.getByText('오늘 외출하기 좋아요!')).toBeInTheDocument();
  });

  it('renders fallback message when no weatherContext', () => {
    render(<HeroCard {...defaultProps} />);
    expect(screen.getByText('좋은 날씨!')).toBeInTheDocument();
  });
});
