import { defineConfig, defineKeyframes } from "@pandacss/dev";


export const keyFrames = defineKeyframes({
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
  },
  loading: {
    '0%,100%': {
      transform: 'scale(0)'
    },
    '50%': {
      transform: 'scale(1)'
    }
  },
  spin: {
    '0%': { 
      transform: 'rotate(0deg)'
    },
    '100%': {
      transform: 'rotate(360deg)'
    }
  }
});



export default defineConfig({
  preflight: false,
  prefix: "pda",
  hash: true,
  minify: true,
  include: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  theme: {
    extend: {
      keyframes: {
        ...keyFrames
      }
    },
  },
  outdir: "styled-system",
  jsxFramework: "react",
  syntax: "template-literal",
});