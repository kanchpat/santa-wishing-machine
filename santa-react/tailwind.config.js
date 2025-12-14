/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#ea2a33", // Screen 1 primary
        "primary-mail": "#f2200d", // Message primary
        "background-light": "#f8f6f6",
        "background-dark": "#211111",
        "paper-light": "#ffffff",
        "paper-dark": "#2d1b1b",
        "parchment": "#fdfbf7",
        "ink": "#1c0e0d",
      },
      fontFamily: {
        "display": ["Be Vietnam Pro", "sans-serif"],
        "serif": ["Newsreader", "serif"],
        "sans": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem", // approximating
        "3xl": "1.5rem",
      },
      backgroundImage: {
        'snow-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in-down': 'fadeInDown 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
