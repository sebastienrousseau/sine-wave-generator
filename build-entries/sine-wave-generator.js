"use strict";

/**
 * Build-only entry point for tsup. Not published — the canonical source
 * is src/sine-wave-generator.js. This file exists purely so esbuild can
 * statically trace named exports for the ESM build output, which it can't
 * do through src/sine-wave-generator.js's conditional (script-tag-safe)
 * `module.exports` assignment.
 */
const mod = require("../src/sine-wave-generator.js");
const { SineWaveGenerator, Wave, Ease, ValidationError, CanvasError } = mod;

module.exports = {
	SineWaveGenerator,
	Wave,
	Ease,
	ValidationError,
	CanvasError,
};
export { SineWaveGenerator, Wave, Ease, ValidationError, CanvasError };
