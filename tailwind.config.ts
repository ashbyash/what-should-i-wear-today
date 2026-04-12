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
        glass: {
          primary: "var(--glass-primary)",
          secondary: "var(--glass-secondary)",
          muted: "var(--glass-muted)",
        },
        status: {
          good: "var(--status-good)",
          moderate: "var(--status-moderate)",
          bad: "var(--status-bad)",
        },
      },
      textColor: {
        skin: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'temperature': ['64px', { lineHeight: '1', fontWeight: '200', letterSpacing: '-2px' }],
        'score': ['40px', { lineHeight: '1.1', fontWeight: '600' }],
        'title': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'headline': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
        'module-label': ['13px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      borderRadius: {
        'glass-outer': 'var(--glass-radius-outer)',
        'glass-inner': 'var(--glass-radius-inner)',
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
