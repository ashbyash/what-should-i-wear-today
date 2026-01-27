import { createApiHandler } from '@/lib/api-handler';
import { fetchKmaCurrentWeather } from '@/lib/kma-api';

export const GET = createApiHandler({
  envKey: 'KMA_API_KEY',
  envErrorMessage: 'KMA API key not configured',
  fetcher: fetchKmaCurrentWeather,
  errorMessage: 'Failed to fetch current weather data',
  secondaryEnvKey: 'KMA_APIHUB_AUTH_KEY',
});
