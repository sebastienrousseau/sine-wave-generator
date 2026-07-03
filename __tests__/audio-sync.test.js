"use strict";

const { AudioSync } = require("../src/audio-sync.js");

class MockMediaStream {}

const createMockAnalyser = () => {
	const analyser = {
		fftSize: 0,
		smoothingTimeConstant: 0,
		frequencyBinCount: 32,
		_data: new Uint8Array(32),
		getByteFrequencyData: jest.fn((array) => {
			array.set(analyser._data);
		}),
	};
	return analyser;
};

const createMockAudioContext = (analyser) => {
	const sourceNode = { connect: jest.fn(), disconnect: jest.fn() };
	return {
		destination: {},
		createAnalyser: jest.fn(() => analyser),
		createMediaElementSource: jest.fn(() => sourceNode),
		createMediaStreamSource: jest.fn(() => sourceNode),
		close: jest.fn(),
		_sourceNode: sourceNode,
	};
};

describe("AudioSync", () => {
	let analyser;
	let audioContext;
	let originalAudioContext;
	let originalWebkitAudioContext;
	let originalMediaStream;

	beforeEach(() => {
		analyser = createMockAnalyser();
		audioContext = createMockAudioContext(analyser);
		originalAudioContext = window.AudioContext;
		originalWebkitAudioContext = window.webkitAudioContext;
		originalMediaStream = global.MediaStream;
		window.AudioContext = jest.fn(() => audioContext);
		global.MediaStream = MockMediaStream;
	});

	afterEach(() => {
		window.AudioContext = originalAudioContext;
		window.webkitAudioContext = originalWebkitAudioContext;
		global.MediaStream = originalMediaStream;
	});

	it("uses default options", () => {
		const sync = new AudioSync();
		expect(sync.fftSize).toBe(1024);
		expect(sync.smoothingTimeConstant).toBe(0.8);
		expect(sync.manualBpm).toBeNull();
		expect(sync.isConnected).toBe(false);
		expect(sync.getMetrics()).toEqual({
			energy: 0,
			bass: 0,
			mid: 0,
			treble: 0,
			beat: false,
			beatPhase: 0,
			bpm: null,
		});
	});

	it("normalizes an invalid manual bpm to null", () => {
		expect(new AudioSync({ bpm: -5 }).manualBpm).toBeNull();
		expect(new AudioSync({ bpm: Number.NaN }).manualBpm).toBeNull();
		expect(new AudioSync({ bpm: "120" }).manualBpm).toBeNull();
		expect(new AudioSync({ bpm: 120 }).manualBpm).toBe(120);
	});

	it("returns cached metrics from update() when not connected", () => {
		const sync = new AudioSync();
		expect(sync.update(0)).toBe(sync.metrics);
	});

	it("throws when connecting without Web Audio API support", () => {
		window.AudioContext = undefined;
		window.webkitAudioContext = undefined;
		const sync = new AudioSync();
		const el = document.createElement("audio");
		expect(() => sync.connect(el)).toThrow(/Web Audio API/);
	});

	it("falls back to webkitAudioContext when AudioContext is unavailable", () => {
		window.AudioContext = undefined;
		window.webkitAudioContext = jest.fn(() => audioContext);
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		expect(sync.isConnected).toBe(true);
	});

	it("throws when connecting an unsupported source", () => {
		const sync = new AudioSync();
		expect(() => sync.connect({})).toThrow(
			"AudioSync.connect requires an HTMLMediaElement or a MediaStream.",
		);
	});

	it("connects to an HTMLMediaElement and wires it to the destination", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		expect(sync.isConnected).toBe(true);
		expect(audioContext.createMediaElementSource).toHaveBeenCalledWith(el);
		expect(audioContext._sourceNode.connect).toHaveBeenCalledWith(analyser);
		expect(audioContext._sourceNode.connect).toHaveBeenCalledWith(
			audioContext.destination,
		);
	});

	it("connects to a MediaStream without routing to the destination", () => {
		const sync = new AudioSync();
		const stream = new MockMediaStream();
		sync.connect(stream);
		expect(audioContext.createMediaStreamSource).toHaveBeenCalledWith(stream);
		expect(audioContext._sourceNode.connect).toHaveBeenCalledTimes(1);
	});

	it("reconnects cleanly when already connected", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		sync.connect(el);
		expect(audioContext.close).toHaveBeenCalledTimes(1);
	});

	it("disconnects and resets analysis state", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		sync.disconnect();
		expect(sync.isConnected).toBe(false);
		expect(audioContext._sourceNode.disconnect).toHaveBeenCalled();
		expect(audioContext.close).toHaveBeenCalled();
		expect(sync.energyHistory).toEqual([]);
		expect(sync.beatIntervals).toEqual([]);
		expect(sync.lastBeatTime).toBeNull();
		expect(sync.startTime).toBeNull();
		expect(sync.detectedBpm).toBeNull();
	});

	it("disconnect() is a no-op when nothing is connected", () => {
		const sync = new AudioSync();
		expect(() => sync.disconnect()).not.toThrow();
		expect(sync.isConnected).toBe(false);
	});

	it("records an in-range beat interval without adopting an implausible BPM", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		let time = 0;
		for (let i = 0; i < 10; i++) {
			analyser._data.fill(5);
			sync.update(time);
			time += 20;
		}
		const spike = () => {
			analyser._data.fill(0);
			for (let i = 0; i < 3; i++) {
				analyser._data[i] = 255;
			}
			return sync.update(time);
		};
		spike();
		time += 250; // 240bpm — within MIN/MAX interval bounds, but outside the plausible BPM range
		const metrics = spike();
		expect(metrics.beat).toBe(true);
		expect(sync.beatIntervals.length).toBeGreaterThan(0);
		expect(metrics.bpm).toBeNull();
	});

	it("computes zero band average for an empty range", () => {
		const sync = new AudioSync();
		sync.frequencyData = new Uint8Array(4);
		expect(sync.bandAverage(2, 2)).toBe(0);
	});

	it("uses fallback timestamp of 0 for non-numeric time", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		analyser._data.fill(0);
		const metrics = sync.update(undefined);
		expect(metrics.beat).toBe(false);
		expect(sync.startTime).toBe(0);
	});

	it("detects a beat when bass energy spikes above the rolling average", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		for (let i = 0; i < 10; i++) {
			analyser._data.fill(5);
			sync.update(i * 20);
		}
		analyser._data.fill(0);
		for (let i = 0; i < 3; i++) {
			analyser._data[i] = 255;
		}
		const metrics = sync.update(1000);
		expect(metrics.beat).toBe(true);
		expect(metrics.bass).toBeGreaterThan(0.15);
	});

	it("suppresses a second beat within the minimum interval", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		for (let i = 0; i < 10; i++) {
			analyser._data.fill(5);
			sync.update(i * 20);
		}
		analyser._data.fill(0);
		for (let i = 0; i < 3; i++) {
			analyser._data[i] = 255;
		}
		const first = sync.update(1000);
		const second = sync.update(1050);
		expect(first.beat).toBe(true);
		expect(second.beat).toBe(false);
	});

	it("derives a plausible BPM from repeated beat intervals", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		let time = 0;
		const settle = () => {
			for (let i = 0; i < 5; i++) {
				analyser._data.fill(5);
				sync.update(time);
				time += 20;
			}
		};
		const spike = () => {
			analyser._data.fill(0);
			for (let i = 0; i < 3; i++) {
				analyser._data[i] = 255;
			}
			const metrics = sync.update(time);
			time += 500;
			return metrics;
		};
		settle();
		spike();
		settle();
		const metrics = spike();
		expect(metrics.beat).toBe(true);
		expect(metrics.bpm).toBeGreaterThanOrEqual(60);
		expect(metrics.bpm).toBeLessThanOrEqual(200);
	});

	it("discards beat intervals outside the plausible BPM range", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		let time = 0;
		const settle = () => {
			for (let i = 0; i < 10; i++) {
				analyser._data.fill(5);
				sync.update(time);
				time += 20;
			}
		};
		const spike = () => {
			analyser._data.fill(0);
			for (let i = 0; i < 3; i++) {
				analyser._data[i] = 255;
			}
			return sync.update(time);
		};
		settle();
		spike();
		time += 5000;
		settle();
		const metrics = spike();
		expect(metrics.beat).toBe(true);
		expect(metrics.bpm).toBeNull();
	});

	it("caps the rolling energy history at its window size", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		for (let i = 0; i < 50; i++) {
			analyser._data.fill(5);
			sync.update(i * 20);
		}
		expect(sync.energyHistory.length).toBe(43);
	});

	it("caps the beat interval history used for BPM estimation", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		let time = 0;
		const settle = () => {
			for (let i = 0; i < 5; i++) {
				analyser._data.fill(5);
				sync.update(time);
				time += 20;
			}
		};
		const spike = () => {
			analyser._data.fill(0);
			for (let i = 0; i < 3; i++) {
				analyser._data[i] = 255;
			}
			sync.update(time);
			time += 500;
		};
		settle();
		for (let i = 0; i < 10; i++) {
			spike();
			settle();
		}
		expect(sync.beatIntervals.length).toBe(8);
	});

	it("computes beatPhase anchored to start time when a manual bpm is set", () => {
		const sync = new AudioSync({ bpm: 120 });
		const el = document.createElement("audio");
		sync.connect(el);
		analyser._data.fill(0);
		const first = sync.update(0);
		expect(first.beatPhase).toBe(0);
		expect(first.bpm).toBe(120);
		const mid = sync.update(250);
		expect(mid.beatPhase).toBeCloseTo(0.5, 5);
	});

	it("returns beatPhase 0 when bpm is unknown", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		analyser._data.fill(0);
		const metrics = sync.update(0);
		expect(metrics.beatPhase).toBe(0);
		expect(metrics.bpm).toBeNull();
	});

	it("getMetrics returns the last computed snapshot", () => {
		const sync = new AudioSync();
		const el = document.createElement("audio");
		sync.connect(el);
		analyser._data.fill(0);
		sync.update(0);
		expect(sync.getMetrics()).toBe(sync.metrics);
	});

	it("exposes AudioSync on window", () => {
		expect(window.AudioSync).toBe(AudioSync);
	});

	it("loads without window when required in isolation", () => {
		jest.resetModules();
		const originalWindow = global.window;
		global.window = undefined;
		const isolated = require("../src/audio-sync.js");
		global.window = originalWindow;
		expect(isolated.AudioSync).toBeDefined();
	});
});
