/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        qrInk: '#171420',
        qrInkSoft: '#4c4959',
        qrPaper: '#faf9fb',
        qrLine: '#e6e3ec',
        qrMagenta: '#b31564',
        qrMagentaDeep: '#6b0e3a',
        qrPink: '#e62893',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        display: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    }
  },
  plugins: [],
}
