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

export default function DustCard({ airQuality }: DustCardProps) {
  const aqiLabel = getAqiLabel(airQuality.aqiLevel);
  const aqiColor = getAqiColor(airQuality.aqiLevel);

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl">💨</div>
        <h4 className="text-label text-glass-muted">미세먼지</h4>
        <div className={`text-heading-1 ${aqiColor}`}>{aqiLabel}</div>
        <div className="text-caption text-glass-muted">
          PM2.5: {airQuality.pm25} · PM10: {airQuality.pm10}
        </div>
      </div>
    </div>
  );
}
