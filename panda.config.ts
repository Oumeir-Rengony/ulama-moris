import { defineConfig, defineKeyframes } from "@pandacss/dev";


export const pulseKeyFrames = defineKeyframes({
  playingDot: {
    '0%': {
        transform: 'scale(1)'
    },
    '50%' :{
        transform: 'scale(1.9)'
    },
    '100%': {
        transform: 'scale(1)'
    } 
  }
});

export default defineConfig({
  preflight: false,
  prefix: "pda",
  hash: true,
  minify: true,
  include: ["./pages/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  theme: {
    extend: {
      keyframes: {
        ...pulseKeyFrames
      }
    },
  },
  outdir: "styled-system",
  jsxFramework: "react",
  syntax: "template-literal",
});