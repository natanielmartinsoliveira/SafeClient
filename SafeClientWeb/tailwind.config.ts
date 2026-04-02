import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:      '#8B6FC4',
          dark:         '#5C3D9E',
          light:        '#EDE8F8',
          background:   '#F0ECFF',
          textPrimary:  '#2E1B6E',
          textMuted:    '#9887B8',
          border:       '#E0D8F4',
          wave:         '#DDD4F0',
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
