/** @type {import('tailwindcss').Config} */

import Colors from "./src/utils/constants/Colors.tsx";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: Colors.primary,
        primarylight: Colors.primaryLight,
        primarydark: Colors.primaryDark,

        secondary: Colors.secondary,
        secondarylight: Colors.secondaryLight,
        secondarydark: Colors.secondaryDark,

        background: Colors.background,
        backgrounddark: Colors.backgroundDark,

        textPrimary: Colors.textPrimary,
        textSecondary: Colors.textSecondary,
        textLight: Colors.textLight,
        textError: Colors.textError,

        accent: Colors.accent,
        accentLight: Colors.accentLight,

        border: Colors.border,
        borderDark: Colors.borderDark,

        error: Colors.error,
        success: Colors.success,
        warning: Colors.warning,

        shadowLight: Colors.shadowLight,
        shadowMedium: Colors.shadowMedium,
        shadowDark: Colors.shadowDark,

        white: Colors.white,
        black: Colors.black,
        gray: Colors.gray,

        buttonPrimary: Colors.buttonPrimary,
        buttonSecondary: Colors.buttonSecondary,

        transparent: Colors.transparent,
      },

      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(50px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};