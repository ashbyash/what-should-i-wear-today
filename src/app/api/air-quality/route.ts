import { createApiHandler } from '@/lib/api-handler';
import { fetchAirKorea } from '@/lib/airkorea-api';

export const GET = createApiHandler({
  envKey: 'AIRKOREA_API_KEY',
  envErrorMessage: 'AirKorea API key not configured',
  fetcher: fetchAirKorea,
  errorMessage: 'Failed to fetch air quality data',
});
