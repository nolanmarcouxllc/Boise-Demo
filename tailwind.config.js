/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#00552B',
        forestDeep: '#003F22',
        forestDark: '#00301A',
        accent: '#148345',
        accentBright: '#3FBF6E',
        amber: '#D98A00',
        danger: '#D71920',
        info: '#1F5F99',
        line: '#D7D9D6',
        lineSoft: '#E6E8E5',
        ink: '#17231C',
        inkSoft: '#667069',
        inkFaint: '#8B938C',
        shell: '#F4F5F3',
      },
      fontFamily: {
        cond: ['"Roboto Condensed"', '"Archivo Narrow"', '"Barlow Condensed"', '"Arial Narrow"', '"Liberation Sans Narrow"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '5px',
        sm2: '4px',
      },
    },
  },
  plugins: [],
}
