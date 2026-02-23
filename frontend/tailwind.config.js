/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 育賢國中 校徽配色：深藍為主，金色為輔
        school: {
          navy:  '#1B3A6B',   // 深藍
          blue:  '#2D5DA6',   // 中藍
          light: '#4A7BC4',   // 淺藍
          gold:  '#C9A227',   // 金色
          cream: '#F5EED7',   // 米白
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'walk-right': 'walkRight 20s linear infinite',
        'walk-left':  'walkLeft 20s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        walkRight: {
          '0%':   { transform: 'translateX(-120px)' },
          '100%': { transform: 'translateX(calc(100vw + 120px))' },
        },
        walkLeft: {
          '0%':   { transform: 'translateX(calc(100vw + 120px)) scaleX(-1)' },
          '100%': { transform: 'translateX(-120px) scaleX(-1)' },
        },
      },
    },
  },
  plugins: [],
}
