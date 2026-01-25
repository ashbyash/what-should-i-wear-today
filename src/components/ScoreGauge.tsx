'use client';

import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import type { OutingScore } from '@/types/score';

interface ScoreGaugeProps {
  score: OutingScore;
}

function getScoreColor(level: OutingScore['level']): string {
  switch (level) {
    case 'perfect':
      return 'text-white';
    case 'excellent':
      return 'text-white';
    case 'good':
      return 'text-white/90';
    case 'fair':
      return 'text-white/80';
    case 'moderate':
      return 'text-amber-200';
    case 'poor':
      return 'text-orange-200';
    case 'bad':
      return 'text-rose-200';
  }
}

function getScoreEmoji(level: OutingScore['level']): string {
  switch (level) {
    case 'perfect':
      return '🤩';
    case 'excellent':
      return '😊';
    case 'good':
      return '🙂';
    case 'fair':
      return '😌';
    case 'moderate':
      return '😐';
    case 'poor':
      return '🙁';
    case 'bad':
      return '🏠';
  }
}

function getProgressColor(level: OutingScore['level']): string {
  switch (level) {
    case 'perfect':
      return '#34d399'; // emerald-400
    case 'excellent':
      return '#4ade80'; // green-400
    case 'good':
      return '#a3e635'; // lime-400
    case 'fair':
      return '#facc15'; // yellow-400
    case 'moderate':
      return '#fbbf24'; // amber-400
    case 'poor':
      return '#fb923c'; // orange-400
    case 'bad':
      return '#f87171'; // red-400
  }
}

const BREAKDOWN_LABELS: Record<string, { label: string; max: number; icon: string }> = {
  temperature: { label: '기온', max: 60, icon: '🌡️' },
  weather: { label: '날씨', max: 20, icon: '🌤️' },
  fineDust: { label: '미세먼지', max: 15, icon: '💨' },
  uv: { label: '자외선', max: 5, icon: '☀️' },
};

// 원형 프로그레스 바 컴포넌트
function CircularProgress({
  value,
  color,
  size = 160,
  strokeWidth = 10,
}: {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      aria-hidden="true"
    >
      {/* 배경 원 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth={strokeWidth}
      />
      {/* 프로그레스 원 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ strokeDasharray: circumference, strokeDashoffset }}
      />
    </svg>
  );
}

// 숫자 표시 컴포넌트 (즉시 표시)
function AnimatedNumber({ value }: { value: number }) {
  return <span>{Math.round(value)}</span>;
}

// Breakdown 바 컴포넌트
function BreakdownBar({
  value,
  max,
  label,
  icon,
  delay = 0,
}: {
  value: number;
  max: number;
  label: string;
  icon: string;
  delay?: number;
}) {
  const percentage = (value / max) * 100;

  return (
    <m.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <span className="text-sm" aria-hidden="true">{icon}</span>
      <span className="text-caption text-glass-muted w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <m.div
          className="h-full rounded-full"
          style={{
            background: percentage >= 70
              ? 'linear-gradient(90deg, #34d399, #4ade80)'
              : percentage >= 40
                ? 'linear-gradient(90deg, #fbbf24, #facc15)'
                : 'linear-gradient(90deg, #fb923c, #f87171)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-caption text-glass-secondary w-12 text-right">
        {value ?? 0}/{max}
      </span>
    </m.div>
  );
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorClass = getScoreColor(score.level);
  const emoji = getScoreEmoji(score.level);
  const progressColor = getProgressColor(score.level);

  return (
    <div
      className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full cursor-pointer transition-transform active:scale-[0.98]"
      onClick={() => setIsExpanded(!isExpanded)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`오늘의 외출 점수 ${score.total}점. ${score.message}. 탭하여 상세 보기`}
    >
      <div className="card-body p-4 flex flex-col items-center justify-center" style={{ gap: 0 }}>
        <h2 className="card-title text-heading-2 justify-center text-glass-secondary mb-3">
          <svg className="w-5 h-5 text-glass-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          오늘의 외출 점수
        </h2>

        {/* 원형 프로그레스 + 점수 */}
        <div className="relative flex items-center justify-center my-2">
          <CircularProgress value={score.total} color={progressColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl mb-1" aria-hidden="true">{emoji}</span>
            <span
              className={`text-display ${colorClass}`}
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)' }}
            >
              <AnimatedNumber value={score.total} />
            </span>
            <span className="text-caption text-glass-muted">/100</span>
          </div>
        </div>

        {/* 메시지 */}
        <p className="text-body text-glass-secondary text-center mt-2">
          {score.message}
        </p>

        {/* 확장/축소 힌트 */}
        <m.div
          className="flex items-center gap-1 mt-2 text-glass-muted"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </m.div>

        {/* Breakdown 확장 영역 */}
        <AnimatePresence>
          {isExpanded && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full overflow-hidden"
            >
              <div className="pt-4 mt-3 border-t border-white/20 space-y-3">
                <p className="text-label text-glass-muted text-center mb-3">점수 상세</p>
                {Object.entries(BREAKDOWN_LABELS).map(([key, { label, max, icon }], index) => (
                  <BreakdownBar
                    key={key}
                    value={score.breakdown[key as keyof typeof score.breakdown]}
                    max={max}
                    label={label}
                    icon={icon}
                    delay={index * 0.1}
                  />
                ))}

                {score.tips.length > 0 && (
                  <m.div
                    className="pt-3 mt-3 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-caption text-glass-muted text-center">
                      💡 {score.tips.join(' · ')}
                    </p>
                  </m.div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
