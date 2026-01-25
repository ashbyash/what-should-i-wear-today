import { createApiHandler } from '@/lib/api-handler';
import { fetchKmaForecastWeather } from '@/lib/kma-api';

export const GET = createApiHandler({
  envKey: 'KMA_API_KEY',
  envErrorMessage: 'KMA API key not configured',
  fetcher: fetchKmaForecastWeather,
  errorMessage: 'Failed to fetch forecast weather data',
});
