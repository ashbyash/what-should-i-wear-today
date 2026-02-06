import { NextRequest, NextResponse } from 'next/server';
import { isKoreaCoordinates } from './cities';

type EnvKey = 'KMA_API_KEY' | 'AIRKOREA_API_KEY' | 'KAKAO_REST_API_KEY' | 'KMA_APIHUB_AUTH_KEY';

interface ApiHandlerOptions<T> {
  envKey: EnvKey;
  envErrorMessage: string;
  fetcher: (lat: number, lon: number, apiKey: string, secondaryKey?: string) => Promise<T>;
  errorMessage: string;
  secondaryEnvKey?: EnvKey;
  overseasFetcher?: (lat: number, lon: number) => Promise<T>;
}

/**
 * API Route 공통 핸들러 생성 함수
 * - lat/lon 파라미터 검증
 * - API 키 존재 확인
 * - 해외 좌표면 overseasFetcher 사용 (API 키 불필요)
 * - 에러 핸들링
 */
export function createApiHandler<T>(options: ApiHandlerOptions<T>) {
  const { envKey, envErrorMessage, fetcher, errorMessage, secondaryEnvKey, overseasFetcher } = options;

  return async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'lat and lon parameters are required' },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    // 해외 좌표 + overseasFetcher 있으면 Open-Meteo 사용
    if (overseasFetcher && !isKoreaCoordinates(latNum, lonNum)) {
      try {
        const data = await overseasFetcher(latNum, lonNum);
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, max-age=600',
          },
        });
      } catch (error) {
        console.error('Overseas API error:', error);
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
    }

    // 한국 좌표 → 기존 로직
    const apiKey = process.env[envKey];

    if (!apiKey) {
      return NextResponse.json(
        { error: envErrorMessage },
        { status: 500 }
      );
    }

    // 선택적 보조 API 키 (apihub 등)
    const secondaryKey = secondaryEnvKey ? process.env[secondaryEnvKey] : undefined;

    try {
      const data = await fetcher(latNum, lonNum, apiKey, secondaryKey);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=600',
        },
      });
    } catch (error) {
      console.error(`${envKey} API error:`, error);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  };
}
