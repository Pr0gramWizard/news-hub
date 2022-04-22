const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';

const webpackMode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const alias = {
	'react-dom': '@hot-loader/react-dom',
};

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const options = {
	mode: webpackMode,
	entry: {
		popup: './src/pages/Popup/index.tsx',
		background: './src/scripts/background.ts',
		content: './src/scripts/content/twitter.ts',
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'build'),
		clean: true,
		publicPath: ASSET_PATH,
	},
	module: {
		rules: [
			{
				test: /\.(css|scss)$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
				type: 'asset/resource',
				exclude: /node_modules/,
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
				exclude: /node_modules/,
			},
			{ test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: 'source-map-loader',
					},
					{
						loader: 'babel-loader',
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		alias: alias,
		extensions: fileExtensions.map((extension) => '.' + extension).concat(['.js', '.jsx', '.ts', '.tsx', '.css']),
	},
	plugins: [
		new CleanWebpackPlugin({ verbose: false }),
		new webpack.ProgressPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'src/manifest.json',
					to: path.join(__dirname, 'build'),
					force: true,
					transform: function (content, path) {
						// generates the manifest file using the package.json informations
						return Buffer.from(
							JSON.stringify({
								description: process.env.npm_package_description,
								version: process.env.npm_package_version,
								...JSON.parse(content.toString()),
							})
						);
					},
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'src/assets/img/icon-128.png',
					to: path.join(__dirname, 'build'),
					force: true,
				},
			],
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'src/assets/img/icon-48.png',
					to: path.join(__dirname, 'build'),
					force: true,
				},
			],
		}),
		new HtmlWebpackPlugin({
			template: path.join(__dirname, 'src', 'pages', 'Popup', 'index.html'),
			filename: 'popup.html',
			chunks: ['popup'],
			cache: false,
		}),
	],
	infrastructureLogging: {
		level: 'info',
	},
};

if (webpackMode === 'development') {
	options.devtool = 'cheap-module-source-map';
} else {
	options.optimization = {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
			}),
		],
	};
}

module.exports = options;
