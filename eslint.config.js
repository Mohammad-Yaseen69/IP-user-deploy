import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import i18nextPlugin from "eslint-plugin-i18next";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      js,
      react: pluginReact,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      i18next: i18nextPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/jsx-uses-react": "off", // ignore "React must be in scope"
      "react/react-in-jsx-scope": "off", // same issue
      "no-unused-vars": ["warn"], // unused vars warning
      "react-hooks/exhaustive-deps": "off",
      "no-dupe-keys": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "i18next/no-literal-string": [
        "warn",
        {
          markupOnly: true,
          ignoreAttribute: [
            "data-testid",
            "to",
            "src",
            "alt",
            "href",
            "className",
            "id",
            "key",
          ],
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier, // keep last: turns off rules that conflict with Prettier
]);
