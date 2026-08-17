/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef4ef',
          100: '#d6e5d9',
          200: '#adc9b3',
          300: '#7fa889',
          400: '#548a61',
          500: '#2f6b40',
          600: '#215733',
          700: '#1a4528',
          800: '#14351f',
          900: '#0e2616',
        },
        charcoal: {
          50: '#f4f5f5',
          100: '#e3e5e5',
          200: '#c4c8c8',
          300: '#9aa0a0',
          400: '#6d7474',
          500: '#4b5252',
          600: '#343a3a',
          700: '#242929',
          800: '#181c1c',
          900: '#0f1212',
        },
        timber: {
          50: '#faf5ee',
          100: '#f0e4d2',
          200: '#e0c8a5',
          300: '#caa672',
          400: '#b3874c',
          500: '#8f6a3a',
          600: '#6f512c',
        },
        alert: {
          critical: '#a52322',
          warn: '#b46a06',
          ok: '#2f6b40',
          info: '#1f5680',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15,18,18,0.06), 0 4px 16px rgba(15,18,18,0.06)',
        drawer: '-8px 0 32px rgba(15,18,18,0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up': 'fade-up 380ms cubic-bezier(0.22,1,0.36,1) both',
        'draw-line': 'draw-line 1400ms ease-out both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
