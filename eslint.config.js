import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import i18nextPlugin from 'eslint-plugin-i18next'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      i18next: i18nextPlugin,
    },
    extends: [
      'react-app',
      'react-app/jest',
      'plugin:i18next/recommended',
    ],
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react-hooks/exhaustive-deps': 'off',
      'no-dupe-keys': 'off',
      'i18next/no-literal-string': [
        'error',
        {
          markupOnly: true,
          ignoreAttribute: [
            'data-testid',
            'to',
            'src',
            'alt',
            'href',
            'className',
            'id',
            'key',
          ],
        },
      ],
    },
  },
]