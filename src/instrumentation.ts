/**
 * Next.js Instrumentation
 * 서버 시작 시 AWS 관측소 목록 프리로드
 */

export async function register() {
  // Node.js 런타임에서만 실행 (Edge 제외)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const authKey = process.env.KMA_APIHUB_AUTH_KEY;

    if (authKey) {
      try {
        const { fetchAwsStations } = await import('./lib/weather-stations');
        const stations = await fetchAwsStations(authKey);
        console.log(`[Preload] AWS 관측소 ${stations.length}개 로드 완료`);
      } catch (error) {
        console.error('[Preload] AWS 관측소 로드 실패:', error);
      }
    }
  }
}
