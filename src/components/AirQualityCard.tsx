import type { AirQualityData } from '@/types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityData;
  uvIndex?: number;
}

function getAqiLabel(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '좋음';
    case 'moderate':
      return '보통';
    case 'bad':
      return '나쁨';
    case 'very_bad':
      return '매우나쁨';
  }
}

function getAqiColor(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return 'text-success';
    case 'moderate':
      return 'text-info';
    case 'bad':
      return 'text-warning';
    case 'very_bad':
      return 'text-error';
  }
}

function getUvLabel(uvIndex: number): string {
  if (uvIndex <= 2) return '낮음';
  if (uvIndex <= 5) return '보통';
  if (uvIndex <= 7) return '높음';
  if (uvIndex <= 10) return '매우높음';
  return '위험';
}

function getUvColor(uvIndex: number): string {
  if (uvIndex <= 2) return 'text-success';
  if (uvIndex <= 5) return 'text-info';
  if (uvIndex <= 7) return 'text-warning';
  if (uvIndex <= 10) return 'text-error';
  return 'text-error';
}

export default function AirQualityCard({ airQuality, uvIndex }: AirQualityCardProps) {
  const aqiLabel = getAqiLabel(airQuality.aqiLevel);
  const aqiColor = getAqiColor(airQuality.aqiLevel);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 미세먼지 */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4 items-center text-center">
          <div className="text-2xl">💨</div>
          <h4 className="text-sm text-base-content/60">미세먼지</h4>
          <div className={`text-lg font-bold ${aqiColor}`}>{aqiLabel}</div>
          <div className="text-xs text-base-content/50">
            초미세: {airQuality.pm25} · 미세: {airQuality.pm10}
          </div>
        </div>
      </div>

      {/* 자외선 */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4 items-center text-center">
          <div className="text-2xl">☀️</div>
          <h4 className="text-sm text-base-content/60">자외선</h4>
          {uvIndex !== undefined ? (
            <>
              <div className={`text-lg font-bold ${getUvColor(uvIndex)}`}>
                {getUvLabel(uvIndex)}
              </div>
              <div className="text-xs text-base-content/50">지수: {uvIndex}</div>
            </>
          ) : (
            <div className="text-sm text-base-content/40">정보 없음</div>
          )}
        </div>
      </div>
    </div>
  );
}
