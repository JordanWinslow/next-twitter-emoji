/** @type {import("prettier").Config} */
const config = {
  semi: false,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};

module.exports = config;
