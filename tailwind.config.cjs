/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // 🌙 alterna com body.classList.toggle("dark")
  theme: {
    extend: {
      /* 🎨 Paleta temática — Oceano Profundo */
      colors: {
        ocean: {
          deep: "#000C13",      // Fundo principal (mar profundo)
          mid: "#001B26",       // Camada intermediária
          surface: "#002733",   // Superfície/reflexo
          accent: "#0A9396",    // Azul esverdeado (cor principal)
          sand: "#E9D8A6",      // Areia/destaques
          coral: "#FF6F61",     // Acento opcional (botões de alerta)
        },
      },

      /* 🌫️ Sombras suaves */
      boxShadow: {
        ocean: "0 4px 20px rgba(10,147,150,0.25)",
      },

      /* 🪸 Transições globais */
      transitionProperty: {
        theme: "background-color, color, border-color, fill, stroke",
      },

      /* 🫧 Animações reutilizáveis */
      keyframes: {
        float: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-6px)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite alternate",
        fadeIn: "fadeIn 1s ease-out forwards",
      },
    },

    /* 📱 Breakpoints personalizados */
    screens: {
      xs: "320px",   // Microdevices (smartwatches, POS)
      sm: "375px",   // Smartphones pequenos (iPhone SE)
      md: "475px",   // Smartphones padrão
      lg: "640px",   // Phablets e grandes celulares
      xl: "768px",   // Tablets pequenos
      "2xl": "1024px", // Tablets médios / notebooks compactos
      "3xl": "1280px", // Laptops convencionais
      "4xl": "1536px", // Monitores grandes / dev setups
      "5xl": "1920px", // FullHD / ultrawide comum
      "6xl": "2560px", // 2K+, multitela
      "7xl": "3440px", // 4K / ultrawide extremo
    },
  },
  plugins: [],
};
