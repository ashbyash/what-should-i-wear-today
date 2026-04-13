import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock GlassCard
vi.mock('../GlassCard', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-card', className }, children),
  GlassInner: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-inner', className }, children),
}));

import WeatherModule from '../WeatherModule';

describe('WeatherModule', () => {
  it('renders icon, label, value, and description', () => {
    render(
      <WeatherModule
        icon="💨"
        label="미세먼지"
        value="15"
        unit="㎍/㎥"
        description="좋음"
      />
    );
    expect(screen.getByText('💨')).toBeInTheDocument();
    expect(screen.getByText('미세먼지')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('㎍/㎥')).toBeInTheDocument();
    expect(screen.getByText('좋음')).toBeInTheDocument();
  });

  it('renders without unit when not provided', () => {
    render(
      <WeatherModule
        icon="☀️"
        label="자외선"
        value="3"
        description="보통"
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('㎍/㎥')).not.toBeInTheDocument();
  });

  it('applies custom color to value', () => {
    render(
      <WeatherModule
        icon="💨"
        label="미세먼지"
        value="80"
        description="매우 나쁨"
        color="#f87171"
      />
    );
    const valueEl = screen.getByText('80');
    expect(valueEl).toHaveStyle({ color: '#f87171' });
  });

  it('uses default color when no color prop', () => {
    render(
      <WeatherModule
        icon="💧"
        label="습도"
        value="55"
        unit="%"
        description="적정"
      />
    );
    const valueEl = screen.getByText('55');
    expect(valueEl).toHaveStyle({ color: 'var(--text-primary)' });
  });
});
