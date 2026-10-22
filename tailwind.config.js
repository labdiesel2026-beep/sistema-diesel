/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        canvas: 'var(--surface-canvas)',
        card: 'var(--surface-card)',
        media: 'var(--surface-media)',
        industrial: {
          DEFAULT: 'var(--accent-action)',
          hover: 'var(--accent-hover)',
          dark: 'var(--admin-btn-primary-hover)',
        },
        mutedText: 'var(--text-muted)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-half': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%) rotate(45deg)' },
          '23.07%': { transform: 'translateX(150%) rotate(45deg)' },
          '100%': { transform: 'translateX(150%) rotate(45deg)' },
        },
        'shimmer-slide': {
          '0%': { transform: 'translateX(-150%) rotate(45deg)' },
          '23.07%': { transform: 'translateX(150%) rotate(45deg)' },
          '100%': { transform: 'translateX(150%) rotate(45deg)' },
        },
        arrow: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(4px)' },
        },
        'arrow-oscillate': {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        marquee: 'marquee-half 35s linear infinite',
        'marquee-half': 'marquee-half 35s linear infinite',
        shimmer: 'shimmer-slide 5.2s ease-in-out infinite',
        'shimmer-slide': 'shimmer-slide 5.2s ease-in-out infinite',
        arrow: 'arrow-oscillate 1.5s ease-in-out infinite',
        'arrow-oscillate': 'arrow-oscillate 1.5s ease-in-out infinite',
      },
    },
  },
};
