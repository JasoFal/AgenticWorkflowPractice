import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier/flat'

export default [
  { ignores: ['dist', 'coverage', '.vercel'] },
  js.configs.recommended,
  // In eslint-plugin-react-hooks v7 the top-level `configs['recommended-latest']`
  // is still eslintrc-style (plugins as an array). The flat-config equivalents
  // live under `configs.flat`.
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Vitest globals (vite.config.js sets test.globals = true) so store tests
    // don't trip no-undef. See CLAUDE.md section 8.
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
  // Must stay last: turns off stylistic rules that would fight Prettier.
  prettier,
]
