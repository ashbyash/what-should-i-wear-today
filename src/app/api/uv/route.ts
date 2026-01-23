import { createApiHandler } from '@/lib/api-handler';
import { fetchUVIndex } from '@/lib/kma-api';

export const GET = createApiHandler({
  envKey: 'KMA_API_KEY',
  envErrorMessage: 'KMA API key not configured',
  fetcher: fetchUVIndex,
  errorMessage: 'Failed to fetch UV index data',
});
