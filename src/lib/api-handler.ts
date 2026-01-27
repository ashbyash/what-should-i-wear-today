import { NextRequest, NextResponse } from 'next/server';

type EnvKey = 'KMA_API_KEY' | 'AIRKOREA_API_KEY' | 'KAKAO_REST_API_KEY' | 'KMA_APIHUB_AUTH_KEY';

interface ApiHandlerOptions<T> {
  envKey: EnvKey;
  envErrorMessage: string;
  fetcher: (lat: number, lon: number, apiKey: string, secondaryKey?: string) => Promise<T>;
  errorMessage: string;
  secondaryEnvKey?: EnvKey;
}

/**
 * API Route 공통 핸들러 생성 함수
 * - lat/lon 파라미터 검증
 * - API 키 존재 확인
 * - 에러 핸들링
 */
export function createApiHandler<T>(options: ApiHandlerOptions<T>) {
  const { envKey, envErrorMessage, fetcher, errorMessage, secondaryEnvKey } = options;

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
      const data = await fetcher(parseFloat(lat), parseFloat(lon), apiKey, secondaryKey);
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
