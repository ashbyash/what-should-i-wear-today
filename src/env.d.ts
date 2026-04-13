/// <reference types="node" />

/**
 * 환경변수 타입 정의
 * TypeScript에서 process.env 접근 시 타입 안전성 제공
 */
declare namespace NodeJS {
  interface ProcessEnv {
    // API Keys (Required for production)
    KMA_API_KEY?: string;           // 기상청 API 키
    KMA_APIHUB_AUTH_KEY?: string;   // 기상청 API Hub 인증 키
    AIRKOREA_API_KEY?: string;      // 에어코리아 API 키
    KAKAO_REST_API_KEY?: string;    // 카카오 REST API 키
    OPENAI_API_KEY?: string;        // OpenAI API 키

    // Client-side
    NEXT_PUBLIC_GA_ID?: string;     // Google Analytics ID

    // Next.js Built-in
    NODE_ENV: 'development' | 'production' | 'test';

    // Vercel (자동 주입)
    VERCEL?: string;
    VERCEL_ENV?: 'production' | 'preview' | 'development';
    VERCEL_URL?: string;
  }
}
