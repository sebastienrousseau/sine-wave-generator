/**
 * webpack.config.js v0.1.0
 *
 * A simple webpack configuration file for the sine-wave-generator library.
 *
 * Website:
 *
 * https://sine-wave-generator.com
 *
 * Source:
 *
 * https://github.com/sebastienrousseau/sine-wave-generator
 *
 */

"use strict";

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
	plugins: [
		new HtmlWebpackPlugin({
			filename: "index.html",
			favicon: "favicon.ico",
			template: "src/template.html",
		}),
		new HtmlWebpackPlugin({
			filename: "getting-started/index.html",
			favicon: "favicon.ico",
			template: "src/getting-started.html",
		}),
		new HtmlWebpackPlugin({
			filename: "examples/index.html",
			favicon: "favicon.ico",
			template: "src/examples.html",
		}),
		new HtmlWebpackPlugin({
			filename: "playground/index.html",
			favicon: "favicon.ico",
			template: "src/playground.html",
		}),
		new HtmlWebpackPlugin({
			filename: "docs/api/index.html",
			favicon: "favicon.ico",
			template: "src/docs-api.html",
		}),
		new HtmlWebpackPlugin({
			filename: "guides/index.html",
			favicon: "favicon.ico",
			template: "src/guides.html",
		}),
		new HtmlWebpackPlugin({
			filename: "showcase/index.html",
			favicon: "favicon.ico",
			template: "src/showcase.html",
		}),
		new CopyPlugin({
			patterns: [
				{ from: "examples/reset.css", to: "." },
				{ from: "examples/example.js", to: "." },
				{ from: "LICENSE", to: "." },
				{ from: "sitemap.xml", to: "." },
				{ from: "robots.txt", to: "." },
			],
		}),
	],
	devServer: {
		static: "./dist",
		open: true,
	},
	entry: "./src/sine-wave-generator.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "main.js",
	},
	mode: "production",
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						passes: 2,
						drop_console: true,
						pure_getters: true,
						unsafe_math: true,
					},
					mangle: {
						properties: false,
					},
					output: {
						comments: false,
					},
				},
				extractComments: false,
			}),
		],
		usedExports: true,
		concatenateModules: true,
		moduleIds: "deterministic",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
};
