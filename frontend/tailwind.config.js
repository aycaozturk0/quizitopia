/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          cyan:  "#00f5ff",
          pink:  "#ff2d9b",
          green: "#39ff14",
          purple:"#bf00ff",
        },
        dark: {
          900: "#080c14",
          800: "#0d1220",
          700: "#131929",
          600: "#1a2236",
          500: "#232f47",
        },
      },
      fontFamily: {
        display: ["'Orbitron'", "monospace"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        neon:        "0 0 20px rgba(0,245,255,0.4), 0 0 40px rgba(0,245,255,0.1)",
        "neon-pink": "0 0 20px rgba(255,45,155,0.4), 0 0 40px rgba(255,45,155,0.1)",
        "neon-green":"0 0 20px rgba(57,255,20,0.4)",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "slide-up":   "slideUp 0.4s ease-out",
        "pop":        "pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "float":      "float 3s ease-in-out infinite",
        "xp-bar":     "xpBar 1s ease-out forwards",
      },
      keyframes: {
        pulseNeon: {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.6" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        pop: {
          from: { transform: "scale(0.8)", opacity: "0" },
          to:   { transform: "scale(1)",   opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-8px)" },
        },
        xpBar: {
          from: { width: "0%" },
        },
      },
    },
  },
  plugins: [],
};
