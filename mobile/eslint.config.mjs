import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  ...expoConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/namespace": "off",
      "import/no-duplicates": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-unresolved": "off",
      "@typescript-eslint/array-type": "off"
    }
  },
  globalIgnores(["dist/**", ".expo/**", "node_modules/**"])
]);
