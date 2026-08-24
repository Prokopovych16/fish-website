import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Глибокий стриманий navy — основний акцентний колір (посилання, фокус, дрібні елементи)
        primary: {
          50: '#EEF1F4',
          100: '#DCE2E8',
          200: '#B3BFCB',
          300: '#8A9BAC',
          400: '#4F6378',
          500: '#2C4154',
          600: '#1F3144',
          700: '#182838',
          800: '#142B42',
          900: '#0F2233',
          950: '#0A1822',
          DEFAULT: '#142B42',
        },
        // Майже чорний — основний текстовий колір
        dark: {
          DEFAULT: '#16181C',
          50: '#F6F6F7',
          100: '#E9E9EA',
          200: '#D2D3D5',
          300: '#A9ABAF',
          400: '#7C7F85',
          500: '#5B5E64',
          600: '#43454A',
          700: '#2E3034',
          800: '#1F2023',
          900: '#16181C',
        },
        // Off-white фон сторінки
        surface: {
          DEFAULT: '#F7F6F3',
          50: '#FBFAF8',
          100: '#F7F6F3',
          200: '#EFEEE9',
        },
        // Дуже приглушений зелений — єдиний "кольоровий" акцент (статус наявності, HACCP)
        sage: {
          DEFAULT: '#5C7A63',
          50: '#EEF3EF',
          100: '#DCE7DE',
          600: '#4A6450',
        },
        // Лишаємо застарілі токени визначеними (щоб не зламати посилання, що ще не перейшли),
        // але більше не використовуємо їх для кнопок/CTA — лише нейтральні відтінки
        accent: {
          DEFAULT: '#2C4154',
          50: '#EEF1F4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
