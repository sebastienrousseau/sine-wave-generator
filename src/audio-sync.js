/**
 * audio-sync.js v0.0.3
 *
 * Analyzes a live audio source (media element or microphone/stream) with the
 * Web Audio API and derives real-time metrics — frequency bands, energy, beat
 * detection, and BPM — so a SineWaveGenerator animation can react to music.
 *
 * Website:
 *
 * https://sine-wave-generator.com
 *
 * Source:
 *
 * https://github.com/sebastienrousseau/sine-wave-generator
 *
 * @requires AudioSync
 */

"use strict";

/**
 * @typedef {Object} AudioMetrics
 * @property {number} energy - Overall frequency-spectrum energy, normalized 0-1.
 * @property {number} bass - Low-frequency band energy, normalized 0-1.
 * @property {number} mid - Mid-frequency band energy, normalized 0-1.
 * @property {number} treble - High-frequency band energy, normalized 0-1.
 * @property {boolean} beat - True on the frame a beat was detected.
 * @property {number} beatPhase - Progress through the current beat cycle, 0-1.
 * @property {number|null} bpm - Manual or auto-detected tempo, or null if unknown.
 */

/**
 * @typedef {Object} AudioSyncOptions
 * @property {number} [fftSize=1024] - FFT size for the underlying AnalyserNode. Must be a power of 2.
 * @property {number} [smoothingTimeConstant=0.8] - Analyser smoothing, 0-1.
 * @property {number|null} [bpm=null] - Manual tempo override. Skips auto beat-interval detection for BPM and phase, driven by a clock anchored at the first update() call instead.
 */

// Constants
const DEFAULT_FFT_SIZE = 1024;
const DEFAULT_SMOOTHING = 0.8;
const BEAT_HISTORY_SIZE = 43;
const BEAT_THRESHOLD_BASE = 1.3;
const BEAT_THRESHOLD_VARIANCE_WEIGHT = -15;
const MIN_BEAT_THRESHOLD = 1.05;
const MIN_BEAT_ENERGY = 0.15;
const MIN_BEAT_INTERVAL_MS = 200;
const MAX_BEAT_INTERVAL_MS = 2000;
const BPM_HISTORY_SIZE = 8;
const MIN_BPM = 60;
const MAX_BPM = 200;
const MS_PER_MINUTE = 60000;

/**
 * Thrown when audio analysis cannot proceed (e.g. the Web Audio API is
 * unavailable, or an unsupported source was passed to `connect()`).
 * @class
 * @augments Error
 */
class AudioSyncError extends Error {
	/**
	 * Creates an instance of AudioSyncError.
	 * @param {string} message - A human-readable description of the failure.
	 */
	constructor(message) {
		super(message);
		this.name = "AudioSyncError";
	}
}

/**
 * Analyzes an audio source and derives beat/tempo/frequency metrics for
 * driving audio-reactive animations.
 * @class
 */
class AudioSync {
	/**
	 * Creates an instance of AudioSync.
	 * @param {AudioSyncOptions} [options] - Configuration options.
	 */
	constructor({
		fftSize = DEFAULT_FFT_SIZE,
		smoothingTimeConstant = DEFAULT_SMOOTHING,
		bpm = null,
	} = {}) {
		this.fftSize = fftSize;
		this.smoothingTimeConstant = smoothingTimeConstant;
		this.manualBpm =
			typeof bpm === "number" && Number.isFinite(bpm) && bpm > 0 ? bpm : null;
		this.audioContext = null;
		this.analyser = null;
		this.sourceNode = null;
		/** @type {Uint8Array<ArrayBuffer>|null} */
		this.frequencyData = null;
		/** @type {number[]} */
		this.energyHistory = [];
		/** @type {number[]} */
		this.beatIntervals = [];
		this.lastBeatTime = null;
		this.startTime = null;
		this.detectedBpm = null;
		this.metrics = {
			energy: 0,
			bass: 0,
			mid: 0,
			treble: 0,
			beat: false,
			beatPhase: 0,
			bpm: this.manualBpm,
		};
	}

	/**
	 * Whether an audio source is currently connected.
	 * @returns {boolean} - True if connected.
	 */
	get isConnected() {
		return this.analyser !== null;
	}

	/**
	 * Connects an audio source for analysis.
	 * @param {HTMLMediaElement|MediaStream} source - An audio/video element or a media stream (e.g. from getUserMedia).
	 * @returns {this} - The AudioSync instance for chaining.
	 * @throws {AudioSyncError} Throws if Web Audio API is unavailable or the source type is unsupported.
	 */
	connect(source) {
		if (this.isConnected) {
			this.disconnect();
		}
		const AudioContextClass =
			(typeof window !== "undefined" &&
				(window.AudioContext ||
					/** @type {any} */ (window).webkitAudioContext)) ||
			null;
		if (!AudioContextClass) {
			throw new AudioSyncError(
				"AudioSync requires a browser environment with Web Audio API support.",
			);
		}
		const isStream =
			typeof MediaStream !== "undefined" && source instanceof MediaStream;
		const isElement =
			typeof HTMLMediaElement !== "undefined" &&
			source instanceof HTMLMediaElement;
		if (!isStream && !isElement) {
			throw new AudioSyncError(
				"AudioSync.connect requires an HTMLMediaElement or a MediaStream.",
			);
		}
		this.audioContext = new AudioContextClass();
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = this.fftSize;
		this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
		this.sourceNode = isStream
			? this.audioContext.createMediaStreamSource(
					/** @type {MediaStream} */ (source),
				)
			: this.audioContext.createMediaElementSource(
					/** @type {HTMLMediaElement} */ (source),
				);
		this.sourceNode.connect(this.analyser);
		if (isElement) {
			this.sourceNode.connect(this.audioContext.destination);
		}
		this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
		return this;
	}

	/**
	 * Disconnects the current audio source and resets analysis state.
	 * @returns {this} - The AudioSync instance for chaining.
	 */
	disconnect() {
		if (this.sourceNode) {
			this.sourceNode.disconnect();
			this.sourceNode = null;
		}
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
		this.analyser = null;
		this.frequencyData = null;
		this.energyHistory = [];
		this.beatIntervals = [];
		this.lastBeatTime = null;
		this.startTime = null;
		this.detectedBpm = null;
		return this;
	}

	/**
	 * Averages a byte-frequency-data band and normalizes it to 0-1.
	 * @param {number} from - Start bin index (inclusive).
	 * @param {number} to - End bin index (exclusive).
	 * @returns {number} - The normalized band average.
	 */
	bandAverage(from, to) {
		const data = this.frequencyData;
		if (!data) {
			return 0;
		}
		let sum = 0;
		let count = 0;
		for (let i = from; i < to && i < data.length; i++) {
			sum += data[i];
			count++;
		}
		return count > 0 ? sum / count / 255 : 0;
	}

	/**
	 * Runs a variance-thresholded energy beat detector against the bass band
	 * and updates the rolling BPM estimate from detected beat intervals.
	 *
	 * Algorithm basis: a same-family variant of the classic energy-history
	 * technique popularized by Joe Sullivan's "Beat Detection Using
	 * JavaScript and the Web Audio API" — maintain a rolling window of
	 * recent instant energy, flag a beat when the current sample exceeds a
	 * variance-scaled multiple of the local average, and derive BPM from
	 * the median of recent inter-beat intervals. It is intentionally
	 * simple and cheap to run once per animation frame, not a novel or
	 * academically validated method.
	 *
	 * Known limitations:
	 * - Single-band trigger (bass only) — a track with its rhythmic
	 *   emphasis outside the low-frequency band (e.g. hi-hat-driven,
	 *   sparse bass) will under-detect.
	 * - BPM is only reported once two or more beats land within
	 *   {@link MIN_BEAT_INTERVAL_MS}–{@link MAX_BEAT_INTERVAL_MS} of each
	 *   other and the resulting tempo falls inside {@link MIN_BPM}–
	 *   {@link MAX_BPM} (60–200) — tempos outside that range are detected
	 *   as beats but never surfaced as a BPM value.
	 * - No onset/attack shaping, spectral flux, or multi-band fusion —
	 *   for material this heuristic under-serves (ambient, classical,
	 *   sparse/syncopated percussion), consider a dedicated library such
	 *   as `realtime-bpm-analyzer` or `web-audio-beat-detector`, or pass
	 *   a manual `bpm` to {@link AudioSync} instead of relying on
	 *   auto-detection.
	 *
	 * @param {number} bassEnergy - Normalized bass band energy for this frame.
	 * @param {number} timestampMs - The current timestamp in milliseconds.
	 * @returns {boolean} - True if a beat was detected this frame.
	 */
	detectBeat(bassEnergy, timestampMs) {
		this.energyHistory.push(bassEnergy);
		if (this.energyHistory.length > BEAT_HISTORY_SIZE) {
			this.energyHistory.shift();
		}
		const historyLength = this.energyHistory.length;
		const avg =
			this.energyHistory.reduce((sum, value) => sum + value, 0) / historyLength;
		const variance =
			this.energyHistory.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
			historyLength;
		const threshold = Math.max(
			MIN_BEAT_THRESHOLD,
			BEAT_THRESHOLD_VARIANCE_WEIGHT * variance + BEAT_THRESHOLD_BASE,
		);
		const timeSinceLastBeat =
			this.lastBeatTime === null ? Infinity : timestampMs - this.lastBeatTime;
		const isBeat =
			bassEnergy > MIN_BEAT_ENERGY &&
			bassEnergy > avg * threshold &&
			timeSinceLastBeat >= MIN_BEAT_INTERVAL_MS;
		if (!isBeat) {
			return false;
		}
		if (
			this.lastBeatTime !== null &&
			timeSinceLastBeat <= MAX_BEAT_INTERVAL_MS
		) {
			this.beatIntervals.push(timeSinceLastBeat);
			if (this.beatIntervals.length > BPM_HISTORY_SIZE) {
				this.beatIntervals.shift();
			}
		}
		this.lastBeatTime = timestampMs;
		if (this.beatIntervals.length > 0) {
			const sorted = [...this.beatIntervals].sort((a, b) => a - b);
			const medianInterval = sorted[Math.floor(sorted.length / 2)];
			const bpm = MS_PER_MINUTE / medianInterval;
			if (bpm >= MIN_BPM && bpm <= MAX_BPM) {
				this.detectedBpm = bpm;
			}
		}
		return true;
	}

	/**
	 * Computes progress (0-1) through the current beat cycle. Anchored to
	 * this.startTime when a manual BPM is set (a steady clock), or to the
	 * last detected beat when relying on auto-detection (self-correcting).
	 * @param {number} timestampMs - The current timestamp in milliseconds.
	 * @returns {number} - The beat phase, 0-1.
	 */
	beatPhase(timestampMs) {
		const bpm = this.manualBpm ?? this.detectedBpm;
		const anchor = this.manualBpm !== null ? this.startTime : this.lastBeatTime;
		if (!bpm || anchor === null) {
			return 0;
		}
		const periodMs = MS_PER_MINUTE / bpm;
		const elapsed = (timestampMs - anchor) % periodMs;
		return elapsed / periodMs;
	}

	/**
	 * Samples the connected audio source and refreshes derived metrics.
	 * No-ops (returning the last known metrics) if no source is connected.
	 * @param {number} timestampMs - The current timestamp in milliseconds, typically from requestAnimationFrame.
	 * @returns {AudioMetrics} - The refreshed metrics snapshot.
	 */
	update(timestampMs) {
		const analyser = this.analyser;
		const frequencyData = this.frequencyData;
		if (!analyser || !frequencyData) {
			return this.metrics;
		}
		const time = typeof timestampMs === "number" ? timestampMs : 0;
		if (this.startTime === null) {
			this.startTime = time;
		}
		analyser.getByteFrequencyData(frequencyData);
		const len = frequencyData.length;
		const bass = this.bandAverage(0, Math.floor(len * 0.1));
		const mid = this.bandAverage(Math.floor(len * 0.1), Math.floor(len * 0.5));
		const treble = this.bandAverage(Math.floor(len * 0.5), len);
		const energy = this.bandAverage(0, len);
		const beat = this.detectBeat(bass, time);
		this.metrics = {
			energy,
			bass,
			mid,
			treble,
			beat,
			beatPhase: this.beatPhase(time),
			bpm: this.manualBpm ?? this.detectedBpm,
		};
		return this.metrics;
	}

	/**
	 * Returns the last computed metrics snapshot without sampling again.
	 * @returns {AudioMetrics} - The current metrics.
	 */
	getMetrics() {
		return this.metrics;
	}
}

/* istanbul ignore next */
if (typeof window !== "undefined") {
	/** @type {any} */ (window).AudioSync = AudioSync;
	/** @type {any} */ (window).AudioSyncError = AudioSyncError;
}

/* istanbul ignore next */
if (typeof module !== "undefined" && module.exports) {
	module.exports = { AudioSync, AudioSyncError };
}
