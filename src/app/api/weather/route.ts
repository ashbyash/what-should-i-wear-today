import { createApiHandler } from '@/lib/api-handler';
import { fetchKmaWeather } from '@/lib/kma-api';

export const GET = createApiHandler({
  envKey: 'KMA_API_KEY',
  envErrorMessage: 'KMA API key not configured',
  fetcher: fetchKmaWeather,
  errorMessage: 'Failed to fetch weather data',
});
