/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './404.html', './assets/js/**/*.js'],
  future: { hoverOnlyWhenSupported: true }, // hover styles only on pointer devices
  theme: {
    extend: {
      colors: {
        // Store palette. Contrast checked (WCAG): ink on cream 16.35:1, stone-600 on cream 6.77:1,
        // cream on slide-blue 10.35:1, on slide-rust 6.01:1, on slide-ink 15.73:1.
        ink: '#141414',
        cream: '#F4F1EC',
        sand: '#ECE8E1',
        mint: '#DCE8DC',
        peach: '#F3DCCD',
        slide: { blue: '#22395A', rust: '#9A3F1C', ink: '#18181B' },
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
