export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Verde antigo preservado (#137A4D)
        primary: {
          DEFAULT: '#137A4D',
          dark: '#0E623B',
          soft: '#E6F4EE',
          fixed: '#99F6BE',
        },
        // Tokens estruturais e semânticos do Zestia
        zest: '#CDEB5A',
        ink: '#15201A',
        muted: '#5B6660',
        canvas: '#F6F7F2',
        surface: '#FFFFFF',
        line: '#E3E7DF',
        danger: '#A8200D',
        secondary: {
          DEFAULT: '#D97706',
          dark: '#874200',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(21, 32, 26, 0.04)',
        modal: '0 16px 32px -8px rgba(21, 32, 26, 0.16)',
      },
    },
  },
}
