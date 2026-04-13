import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/lib/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx'],
      exclude: [
        'src/lib/__tests__/**',
        'src/components/__tests__/**',
        'src/lib/prompts/**',
        'src/lib/useAIMessage.ts',
        'src/lib/useAIStylingTip.ts',
        'src/lib/useWeatherData.ts',
        'src/lib/useLocationSearch.ts',
        'src/lib/useClientHour.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
