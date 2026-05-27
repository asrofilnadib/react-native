/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        colors: {
          primary: '#D32F2F',
          secondary: '#FFC107',
          accent: '#FF9800',
          background: '#FFFFFF',
          text: '#212121',
          textLight: '#757575',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
        },
      },
    },
    plugins: [],
  };