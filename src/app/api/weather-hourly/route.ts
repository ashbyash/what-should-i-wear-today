import { createApiHandler } from '@/lib/api-handler';
import { fetchKmaHourlyForecast } from '@/lib/kma-api';
import { fetchOpenMeteoHourly } from '@/lib/open-meteo-api';

export const GET = createApiHandler({
  envKey: 'KMA_API_KEY',
  envErrorMessage: 'KMA API key not configured',
  fetcher: fetchKmaHourlyForecast,
  errorMessage: 'Failed to fetch hourly forecast data',
  overseasFetcher: fetchOpenMeteoHourly,
});
