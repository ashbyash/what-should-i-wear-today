import type { OutingScore } from '@/types/score';

interface ScoreGaugeProps {
  score: OutingScore;
}

function getScoreColor(level: OutingScore['level']): string {
  switch (level) {
    case 'excellent':
      return 'text-emerald-400';
    case 'good':
      return 'text-sky-300';
    case 'moderate':
      return 'text-amber-400';
    case 'poor':
      return 'text-rose-400';
  }
}

function getScoreEmoji(level: OutingScore['level']): string {
  switch (level) {
    case 'excellent':
      return '😊';
    case 'good':
      return '🙂';
    case 'moderate':
      return '😐';
    case 'poor':
      return '🏠';
  }
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const colorClass = getScoreColor(score.level);
  const emoji = getScoreEmoji(score.level);

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 flex flex-col items-center justify-center">
        <h2 className="card-title text-heading-2 justify-center text-glass-secondary mb-2">
          <svg className="w-5 h-5 text-glass-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          오늘의 외출 점수
        </h2>
        <div className="text-center my-2">
          <span className={`text-display ${colorClass}`}>{score.total}</span>
          <span className="text-caption text-glass-muted">/100</span>
        </div>
        <p className="text-body text-glass-secondary text-center">
          <span className="text-xl mr-1">{emoji}</span>
          {score.message}
        </p>
      </div>
    </div>
  );
}
