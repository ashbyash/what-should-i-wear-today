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
            <div className="text-xs text-glass-muted/70 mt-1">
              {getUvDescription(uvIndex)}
            </div>
            <div className="text-xs text-glass-muted/50 mt-0.5">
              ({getUvLabel(uvIndex)} 기준: {getUvRange(uvIndex)})
            </div>
          </>
        ) : (
          <div className="text-body text-glass-muted">정보 없음</div>
        )}
      </div>
    </div>
  );
}
