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
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-4 items-center text-center">
        <div className="text-5xl mb-2">{emoji}</div>
        <div className="text-4xl font-bold">{weather.temperature}°</div>
        <div className="text-base-content/70">{label}</div>
        <div className="text-sm text-base-content/50 mt-1">
          최저 {weather.tempMin}° / 최고 {weather.tempMax}°
        </div>
        <div className="text-xs text-base-content/40 mt-1">
          체감 {weather.feelsLike}° · 습도 {weather.humidity}%
        </div>
      </div>
    </div>
  );
}
