/**
 * use-sine-wave-generator.js v0.0.3
 *
 * A React hook that binds a SineWaveGenerator to a canvas ref: creates it
 * on mount, starts the animation loop, and destroys it on unmount.
 *
 * Website:
 *
 * https://sine-wave-generator.com
 *
 * Source:
 *
 * https://github.com/sebastienrousseau/sine-wave-generator
 *
 * @requires useSineWaveGenerator
 */

"use strict";

const { useEffect, useRef } = require("react");
const { SineWaveGenerator } = require("./sine-wave-generator.js");

/**
 * @typedef {Object} UseSineWaveGeneratorResult
 * @property {import('react').MutableRefObject<HTMLCanvasElement|null>} canvasRef - Attach to the target `<canvas>` element.
 * @property {import('react').MutableRefObject<SineWaveGenerator|null>} generatorRef - The live SineWaveGenerator instance once mounted (null before mount and after unmount). Call its methods (`addWave`, `setWaves`, `syncToAudio`, ...) to update it imperatively.
 */

/**
 * Creates and manages a SineWaveGenerator bound to a canvas ref for the
 * lifetime of the component. The generator is created once, on mount,
 * using the options passed on the first render — pass a new `waves` array
 * on a later render to replace the wave stack via `setWaves()`; for any
 * other imperative update (audio sync, quality presets, adding a single
 * wave, ...), call the corresponding method on `generatorRef.current`.
 * @param {Omit<import('../index').SineWaveGeneratorOptions, 'el'>} [options] - SineWaveGenerator options, minus `el` (the returned ref supplies it).
 * @returns {UseSineWaveGeneratorResult} - Refs for the canvas and the generator instance.
 */
const useSineWaveGenerator = (options = {}) => {
	/** @type {import('react').MutableRefObject<HTMLCanvasElement|null>} */
	const canvasRef = useRef(null);
	/** @type {import('react').MutableRefObject<SineWaveGenerator|null>} */
	const generatorRef = useRef(null);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return undefined;
		}
		const generator = new SineWaveGenerator({
			...optionsRef.current,
			el: canvas,
		});
		generatorRef.current = generator;
		generator.start();
		return () => {
			generator.destroy();
			generatorRef.current = null;
		};
		// Intentionally created once from the initial options — see the
		// waves-sync effect below and the generatorRef escape hatch for
		// any other later update.
	}, []);

	useEffect(() => {
		const generator = generatorRef.current;
		if (generator && options.waves) {
			generator.setWaves(options.waves);
		}
	}, [options.waves]);

	return { canvasRef, generatorRef };
};

module.exports = { useSineWaveGenerator };
