import type { AirQualityData } from '@/types/weather';

interface DustCardProps {
  airQuality: AirQualityData;
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
      return 'text-emerald-400';
    case 'moderate':
      return 'text-sky-300';
    case 'bad':
      return 'text-amber-400';
    case 'very_bad':
      return 'text-rose-400';
  }
}

function getAqiDescription(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '야외 활동하기 좋아요';
    case 'moderate':
      return '민감군은 장시간 야외 활동 주의';
    case 'bad':
      return '야외 활동 자제, 마스크 권장';
    case 'very_bad':
      return '외출 자제, 마스크 필수';
  }
}

function getPm25Range(level: AirQualityData['aqiLevel']): string {
  switch (level) {
    case 'good':
      return '0~15';
    case 'moderate':
      return '16~35';
    case 'bad':
      return '36~75';
    case 'very_bad':
      return '76↑';
  }
}

export default function DustCard({ airQuality }: DustCardProps) {
  const aqiLabel = getAqiLabel(airQuality.aqiLevel);
  const aqiColor = getAqiColor(airQuality.aqiLevel);
  const description = getAqiDescription(airQuality.aqiLevel);
  const pm25Range = getPm25Range(airQuality.aqiLevel);

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl">💨</div>
        <h4 className="text-label text-glass-muted">미세먼지</h4>
        <div className={`text-heading-1 ${aqiColor}`}>{aqiLabel}</div>
        <div className="text-caption text-glass-muted">
          PM2.5: {airQuality.pm25} · PM10: {airQuality.pm10}
        </div>
        <div className="text-xs text-glass-muted/70 mt-1">
          {description}
        </div>
        <div className="text-xs text-glass-muted/50 mt-0.5">
          ({aqiLabel} 기준: PM2.5 {pm25Range}㎍/㎥)
        </div>
      </div>
    </div>
  );
}
