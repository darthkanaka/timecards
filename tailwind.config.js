/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a1628',
          card: '#0d1b2a',
          elevated: '#1b2838',
          border: '#2d3f50',
        },
        text: {
          primary: '#ffffff',
          secondary: '#8a94a6',
          muted: '#5a6478',
        },
        accent: {
          DEFAULT: '#3d4f5f',
          hover: '#4d6070',
          active: '#5d7080',
        },
        status: {
          success: '#2d5a3d',
          'success-text': '#4ade80',
          error: '#5a2d2d',
          'error-text': '#f87171',
          warning: '#5a4d2d',
          'warning-text': '#fbbf24',
          info: '#2d4a5a',
          'info-text': '#60a5fa',
        },
      },
    },
  },
  plugins: [],
}
