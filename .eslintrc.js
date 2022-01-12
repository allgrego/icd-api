module.exports = {
  root: true,
  env: {
    "es2021": true,
    "node": true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "ecmaVersion": 13,
    "sourceType": "module",
    "project": ["tsconfig.json", "tsconfig.dev.json"],
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [

  ],
  rules: {
    "quotes": ["error", "double"],
    "linebreak-style": "off",
    "max-len": "off",
  },
};
