export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:   ['Inter Tight', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif:  ['Fraunces', 'Georgia', 'serif'],
        script: ['Caveat', 'cursive'],
      },
      colors: {
        ocean: {
          DEFAULT: '#0f4c75',
          deep:  '#0a3457',
          50:  '#e8f4fd',
          100: '#c8e3f8',
          200: '#97c9f0',
          300: '#5aa8e2',
          400: '#2987d1',
          500: '#0f6ab5',
          600: '#0f4c75',
          700: '#0a3555',
          800: '#072540',
          900: '#04172b',
        },
        seafoam: {
          DEFAULT: '#56cfe1',
          soft:  '#a8e3ec',
          light: '#a8eaf3',
          dark:  '#1fb3cd',
        },
        sand: {
          DEFAULT: '#fef3e2',
          warm:  '#f7e6c9',
          50:  '#fffaf4',
          100: '#fef3e2',
          200: '#fde8c5',
          300: '#fad49a',
        },
        cream:  '#fbf7ee',
        ink:    '#0a1f33',
        muted:  '#5b6b7a',
        wave:   '#1565a0',
        coral:  'oklch(0.74 0.13 38)',
        line:   'rgba(15, 76, 117, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(15, 76, 117, 0.10), 0 1px 4px rgba(15, 76, 117, 0.06)',
        'glass-lg': '0 8px 40px rgba(15, 76, 117, 0.14), 0 2px 8px rgba(15, 76, 117, 0.08)',
        header: '0 12px 48px rgba(10, 45, 74, 0.30)',
      },
      backgroundImage: {
        'ocean-header': 'linear-gradient(160deg, #061e33 0%, #0a2d4a 40%, #0f4c75 100%)',
        'coastal-page': 'linear-gradient(165deg, #e4f1fb 0%, #d0e8f7 20%, #eaf3f8 50%, #f0ebe0 75%, #fef3e2 100%)',
      },
      animation: {
        'wave-slow': 'wave 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-4%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
