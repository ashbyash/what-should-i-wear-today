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
  if (uvIndex <= 2) return 'text-emerald-400';
  if (uvIndex <= 5) return 'text-sky-300';
  if (uvIndex <= 7) return 'text-amber-400';
  if (uvIndex <= 10) return 'text-orange-400';
  return 'text-rose-400';
}

export default function UvCard({ uvIndex }: UvCardProps) {
  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl">🌤️</div>
        <h4 className="text-label text-glass-muted">자외선</h4>
        {uvIndex !== undefined ? (
          <>
            <div className={`text-heading-1 ${getUvColor(uvIndex)}`}>
              {getUvLabel(uvIndex)}
            </div>
            <div className="text-caption text-glass-muted">지수: {uvIndex}</div>
          </>
        ) : (
          <div className="text-body text-glass-muted">정보 없음</div>
        )}
      </div>
    </div>
  );
}
