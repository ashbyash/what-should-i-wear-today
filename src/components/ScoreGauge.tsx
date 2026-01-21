import type { OutingScore } from '@/types/score';

interface ScoreGaugeProps {
  score: OutingScore;
}

function getScoreColor(level: OutingScore['level']): string {
  switch (level) {
    case 'excellent':
      return 'text-success';
    case 'good':
      return 'text-info';
    case 'moderate':
      return 'text-warning';
    case 'poor':
      return 'text-error';
  }
}

function getScoreBgColor(level: OutingScore['level']): string {
  switch (level) {
    case 'excellent':
      return 'bg-success/10';
    case 'good':
      return 'bg-info/10';
    case 'moderate':
      return 'bg-warning/10';
    case 'poor':
      return 'bg-error/10';
  }
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const colorClass = getScoreColor(score.level);
  const bgColorClass = getScoreBgColor(score.level);

  return (
    <div className="flex flex-col items-center py-6">
      <h2 className="text-sm text-base-content/60 mb-3">외출 점수</h2>
      <div
        className={`relative w-32 h-32 rounded-full ${bgColorClass} flex items-center justify-center`}
      >
        <div className="text-center">
          <span className={`text-4xl font-bold ${colorClass}`}>{score.total}</span>
          <span className="text-base-content/40 text-sm">/100</span>
        </div>
      </div>
      <p className="mt-4 text-base font-medium">{score.message}</p>
    </div>
  );
}
