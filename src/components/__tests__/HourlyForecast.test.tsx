import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { makeHourlyForecastItem } from '@/lib/__tests__/helpers/factories';

// Mock GlassCard
vi.mock('../GlassCard', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-card', className }, children),
  GlassInner: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-inner', className }, children),
}));

// Mock weather-utils
vi.mock('@/lib/weather-utils', () => ({
  getWeatherEmoji: (weatherMain: string) => {
    if (weatherMain === 'Clear') return '☀️';
    if (weatherMain === 'Rain') return '🌧️';
    return '🌤️';
  },
  getTimeCategoryForHour: () => 'day',
}));

import HourlyForecast from '../HourlyForecast';

describe('HourlyForecast', () => {
  it('renders time and temperature for each item', () => {
    const data = [
      makeHourlyForecastItem({ time: '15:00', temperature: 22, weatherMain: 'Clear' }),
      makeHourlyForecastItem({ time: '16:00', temperature: 21, weatherMain: 'Clear' }),
      makeHourlyForecastItem({ time: '17:00', temperature: 19, weatherMain: 'Rain' }),
    ];
    render(<HourlyForecast data={data} loading={false} />);

    expect(screen.getByText('지금')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();

    expect(screen.getByText('22°')).toBeInTheDocument();
    expect(screen.getByText('21°')).toBeInTheDocument();
    expect(screen.getByText('19°')).toBeInTheDocument();
  });

  it('renders nothing when data is null', () => {
    const { container } = render(<HourlyForecast data={null} loading={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when data is empty array', () => {
    const { container } = render(<HourlyForecast data={[]} loading={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows skeleton when loading', () => {
    render(<HourlyForecast data={null} loading={true} />);
    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
  });

  it('renders precipitation probability when > 0', () => {
    const data = [
      makeHourlyForecastItem({ time: '15:00', temperature: 18, weatherMain: 'Rain', precipitationProbability: 70 }),
    ];
    render(<HourlyForecast data={data} loading={false} />);
    expect(screen.getByText(/70%/)).toBeInTheDocument();
  });
});
