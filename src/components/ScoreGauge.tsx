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

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const colorClass = getScoreColor(score.level);
  const emoji = getScoreEmoji(score.level);

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 flex flex-col items-center justify-center" style={{ gap: 0 }}>
        <h2 className="card-title text-heading-2 justify-center text-glass-secondary mb-2">
          <svg className="w-5 h-5 text-glass-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          오늘의 외출 점수
        </h2>
        <div className="text-center my-2">
          <span
            className={`text-display ${colorClass}`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)' }}
          >
            {score.total}
          </span>
          <span className="text-caption text-glass-muted">/100</span>
        </div>
        <p className="text-body text-glass-secondary text-center">
          <span className="text-xl mr-1">{emoji}</span>
          {score.message}
          {score.tips.length > 0 && (
            <>
              <br />
              <span className="text-caption text-glass-muted">
                💡 {score.tips.join(' · ')}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
