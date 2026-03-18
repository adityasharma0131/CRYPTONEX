import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "build", "node_modules", ".expo", ".next"]),

  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      importPlugin.configs.recommended,
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      import: importPlugin,
    },

    rules: {
      /* ---------- General ---------- */
      "no-console": "warn",
      "no-debugger": "warn",

      /* ---------- Variables ---------- */
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[_A-Z]",
          argsIgnorePattern: "^_",
        },
      ],

      /* ---------- React Hooks ---------- */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      /* ---------- Imports ---------- */
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // 🔥 IMPORTANT: Detect wrong casing in imports
      "import/no-unresolved": ["error", { caseSensitive: true }],

      "import/no-duplicates": "error",

      /* ---------- Dev Experience ---------- */
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
        },
      },
    },
  },
]);
