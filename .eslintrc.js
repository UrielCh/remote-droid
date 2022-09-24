module.exports = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ["**/*.js"],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    browser: false,
    node: true,
    jest: true,
    es2021: true,
  },
  // ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    // 'no-floating-promise': ['error'],
    // 'no-floating-promises': 1,
    // 'no-promise-executor-return': 2,
    "@typescript-eslint/no-unused-vars": "off",
    'no-unused-vars': "off",
    'require-await': 'error',
    "indent": "off", // https://github.com/typescript-eslint/typescript-eslint/issues/1824
    'linebreak-style': 'off',
    'eol-last': ['error', 'always'],
    'quotes': ['error', 'single', {
      'avoidEscape': true
    }],
    'semi': ['error', 'always'],
    'no-constant-condition': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'max-len': 'off',
  },
};