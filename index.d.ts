/**
 * sine-wave-generator v0.0.3
 * TypeScript type definitions
 */

/** Easing functions for smooth animations. */
export namespace Ease {
	/** Smooth easing in and out animation. */
	function sineInOut(time: number, amplitude: number): number;
	/** Eased sine animation using the golden section. */
	function easedSine(percent: number, amplitude: number): number;
}

/** Configuration object for a wave. */
export interface WaveConfig {
	/** Initial phase offset (radians). Defaults to a random value. */
	phase?: number;
	/** Animation speed multiplier. Defaults to a random value between 0.5 and 1.0. */
	speed?: number;
	/** Wave height in pixels. Defaults to 10. */
	amplitude?: number;
	/** Distance between wave peaks in pixels. Defaults to 100. */
	wavelength?: number;
	/** Custom stroke color (CSS color string) or null for default gradient. Defaults to null. */
	strokeStyle?: string | null;
	/** Rendering segment length (lower = smoother). Must be > 0. Defaults to 10. */
	segmentLength?: number;
	/** Easing function for wave shape. Defaults to Ease.sineInOut. */
	easing?: (percent: number, amplitude: number) => number;
	/** Rotation angle in degrees (0-359). Defaults to 0. */
	rotate?: number;
}

/** Represents a wave for the sine wave generator. */
export class Wave {
	phase: number;
	speed: number;
	amplitude: number;
	wavelength: number;
	strokeStyle: string | null;
	segmentLength: number;
	easing: (percent: number, amplitude: number) => number;
	rotate: number;

	/** Creates an instance of Wave. Throws if config values are invalid. */
	constructor(config: WaveConfig);

	/** Validates the configuration values for the wave. Throws on invalid values. */
	validateConfig(config: {
		amplitude: number;
		wavelength: number;
		segmentLength: number;
		speed: number;
		rotate: number;
	}): void;

	/** Updates the wave's configuration. Returns the updated instance. */
	update(config: Partial<WaveConfig>): this;

	/** Generates a random configuration object for a wave. */
	static generateRandomConfig(): WaveConfig;
}

/** Options for initializing a SineWaveGenerator. */
export interface SineWaveGeneratorOptions {
	/** Canvas element or CSS selector. */
	el: HTMLCanvasElement | string;
	/** Array of wave configuration objects. Defaults to []. */
	waves?: WaveConfig[];
	/** Device pixel ratio override. */
	pixelRatio?: number;
	/** Maximum pixel ratio cap for memory/perf. Defaults to 2. */
	maxPixelRatio?: number;
	/** Automatically resize canvas on window resize. Defaults to true. */
	autoResize?: boolean;
}

/** Sine wave generator that animates waves on a canvas element. */
export class SineWaveGenerator {
	/** The canvas element. */
	el: HTMLCanvasElement;
	/** The 2D rendering context. */
	ctx: CanvasRenderingContext2D;
	/** Array of active Wave instances. */
	waves: Wave[];
	/** Whether events are currently bound. */
	eventsBound: boolean;
	/** Whether to auto-resize on window resize. */
	autoResize: boolean;
	/** Current pixel ratio. */
	pixelRatio: number;
	/** Maximum pixel ratio cap. */
	maxPixelRatio: number;
	/** Current display width in CSS pixels. */
	displayWidth: number;
	/** Current display height in CSS pixels. */
	displayHeight: number;
	/** Current gradient used for default stroke. */
	gradient: CanvasGradient | null;
	/** Current animation frame ID, or null if stopped. */
	animationFrameId: number | null;

	/** Creates an instance of SineWaveGenerator. Throws if canvas is invalid. */
	constructor(options: SineWaveGeneratorOptions);

	/** Start the animation loop. Returns this for chaining. */
	start(): this;
	/** Stop the animation loop and unbind events. Returns this for chaining. */
	stop(): this;
	/** Manually trigger canvas resize and gradient rebuild. Returns this for chaining. */
	resize(): this;
	/** Draw a single wave frame. Returns this for chaining. */
	drawWave(wave: Wave, deltaScale?: number): this;
	/** Add a wave dynamically at runtime. Returns this for chaining. */
	addWave(config: WaveConfig): this;
	/** Remove a wave by index. Returns this for chaining. */
	removeWave(index: number): this;
	/** Bind resize, mousemove, and touchmove events. Returns this for chaining. */
	bindEvents(): this;
	/** Unbind all events. Returns this for chaining. */
	unbindEvents(): this;
}
