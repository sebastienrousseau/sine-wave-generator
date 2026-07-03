/**
 * use-sine-wave-generator.d.ts
 * TypeScript type definitions for the optional React hook.
 *
 * Kept separate from the package's main index.d.ts so consumers who don't
 * use React never need @types/react resolvable just to import the core
 * library's types.
 */

import type { MutableRefObject } from "react";
import type { SineWaveGenerator, SineWaveGeneratorOptions } from "../index";

/** Result of useSineWaveGenerator(). */
export interface UseSineWaveGeneratorResult {
	/** Attach to the target `<canvas>` element. */
	canvasRef: MutableRefObject<HTMLCanvasElement | null>;
	/** The live SineWaveGenerator instance once mounted (null before mount and after unmount). Call its methods (`addWave`, `setWaves`, `syncToAudio`, ...) to update it imperatively. */
	generatorRef: MutableRefObject<SineWaveGenerator | null>;
}

/**
 * Creates and manages a SineWaveGenerator bound to a canvas ref for the
 * lifetime of the component. The generator is created once, on mount, using
 * the options passed on the first render — pass a new `waves` array on a
 * later render to replace the wave stack via `setWaves()`; for any other
 * imperative update, call the corresponding method on `generatorRef.current`.
 */
export function useSineWaveGenerator(
	options?: Omit<SineWaveGeneratorOptions, "el">,
): UseSineWaveGeneratorResult;
