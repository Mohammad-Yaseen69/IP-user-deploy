import pluginReact from "eslint-plugin-react";
import i18nextPlugin from "eslint-plugin-i18next";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,jsx,tsx}"],

    // ✅ ADD HERE
    ignores: ["src/Data/**", "src/mock/**", "src/demo/**"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      react: pluginReact,
      i18next: i18nextPlugin,
    },

    rules: {
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
            "value",
            "placeholder", // also add this 🔥
          ],
        },
      ],
    },
  },
];
