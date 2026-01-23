import { createApiHandler } from '@/lib/api-handler';
import { fetchLocation } from '@/lib/kakao-api';

export const GET = createApiHandler({
  envKey: 'KAKAO_REST_API_KEY',
  envErrorMessage: 'Kakao API key not configured',
  fetcher: fetchLocation,
  errorMessage: 'Failed to fetch location data',
});
