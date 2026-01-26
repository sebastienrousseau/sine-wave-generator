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
const path = require("path");

module.exports = {
	plugins: [
		new HtmlWebpackPlugin({
			// Also generate a test.html
			filename: "index.html",
			favicon: "favicon.ico",
			template: "src/template.html",
		}),
		new CopyPlugin({
			patterns: [
				{ from: "examples/reset.css", to: "." },
				{ from: "examples/example.js", to: "." },
				{ from: "LICENSE", to: "." },
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
	mode: "production", // or 'production' for production builds
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
