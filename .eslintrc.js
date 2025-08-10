module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin','simple-import-sort'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'src/migrations/**', 'src/scripts/**'],
  rules: {
    "camelcase": ["error", { "properties": "always" }],
    "newline-after-var": ["error", "always"],
    "max-len": ["error", {
      code: 140,
      ignoreUrls: true,
      ignoreComments: true,
      ignoreStrings: true,
    }],
    "object-curly-spacing": ["error", "always"],
    "no-trailing-spaces": ["error"],
    "import/order": "off",
    "simple-import-sort/imports": ["error", {
      groups: [
        // node-modules first
        ["^@?\\w"],
        // and aliases second
        ["^@/"],
        // internal imports, relative imports
        ["^\\.\\./", "^\\./"],
      ]
    }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error", // or "error"
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};