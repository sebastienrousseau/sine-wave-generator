/**
 * @jest-environment node
 */

"use strict";

const {
	SineWaveGenerator,
	CanvasError,
} = require("../src/sine-wave-generator.js");

describe("SineWaveGenerator without a DOM (SSR)", () => {
	it("throws a CanvasError instead of a raw ReferenceError", () => {
		expect(() => new SineWaveGenerator({ el: "#anything" })).toThrow(
			CanvasError,
		);
		expect(() => new SineWaveGenerator({ el: "#anything" })).toThrow(
			/server-side rendering/,
		);
	});
});
