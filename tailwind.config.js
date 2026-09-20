/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        'clay-beige': '#f5e5d3',
        'clay-border': '#e2c09c',
        'clay-shadow': '#a87a56',
        'clay-text': '#4a2810',
        'israel-green': '#95c777',
        'westbank-yellow': '#f0cb77',
        'border-fence': '#e04238',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'shake': 'shake 0.4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '75%': { transform: 'translateX(4px) rotate(1deg)' },
        }
      }
    },
  },
  plugins: [],
}
