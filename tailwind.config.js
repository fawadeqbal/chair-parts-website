/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './404.html', './assets/js/**/*.js'],
  future: { hoverOnlyWhenSupported: true }, // hover styles only on pointer devices
  theme: {
    extend: {
      colors: {
        // Store palette (refresh: deeper navy, brass highlight, clay accent). WCAG contrast:
        // ink on cream 16.0:1, stone-600 on cream 6.8:1, clay on cream 6.0:1 / on white 6.7:1,
        // cream on slide-blue 11.7:1, on slide-rust 6.8:1; brass on slide-blue 6.8:1, on ink 9.3:1.
        // Brass is for dark backgrounds only (never on cream/white or the rust slide).
        ink: '#15171C',
        cream: '#F5F2EC',
        sand: '#ECE8E1',
        mint: '#DCE8DC',
        peach: '#F3DCCD',
        clay: '#9C3F1A',
        brass: '#E2B45A',
        panel: { DEFAULT: '#22242A', hover: '#2B2E35' },
        slide: { blue: '#1B3150', rust: '#8E3917', ink: '#17191F' },
        brand: { 50: '#EEF3F8', 100: '#DCE6F0', 600: '#3B6A9E', 700: '#2C4A6E', 800: '#22395A' },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['Barlow', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: { card: '6px' },
      boxShadow: {
        card: '0 1px 2px rgb(20 20 20 / 0.06)',
        lift: '0 1px 2px rgb(20 20 20 / 0.05), 0 14px 32px rgb(20 20 20 / 0.12)',
      },
      transitionTimingFunction: { out: 'cubic-bezier(0.2, 0, 0, 1)' },
      maxWidth: { site: '1280px' },
    },
  },
};
