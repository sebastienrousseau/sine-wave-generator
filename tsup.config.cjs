"use strict";

/**
 * tsup config for the npm package's dual ESM/CJS build.
 *
 * Covers the two framework-agnostic entry points only. `src/` remains the
 * canonical, unbundled source for both — consumers who prefer a zero-build
 * script tag, or a direct require of a source file under src, can keep
 * using it exactly as before; this build exists for import and require
 * consumers who want native ESM or a package-manager-resolved entry point.
 *
 * use-sine-wave-generator.js (the React hook) is intentionally excluded:
 * its real `require("react")` call can't be made to work under Node's
 * native ESM loader without a bundler's CJS interop, which every real
 * consumer of a React hook already has — a raw .mjs build would only
 * work for an artificial "no bundler" scenario nobody hits in practice.
 * It ships as raw source only, exactly as designed.
 */
module.exports = {
	entry: {
		"sine-wave-generator": "build-entries/sine-wave-generator.js",
		"audio-sync": "build-entries/audio-sync.js",
	},
	format: ["cjs", "esm"],
	outDir: "lib",
	dts: false,
	sourcemap: false,
	clean: true,
	splitting: false,
	minify: false,
};
