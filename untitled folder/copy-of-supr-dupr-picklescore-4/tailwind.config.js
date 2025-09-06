/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'point-pop': 'pointPop 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        pointPop: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '1' },
          '80%': { transform: 'translate(-50%, -150%) scale(1.5)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -150%) scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
