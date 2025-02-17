import globals from "globals";
import eslint from "@eslint/js";
import github from 'eslint-plugin-github'
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	github.getFlatConfigs().recommended,
	{
		languageOptions: {
			ecmaVersion: 9,
			sourceType: "module",
			globals: {
				...globals.node,
			}
		},
		ignores: ["**/dist/", "**/lib/", "**/node_modules/", "**/jest.config.js"],
		rules: {
			camelcase: "off",
			"i18n-text/no-en": "off",
			"no-console": "off",
		},
	}
);

