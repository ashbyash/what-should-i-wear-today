import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CityData } from '@/lib/cities';

// Mock GlassCard
vi.mock('../GlassCard', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-card', className }, children),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) =>
    React.createElement('a', { href, className }, children),
}));

import CitiesTabs from '../CitiesTabs';

const makeCity = (name: string, slug: string): CityData => ({
  slug,
  name,
  nameEn: slug.charAt(0).toUpperCase() + slug.slice(1),
  lat: 37.5665,
  lon: 126.978,
  description: `${name} 설명`,
});

describe('CitiesTabs', () => {
  const domesticRegions: [string, CityData[]][] = [
    ['수도권', [makeCity('서울', 'seoul'), makeCity('인천', 'incheon')]],
    ['영남권', [makeCity('부산', 'busan')]],
  ];
  const overseasRegions: [string, CityData[]][] = [
    ['동남아', [makeCity('방콕', 'bangkok')]],
  ];

  const defaultProps = {
    domesticRegions,
    overseasRegions,
    domesticCount: 3,
    overseasCount: 1,
  };

  it('renders domestic and overseas tab buttons with counts', () => {
    render(<CitiesTabs {...defaultProps} />);
    expect(screen.getByText('국내 3')).toBeInTheDocument();
    expect(screen.getByText('해외 1')).toBeInTheDocument();
  });

  it('renders domestic city names by default', () => {
    render(<CitiesTabs {...defaultProps} />);
    expect(screen.getByText('서울')).toBeInTheDocument();
    expect(screen.getByText('인천')).toBeInTheDocument();
    expect(screen.getByText('부산')).toBeInTheDocument();
  });

  it('renders region headings', () => {
    render(<CitiesTabs {...defaultProps} />);
    expect(screen.getByText('수도권')).toBeInTheDocument();
    expect(screen.getByText('영남권')).toBeInTheDocument();
  });

  it('renders city links with correct href', () => {
    render(<CitiesTabs {...defaultProps} />);
    const seoulLink = screen.getByText('서울').closest('a');
    expect(seoulLink).toHaveAttribute('href', '/seoul');
  });
});
