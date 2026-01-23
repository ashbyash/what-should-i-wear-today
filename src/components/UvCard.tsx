'use client';

import { motion } from 'framer-motion';

interface UvCardProps {
  uvIndex?: number;
}

function getUvLabel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

function getUvColor(uvIndex: number): string {
  if (uvIndex <= 2) return 'text-white';
  if (uvIndex <= 5) return 'text-white';
  if (uvIndex <= 7) return 'text-amber-300';
  if (uvIndex <= 10) return 'text-orange-300';
  return 'text-rose-300';
}

function getUvIcon(uvIndex: number): string {
  if (uvIndex <= 2) return '😎';
  if (uvIndex <= 5) return '🧴';
  if (uvIndex <= 7) return '🧢';
  if (uvIndex <= 10) return '⚠️';
  return '🚫';
}

function getUvDescription(uvIndex: number): string {
  if (uvIndex <= 2) return '자외선 걱정 없어요';
  if (uvIndex <= 5) return '외출 시 선크림 권장';
  if (uvIndex <= 7) return '선크림 필수, 모자 권장';
  if (uvIndex <= 10) return '한낮 외출 자제, 선크림 필수';
  return '외출 자제, 피부 노출 최소화';
}

function getUvRange(uvIndex: number): string {
  if (uvIndex <= 2) return '0~2';
  if (uvIndex <= 5) return '3~5';
  if (uvIndex <= 7) return '6~7';
  if (uvIndex <= 10) return '8~10';
  return '11↑';
}

function getUvLevel(uvIndex: number): number {
  if (uvIndex <= 2) return 0;
  if (uvIndex <= 5) return 1;
  if (uvIndex <= 7) return 2;
  if (uvIndex <= 10) return 3;
  return 4;
}

const UV_LEVELS = [
  { label: '낮음', color: 'bg-emerald-400' },
  { label: '보통', color: 'bg-sky-300' },
  { label: '높음', color: 'bg-amber-400' },
  { label: '매우높음', color: 'bg-orange-400' },
  { label: '위험', color: 'bg-rose-400' },
];

export default function UvCard({ uvIndex }: UvCardProps) {
  const label = uvIndex !== undefined ? getUvLabel(uvIndex) : '정보 없음';
  const description = uvIndex !== undefined ? getUvDescription(uvIndex) : '';

  return (
    <div
      className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full"
      role="region"
      aria-label={`자외선 ${label}${uvIndex !== undefined ? `. 지수 ${uvIndex}. ${description}` : ''}`}
    >
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl" aria-hidden="true">☀️</div>
        <h4 className="text-label text-glass-muted">자외선</h4>
        {uvIndex !== undefined ? (
          <>
            <div className={`text-heading-1 ${getUvColor(uvIndex)} flex items-center gap-1`}>
              <span aria-hidden="true">{getUvIcon(uvIndex)}</span>
              <span>{getUvLabel(uvIndex)}</span>
            </div>
            <div className="text-caption text-glass-secondary">지수: {uvIndex}</div>
            <div className="text-xs text-glass-muted mt-1">
              {getUvDescription(uvIndex)}
            </div>
            <div className="text-xs text-glass-muted mt-0.5">
              ({getUvLabel(uvIndex)} 기준: {getUvRange(uvIndex)})
            </div>

            {/* 등급 인디케이터 */}
            <div className="flex gap-1.5 mt-2" aria-hidden="true">
              {UV_LEVELS.map((level, i) => (
                <motion.div
                  key={level.label}
                  className={`w-2 h-2 rounded-full ${
                    i <= getUvLevel(uvIndex) ? level.color : 'bg-white/20'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 500 }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-body text-glass-muted">정보 없음</div>
        )}
      </div>
    </div>
  );
}
