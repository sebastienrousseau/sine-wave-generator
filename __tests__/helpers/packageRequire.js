"use strict";

/**
 * A require() shim for executing documentation code snippets that
 * `require("@sebastienrousseau/sine-wave-generator")` as published
 * consumers would, mapped to this repo's own source (which isn't
 * npm-linked during local testing) — so docs are verified against the
 * real, current implementation rather than a hand-copied stand-in.
 */
const path = require("path");

const PACKAGE_NAME = "@sebastienrousseau/sine-wave-generator";

const MODULE_MAP = {
	[PACKAGE_NAME]: path.resolve(__dirname, "../../src/sine-wave-generator.js"),
	[`${PACKAGE_NAME}/audio-sync`]: path.resolve(
		__dirname,
		"../../src/audio-sync.js",
	),
	[`${PACKAGE_NAME}/use-sine-wave-generator`]: path.resolve(
		__dirname,
		"../../src/use-sine-wave-generator.js",
	),
};

const packageRequire = (specifier) => {
	if (MODULE_MAP[specifier]) {
		return require(MODULE_MAP[specifier]);
	}
	return require(specifier);
};

module.exports = { packageRequire, PACKAGE_NAME };
