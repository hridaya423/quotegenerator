import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      
      animation: {
        'gentle-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'water-drop': 'waterDrop 3s infinite',
      },
      keyframes: {
        waterDrop: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)', 
            opacity: '0.5' 
          },
          '50%': { 
            transform: 'translateY(100vh) scale(0)', 
            opacity: '0' 
          }
        }
      }
      
    },
  },
  plugins: [],
} satisfies Config;
