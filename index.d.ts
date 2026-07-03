/**
 * sine-wave-generator v0.0.3
 * TypeScript type definitions
 */

/** Thrown when a configuration object or argument fails validation. */
export class ValidationError extends Error {
	constructor(message: string);
}

/** Thrown when a canvas element or its 2D rendering context is missing or unusable. */
export class CanvasError extends Error {
	constructor(message: string);
}

/** Thrown when audio analysis cannot proceed (unsupported environment or source). */
export class AudioSyncError extends Error {
	constructor(message: string);
}

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

	/** Creates an instance of Wave. Throws ValidationError if config values are invalid. */
	constructor(config: WaveConfig);

	/** Validates the configuration values for the wave. Throws ValidationError on invalid values. */
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
	/** Device pixel ratio override. When omitted, tracked automatically and updated live on display changes. */
	pixelRatio?: number;
	/** Maximum pixel ratio cap for memory/perf. Defaults to 2. */
	maxPixelRatio?: number;
	/** Automatically resize when the canvas element's box size changes (ResizeObserver) or the window resizes. Defaults to true. */
	autoResize?: boolean;
	/** Honor prefers-reduced-motion by scaling animation speed down. Defaults to true. */
	respectReducedMotion?: boolean;
	/** Speed multiplier applied while reduced motion is preferred. Defaults to 0.25. */
	reducedMotionScale?: number;
	/** Accessible label for the canvas (sets role="img"). Omit to mark the canvas aria-hidden as decorative. */
	ariaLabel?: string | null;
	/** Default gradient palette. "auto" follows prefers-color-scheme live; "light"/"dark" force a palette. Defaults to "auto". */
	colorScheme?: "auto" | "light" | "dark";
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
	/** Whether to auto-resize on window resize / canvas box changes. */
	autoResize: boolean;
	/** Current pixel ratio. */
	pixelRatio: number;
	/** Whether pixelRatio is tracked automatically (true) or was explicitly overridden (false). */
	autoPixelRatio: boolean;
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
	/** Whether prefers-reduced-motion is honored. */
	respectReducedMotion: boolean;
	/** Speed multiplier applied while reduced motion is preferred. */
	reducedMotionScale: number;
	/** Current prefers-reduced-motion state. */
	prefersReducedMotion: boolean;
	/** The configured color scheme mode ("auto", "light", or "dark"). */
	colorScheme: "auto" | "light" | "dark";
	/** The currently resolved color scheme used for the default gradient. */
	resolvedColorScheme: "light" | "dark";

	/** Creates an instance of SineWaveGenerator. Throws CanvasError if there is no DOM or the canvas is invalid. */
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
	/** Replace all waves in a single update. Returns this for chaining. */
	setWaves(waves: WaveConfig[] | Wave[]): this;
	/** Apply a quality preset. Returns this for chaining. */
	setQualityPreset(preset: "quality" | "balanced" | "battery"): this;
	/** Stop and unbind events. Returns this for chaining. */
	destroy(): this;
	/** Bind resize, mousemove, touchmove, and responsiveness/accessibility listeners. Returns this for chaining. */
	bindEvents(): this;
	/** Unbind all events and listeners. Returns this for chaining. */
	unbindEvents(): this;
	/** Detects the current prefers-reduced-motion state. */
	detectPrefersReducedMotion(): boolean;
	/** Observes the canvas element's box size via ResizeObserver, if supported. */
	bindResizeObserver(): void;
	/** Disconnects the ResizeObserver bound by bindResizeObserver(), if any. */
	unbindResizeObserver(): void;
	/** Subscribes to live prefers-reduced-motion changes, if supported. */
	bindReducedMotionListener(): void;
	/** Unsubscribes the listener bound by bindReducedMotionListener(), if any. */
	unbindReducedMotionListener(): void;
	/** Subscribes to live devicePixelRatio changes, if pixelRatio was not explicitly set. */
	bindResolutionListener(): void;
	/** Unsubscribes the listener bound by bindResolutionListener(), if any. */
	unbindResolutionListener(): void;
	/** Re-reads devicePixelRatio, resizes to match, and re-registers the resolution listener. */
	updatePixelRatio(): void;
	/** Resolves the effective color scheme from the colorScheme option and prefers-color-scheme. */
	detectColorScheme(): "light" | "dark";
	/** Subscribes to live prefers-color-scheme changes, if colorScheme is "auto". */
	bindColorSchemeListener(): void;
	/** Unsubscribes the listener bound by bindColorSchemeListener(), if any. */
	unbindColorSchemeListener(): void;
	/** Bind an audio source's live metrics to wave parameters. Returns this for chaining. */
	syncToAudio(
		audioSync: { update(timestampMs: number): AudioMetrics },
		mapping?: AudioMapping,
	): this;
	/** Detach the bound audio source and restore original wave parameters. Returns this for chaining. */
	unsyncAudio(): this;
	/** Sample the bound audio source and modulate wave parameters. No-op if unbound. Returns this for chaining. */
	applyAudioSync(time: number): this;
}

/** A single wave-property audio mapping entry. */
export interface AudioMappingEntry {
	/** The metric driving this property. */
	source: "energy" | "bass" | "mid" | "treble";
	/** Scales the metric's effect on the property. */
	intensity: number;
}

/** Per-wave-property audio mapping passed to `syncToAudio`. */
export interface AudioMapping {
	amplitude?: AudioMappingEntry;
	speed?: AudioMappingEntry;
	rotate?: AudioMappingEntry;
}

/** Real-time metrics derived from an analyzed audio source. */
export interface AudioMetrics {
	/** Overall frequency-spectrum energy, normalized 0-1. */
	energy: number;
	/** Low-frequency band energy, normalized 0-1. */
	bass: number;
	/** Mid-frequency band energy, normalized 0-1. */
	mid: number;
	/** High-frequency band energy, normalized 0-1. */
	treble: number;
	/** True on the frame a beat was detected. */
	beat: boolean;
	/** Progress through the current beat cycle, 0-1. */
	beatPhase: number;
	/** Manual or auto-detected tempo, or null if unknown. */
	bpm: number | null;
}

/** Options for initializing an AudioSync instance. */
export interface AudioSyncOptions {
	/** FFT size for the underlying AnalyserNode. Must be a power of 2. Defaults to 1024. */
	fftSize?: number;
	/** Analyser smoothing, 0-1. Defaults to 0.8. */
	smoothingTimeConstant?: number;
	/** Manual tempo override. Defaults to null (auto-detected). */
	bpm?: number | null;
}

/** Analyzes an audio source and derives beat/tempo/frequency metrics for driving audio-reactive animations. */
export class AudioSync {
	fftSize: number;
	smoothingTimeConstant: number;
	manualBpm: number | null;

	/** Creates an instance of AudioSync. */
	constructor(options?: AudioSyncOptions);

	/** Whether an audio source is currently connected. */
	readonly isConnected: boolean;

	/** Connects an audio source for analysis. Throws AudioSyncError if unsupported. Returns this for chaining. */
	connect(source: HTMLMediaElement | MediaStream): this;
	/** Disconnects the current audio source and resets analysis state. Returns this for chaining. */
	disconnect(): this;
	/** Samples the connected audio source and refreshes derived metrics. */
	update(timestampMs: number): AudioMetrics;
	/** Returns the last computed metrics snapshot without sampling again. */
	getMetrics(): AudioMetrics;
}
