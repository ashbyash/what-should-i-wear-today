import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { makeOutfitRecommendation } from '@/lib/__tests__/helpers/factories';

// Mock GlassCard
vi.mock('../GlassCard', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement('div', { 'data-testid': 'glass-card', className }, children),
}));

// Mock useAIStylingTip
vi.mock('@/lib/useAIStylingTip', () => ({
  useAIStylingTip: () => ({ tip: null, isLoading: false }),
}));

import OutfitCard from '../OutfitCard';

describe('OutfitCard', () => {
  it('renders category labels', () => {
    const outfit = makeOutfitRecommendation({
      categories: {
        top: ['면 반팔 티셔츠'],
        bottom: ['면 반바지'],
        shoes: ['샌들'],
      },
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.getByText('상의')).toBeInTheDocument();
    expect(screen.getByText('하의')).toBeInTheDocument();
    expect(screen.getByText('신발')).toBeInTheDocument();
  });

  it('renders item names within categories', () => {
    const outfit = makeOutfitRecommendation({
      categories: {
        top: ['면 반팔 티셔츠', '얇은 가디건'],
        bottom: ['청바지'],
      },
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.getByText('면 반팔 티셔츠, 얇은 가디건')).toBeInTheDocument();
    expect(screen.getByText('청바지')).toBeInTheDocument();
  });

  it('renders alerts when present', () => {
    const outfit = makeOutfitRecommendation({
      alerts: ['마스크 착용 권장', '일교차가 커요, 겉옷 챙기세요'],
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.getByText('마스크 착용 권장')).toBeInTheDocument();
    expect(screen.getByText('일교차가 커요, 겉옷 챙기세요')).toBeInTheDocument();
  });

  it('does not render empty categories', () => {
    const outfit = makeOutfitRecommendation({
      categories: {
        top: ['면 긴팔 티셔츠'],
        bottom: ['청바지'],
        outer: undefined,
        accessory: undefined,
      },
    });
    render(<OutfitCard outfit={outfit} />);
    expect(screen.queryByText('아우터')).not.toBeInTheDocument();
    expect(screen.queryByText('악세서리')).not.toBeInTheDocument();
  });
});
