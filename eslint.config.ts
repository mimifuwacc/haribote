import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist/", "examples/*/node_modules/"] },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    extends: tseslint.configs.recommended,
  },
  prettierConfig,
);
