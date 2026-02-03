/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 빌드 시 console.log 제거
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // 패키지 번들 최적화
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
