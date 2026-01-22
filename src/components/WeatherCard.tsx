import type { WeatherData } from '@/types/weather';

interface WeatherCardProps {
  weather: WeatherData;
}

function getWeatherEmoji(weatherMain: string): string {
  const weather = weatherMain.toLowerCase();
  switch (weather) {
    case 'clear':
      return '☀️';
    case 'clouds':
      return '☁️';
    case 'rain':
    case 'drizzle':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️';
    default:
      return '🌤️';
  }
}

function getWeatherLabel(weatherMain: string): string {
  const weather = weatherMain.toLowerCase();
  switch (weather) {
    case 'clear':
      return '맑음';
    case 'clouds':
      return '흐림';
    case 'rain':
      return '비';
    case 'drizzle':
      return '이슬비';
    case 'thunderstorm':
      return '천둥번개';
    case 'snow':
      return '눈';
    case 'mist':
    case 'fog':
      return '안개';
    case 'haze':
      return '연무';
    default:
      return weatherMain;
  }
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  const emoji = getWeatherEmoji(weather.weatherMain);
  const label = getWeatherLabel(weather.weatherMain);

  return (
    <div className="card bg-white/15 backdrop-blur-md border border-white/20 shadow-lg h-full">
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl">{emoji}</div>
        <h4 className="text-label text-glass-muted">날씨</h4>
        <div className="text-display text-glass-primary">{weather.temperature}°</div>
        <div className="text-body text-glass-secondary">{label}</div>
        <div className="text-caption text-glass-muted mt-1">
          최저 {weather.tempMin}° / 최고 {weather.tempMax}°
        </div>
        <div className="text-caption text-glass-muted mt-1">
          체감 {weather.feelsLike}° · 습도 {weather.humidity}%
        </div>
      </div>
    </div>
  );
}
