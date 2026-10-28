/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './404.html', './assets/js/**/*.js'],
  future: { hoverOnlyWhenSupported: true }, // hover styles only on pointer devices
  theme: {
    extend: {
      colors: {
        // Brand slate-blue (logo, links, selected states). Contrast vs white: 700 = 9.08:1, 600 = 5.61:1.
        brand: { 50: '#EEF3F8', 100: '#DCE6F0', 600: '#3B6A9E', 700: '#2C4A6E', 800: '#22395A' },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['Barlow', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: { card: '14px' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.05)',
        lift: '0 1px 2px rgb(15 23 42 / 0.05), 0 12px 28px rgb(15 23 42 / 0.10)',
      },
      transitionTimingFunction: { out: 'cubic-bezier(0.2, 0, 0, 1)' },
      maxWidth: { site: '1200px' },
    },
  },
};
