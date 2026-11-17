// Tokens extraídos do DESIGN.md (Stitch)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { primary: { DEFAULT: '#137A4D', dark: '#0E623B', fixed: '#99F6BE' }, secondary: { DEFAULT: '#D97706', dark: '#B45309' }, ink: '#1E293B', canvas: '#F8FAF9', line: '#E2E8F0', danger: '#B91C1C' },
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
    boxShadow: { card: '0 1px 3px rgba(19,122,77,.04), 0 1px 2px rgba(0,0,0,.03)', modal: '0 12px 24px -4px rgba(15,23,42,.12)' },
  } },
}
