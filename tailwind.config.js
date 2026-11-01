/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        fg: v('fg'),
        muted: v('muted'),
        line: v('line'),
        lime: v('lime'),
        cyan: v('cyan'),
        volt: v('volt'),
        ink: v('ink'),
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--volt) / 0.35), 0 10px 40px -10px rgb(var(--volt) / 0.55)',
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 20px 50px -20px rgb(0 0 0 / 0.5)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseline: { '0%': { strokeDashoffset: '600' }, '100%': { strokeDashoffset: '0' } },
        shimmer: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseline: 'pulseline 2.4s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
