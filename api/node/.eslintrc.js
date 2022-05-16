module.exports = {
	env: {
		node: true,
	},
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	rules: {
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'no-unused-vars': 'off',
	},
};
