import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Glass UI 색상 토큰 (CSS 변수로 동적 색상 지원)
        glass: {
          primary: "var(--glass-primary)",
          secondary: "var(--glass-secondary)",
          muted: "var(--glass-muted)",
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // 타이포그래피 스케일 토큰
        'display': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        'heading-1': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-2': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
