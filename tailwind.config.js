// Tokens do guia "Fundamentos visuais" (Zestia.pdf). Raios usados: 8 (lg), 12 (xl), 16 (2xl), 999 (full).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      primary: { DEFAULT: '#1E6B47', dark: '#17573A', soft: '#EEF5E1' },
      zest: { DEFAULT: '#CDEB5A', dark: '#BCDC45' },
      ink: '#15201A',
      muted: '#5B6660',
      canvas: '#F6F7F2',
      surface: '#FFFFFF',
      line: { DEFAULT: '#E3E7DF', strong: '#C5CCC4', input: '#878F89' }, // input: contraste 3:1 com o branco (WCAG 1.4.11)
      // Selo de validade
      urgent: { bg: '#FDE3DE', fg: '#A8200D', line: '#F3B8AD' },
      soon: { bg: '#FEF0C7', fg: '#874200', line: '#F2D58A' },
      ok: { bg: '#DDF3E4', fg: '#13623A' },
      // Origem e tipo de aviso
      market: { bg: '#E4EBFA', fg: '#2B4FA8' },
      ngo: { bg: '#F2E8FA', fg: '#6D2A9E' },
      done: { bg: '#E6E9E4', fg: '#3F4842' },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
    },
    boxShadow: {
      card: '0 1px 2px rgba(21,32,26,.04)',
      modal: '0 16px 40px -8px rgba(21,32,26,.25)',
    },
  } },
}
