import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Existing API adapters and data mappers use flexible values while the
      // application is transitioning to shared domain types.
      '@typescript-eslint/no-explicit-any': 'off',
      // These effects intentionally hydrate/reset client state from storage
      // and timers after mount.
      'react-hooks/set-state-in-effect': 'off',
      // Existing UI copy contains quoted contractions and labels.
      'react/no-unescaped-entities': 'off',
      'prefer-const': 'off',
    },
  },
]);

export default eslintConfig;
