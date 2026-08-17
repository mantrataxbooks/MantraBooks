import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C41E3A',
          'red-dark': '#8B0000',
          'red-light': '#E8334A',
          silver: '#C0C0C0',
          'silver-dark': '#A0A0A0',
          'silver-light': '#E8E8E8',
          dark: '#1A1A1A',
          dark2: '#2D2D2D',
          dark3: '#3D3D3D',
        },
      },
      fontFamily: {
        // Uses the CSS variable injected by next/font/google in layout.tsx
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
