/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cores primárias (teal/green)
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Cores de acento
        accent: {
          purple: '#a855f7',
          pink: '#ec4899',
          orange: '#f97316',
          blue: '#3b82f6',
        },
        // Backgrounds
        dark: {
          primary: '#0f172a',    // slate-900
          secondary: '#1e293b',  // slate-800
          tertiary: '#334155',   // slate-700
        }
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
