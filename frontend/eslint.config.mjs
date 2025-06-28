import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Bestehende Next.js-Kompatibilität
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Eigene Regeln als zusätzliche Konfiguration anhängen
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-var": "off",
    },
  },
];

export default eslintConfig;
