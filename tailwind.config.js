/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:  '#225675',
        gold:  '#c8973a',
        'gold-light': '#ffd492',
        cream: '#fdf9f4',
      },
      fontFamily: {
        title: ['Quicksand', 'sans-serif'],
        body:  ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
};
