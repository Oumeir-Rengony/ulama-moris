module.exports = {
    plugins: {
      tailwindcss: {},
      cssnano: {},
      "postcss-flexbugs-fixes": {},
      "postcss-preset-env": {
        autoprefixer: {
          flexbox: "no-2009",
        },
        stage: 3,
        features: {
          "custom-properties": false,
        },
      },
      '@fullhuman/postcss-purgecss': {
        content: [
          './pages/**/*.{js,jsx,ts,tsx}',
          './components/**/*.{js,jsx,ts,tsx}',
          "./node_modules/@nextui-org/theme/dist/components/pagination.js", 
          "./node_modules/@nextui-org/theme/dist/components/input.js", 
          "./node_modules/@nextui-org/theme/dist/components/button.js", 
          "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: ["html", "body", /^data-.*/],
        },
      }
    },
}

