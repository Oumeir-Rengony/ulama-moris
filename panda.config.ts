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
  glow: {
    '0%': {
      boxShadow: 'rgb(127, 243, 125, 0.1) 0px 14px 28px, rgb(127, 243, 125, 0.1) 0px 10px 10px'
    },
    '10%': {
      boxShadow: 'rgb(127, 243, 125, 0.25) 0px 14px 28px, rgb(127, 243, 125, 0.25) 0px 10px 10px'
    },
    '50%': {
      boxShadow: 'rgb(127, 243, 125, 0.35) 0px 14px 28px, rgb(127, 243, 125, 0.35) 0px 10px 10px'
    },
    '100%': {
      boxShadow: 'rgb(127, 243, 125, 0.1) 0px 14px 28px, rgb(127, 243, 125, 0.1) 0px 10px 10px'
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