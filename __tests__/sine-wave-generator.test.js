"use strict";

const { Ease, Wave, SineWaveGenerator } = require("../src/sine-wave-generator.js");

const createMockContext = () => {
	const gradient = { addColorStop: jest.fn() };
	return {
		gradient,
		save: jest.fn(),
		restore: jest.fn(),
		translate: jest.fn(),
		rotate: jest.fn(),
		beginPath: jest.fn(),
		moveTo: jest.fn(),
		lineTo: jest.fn(),
		stroke: jest.fn(),
		clearRect: jest.fn(),
		setTransform: jest.fn(),
		createLinearGradient: jest.fn(() => gradient),
		get strokeStyle() {
			return this._strokeStyle;
		},
		set strokeStyle(value) {
			this._strokeStyle = value;
		},
		get lineWidth() {
			return this._lineWidth;
		},
		set lineWidth(value) {
			this._lineWidth = value;
		},
	};
};

const createCanvas = (context, rectOverride) => {
	const canvas = document.createElement("canvas");
	canvas.getContext = jest.fn(() => context);
	canvas.getBoundingClientRect = jest.fn(() =>
		rectOverride || {
			width: 200,
			height: 100,
			top: 0,
			left: 0,
			right: 200,
			bottom: 100,
		},
	);
	return canvas;
};

describe("Ease helpers", () => {
	it("returns expected values for sineInOut", () => {
		expect(Ease.sineInOut(0, 10)).toBeCloseTo(5, 6);
		expect(Ease.sineInOut(1, 10)).toBeCloseTo(5, 6);
	});

	it("handles easedSine branches", () => {
		const goldenSection = (1 - 1 / 1.618033988749895) / 2;
		expect(Ease.easedSine(0, 10)).toBe(0);
		expect(Ease.easedSine(1, 10)).toBe(0);
		expect(Ease.easedSine(goldenSection, 10)).toBe(0);
		expect(Ease.easedSine(0.5, 10)).toBeGreaterThan(0);
	});
});

describe("Wave", () => {
	it("uses default values", () => {
		const wave = new Wave({});
		expect(wave.amplitude).toBe(10);
		expect(wave.wavelength).toBe(100);
		expect(wave.segmentLength).toBe(10);
	});

	it("validates configuration values", () => {
		expect(
			() =>
				new Wave({ amplitude: Number.NaN, wavelength: 100, segmentLength: 10 }),
		).toThrow("Amplitude and wavelength must be finite numbers.");
		expect(
			() => new Wave({ amplitude: 10, wavelength: 100, segmentLength: Number.NaN }),
		).toThrow("Segment length, speed, and rotate must be finite numbers.");
		expect(
			() => new Wave({ amplitude: -1, wavelength: 100, segmentLength: 10 }),
		).toThrow("Wave configuration values must be positive.");
		expect(
			() => new Wave({ amplitude: 10, wavelength: 100, segmentLength: 0 }),
		).toThrow("Wave configuration values must be positive.");
		expect(
			() => new Wave({ amplitude: 10, wavelength: 100, segmentLength: 10, rotate: -1 }),
		).toThrow("Rotate value must be between 0 and 360 degrees.");
		expect(
			() => new Wave({ amplitude: 10, wavelength: 100, segmentLength: 10, rotate: 360 }),
		).toThrow("Rotate value must be between 0 and 360 degrees.");
		const wave = new Wave({ amplitude: 10, wavelength: 100, segmentLength: 10 });
		expect(wave).toBeInstanceOf(Wave);
	});

	it("updates valid config and rejects invalid config", () => {
		const wave = new Wave({ amplitude: 10, wavelength: 100, segmentLength: 10 });
		const result = wave.update({ amplitude: 20 });
		expect(result).toBe(wave);
		expect(wave.amplitude).toBe(20);
		wave.update({ wavelength: 200, speed: 0.8, rotate: 90 });
		expect(wave.wavelength).toBe(200);
		expect(wave.speed).toBe(0.8);
		expect(wave.rotate).toBe(90);
		expect(() => wave.update({ segmentLength: 0 })).toThrow(
			"Wave configuration values must be positive.",
		);
	});

	it("generates random configs", () => {
		const config = Wave.generateRandomConfig();
		expect(config).toEqual(
			expect.objectContaining({
				phase: expect.any(Number),
				speed: expect.any(Number),
				amplitude: expect.any(Number),
				wavelength: expect.any(Number),
				strokeStyle: expect.any(String),
				segmentLength: expect.any(Number),
				easing: Ease.sineInOut,
				rotate: expect.any(Number),
			}),
		);
		expect(config.rotate).toBeGreaterThanOrEqual(0);
		expect(config.rotate).toBeLessThan(360);
	});
});

describe("SineWaveGenerator", () => {
	let originalRaf;
	let originalCancel;
	let originalDevicePixelRatio;
	let originalInnerWidth;
	let originalInnerHeight;

	beforeEach(() => {
		originalRaf = global.requestAnimationFrame;
		originalCancel = global.cancelAnimationFrame;
		originalDevicePixelRatio = window.devicePixelRatio;
		originalInnerWidth = window.innerWidth;
		originalInnerHeight = window.innerHeight;
		global.requestAnimationFrame = jest.fn(() => 123);
		global.cancelAnimationFrame = jest.fn();
	});

	afterEach(() => {
		global.requestAnimationFrame = originalRaf;
		global.cancelAnimationFrame = originalCancel;
		window.devicePixelRatio = originalDevicePixelRatio;
		window.innerWidth = originalInnerWidth;
		window.innerHeight = originalInnerHeight;
		jest.restoreAllMocks();
	});

	it("exposes the generator on window", () => {
		expect(window.SineWaveGenerator).toBe(SineWaveGenerator);
	});

	it("loads without window when required in isolation", () => {
		jest.resetModules();
		const originalWindow = global.window;
		global.window = undefined;
		const isolated = require("../src/sine-wave-generator.js");
		global.window = originalWindow;
		expect(isolated.SineWaveGenerator).toBeDefined();
	});

	it("throws for invalid elements", () => {
		expect(() => new SineWaveGenerator({ el: "#missing" })).toThrow(
			"SineWaveGenerator requires a valid canvas element.",
		);
		const div = document.createElement("div");
		expect(() => new SineWaveGenerator({ el: div })).toThrow(
			"SineWaveGenerator requires a valid canvas element.",
		);
	});

	it("throws when canvas has no context", () => {
		const canvas = document.createElement("canvas");
		canvas.getContext = jest.fn(() => null);
		expect(() => new SineWaveGenerator({ el: canvas })).toThrow(
			"SineWaveGenerator could not acquire a 2D rendering context.",
		);
	});

	it("stores waves and options", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const wave = new Wave({ amplitude: 12, wavelength: 80, segmentLength: 10 });
		const generator = new SineWaveGenerator({
			el: canvas,
			waves: [wave, { amplitude: 14, wavelength: 60, segmentLength: 8 }],
			pixelRatio: 1.5,
			maxPixelRatio: Number.NaN,
			autoResize: false,
		});
		expect(generator.waves[0]).toBe(wave);
		expect(generator.waves[1]).toBeInstanceOf(Wave);
		expect(generator.pixelRatio).toBe(1.5);
		expect(generator.maxPixelRatio).toBe(2);
	});

	it("uses device pixel ratio when no override is provided", () => {
		window.devicePixelRatio = 3;
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas, autoResize: false });
		expect(generator.pixelRatio).toBe(3);
	});

	it("defaults to pixel ratio 1 when device pixel ratio is falsy", () => {
		window.devicePixelRatio = 0;
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas, autoResize: false });
		expect(generator.pixelRatio).toBe(1);
	});

	it("binds and unbinds events", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const addSpy = jest.spyOn(window, "addEventListener");
		const removeSpy = jest.spyOn(window, "removeEventListener");
		const generator = new SineWaveGenerator({ el: canvas, autoResize: false });
		generator.bindEvents();
		generator.bindEvents();
		expect(addSpy).not.toHaveBeenCalledWith("resize", expect.any(Function));
		generator.eventsBound = false;
		generator.unbindEvents();
		expect(removeSpy).not.toHaveBeenCalledWith("resize", expect.any(Function));
		generator.bindEvents();
		generator.unbindEvents();
		expect(generator.eventsBound).toBe(false);
	});

	it("handles mouse and touch input", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas });
		generator.waves = [new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 })];
		generator.displayHeight = 0;
		generator.onMouseMove({ clientY: 50 });
		expect(generator.waves[0].phase).toBeDefined();
		generator.displayHeight = 100;
		generator.onMouseMove({ clientY: -10 });
		expect(generator.waves[0].phase).toBe(0);
		generator.onMouseMove({ clientY: 200 });
		expect(generator.waves[0].phase).toBe(Math.PI * 2);
		generator.displayHeight = 0;
		generator.onTouchMove({ touches: [{ clientY: 20 }] });
		generator.displayHeight = 100;
		generator.onTouchMove({ touches: [] });
		generator.onTouchMove({ touches: [{ clientY: 50 }] });
		expect(generator.waves[0].phase).toBeCloseTo(Math.PI, 6);
	});

	it("starts and stops animation", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas });
		generator.waves = [
			new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 }),
		];
		const resizeSpy = jest.spyOn(generator, "resize");
		let drawCount = 0;
		global.requestAnimationFrame = jest.fn((callback) => {
			drawCount += 1;
			if (drawCount === 1) {
				callback(1000);
			} else if (drawCount === 2) {
				callback(1016);
			}
			return 123;
		});
		generator.start();
		expect(resizeSpy).toHaveBeenCalled();
		expect(global.requestAnimationFrame).toHaveBeenCalled();
		generator.animationFrameId = 99;
		const callCount = global.requestAnimationFrame.mock.calls.length;
		generator.start();
		expect(global.requestAnimationFrame.mock.calls.length).toBe(callCount);
		generator.stop();
		expect(global.cancelAnimationFrame).toHaveBeenCalledWith(99);
		expect(generator.animationFrameId).toBeNull();
	});

	it("retries when canvas size is zero and then recovers", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx, { width: 0, height: 0 });
		const generator = new SineWaveGenerator({ el: canvas });
		generator.waves = [
			new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 }),
		];
		generator.displayWidth = 0;
		generator.displayHeight = 0;
		let resizeCount = 0;
		jest.spyOn(generator, "resize").mockImplementation(() => {
			resizeCount += 1;
			if (resizeCount === 1) {
				generator.displayWidth = 0;
				generator.displayHeight = 0;
			} else {
				generator.displayWidth = 100;
				generator.displayHeight = 50;
			}
			return generator;
		});
		let rafCount = 0;
		global.requestAnimationFrame = jest.fn((callback) => {
			rafCount += 1;
			if (rafCount === 1) {
				callback();
			}
			return 321;
		});
		generator.start();
		expect(ctx.clearRect).toHaveBeenCalled();
	});

	it("waits for layout when canvas size stays zero", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx, { width: 0, height: 0 });
		const generator = new SineWaveGenerator({ el: canvas });
		generator.waves = [
			new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 }),
		];
		jest.spyOn(generator, "resize").mockImplementation(() => generator);
		let rafCount = 0;
		global.requestAnimationFrame = jest.fn((callback) => {
			rafCount += 1;
			if (rafCount === 1) {
				callback();
			}
			return 654;
		});
		generator.start();
		expect(global.requestAnimationFrame).toHaveBeenCalledTimes(2);
		expect(ctx.clearRect).not.toHaveBeenCalled();
	});

	it("sets a fallback frame time when timestamp is missing", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas });
		generator.waves = [
			new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 }),
		];
		let rafCount = 0;
		global.requestAnimationFrame = jest.fn((callback) => {
			rafCount += 1;
			if (rafCount === 1) {
				callback(null);
			}
			return 777;
		});
		generator.start();
		expect(generator.lastFrameTime).toBe(0);
	});

	it("schedules another frame when height is still zero after resize", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx, { width: 0, height: 0 });
		const generator = new SineWaveGenerator({ el: canvas });
		generator.waves = [
			new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 }),
		];
		jest.spyOn(generator, "resize").mockImplementation(() => {
			generator.displayWidth = 100;
			generator.displayHeight = 0;
			return generator;
		});
		let rafCount = 0;
		global.requestAnimationFrame = jest.fn((callback) => {
			rafCount += 1;
			if (rafCount === 1) {
				callback();
			}
			return 987;
		});
		generator.start();
		expect(global.requestAnimationFrame).toHaveBeenCalledTimes(2);
		expect(ctx.clearRect).not.toHaveBeenCalled();
	});

	it("stops cleanly when no animation frame is active", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas });
		generator.animationFrameId = null;
		generator.stop();
		expect(global.cancelAnimationFrame).not.toHaveBeenCalled();
	});

	it("resizes canvas and creates gradients", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({
			el: canvas,
			pixelRatio: 4,
			maxPixelRatio: 2,
		});
		generator.resize();
		expect(canvas.width).toBe(400);
		expect(canvas.height).toBe(200);
		expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
		expect(ctx.gradient.addColorStop).toHaveBeenCalledTimes(3);
		ctx.setTransform.mockClear();
		generator.resize();
		expect(ctx.setTransform).not.toHaveBeenCalled();
	});

	it("falls back to window dimensions when rect is empty", () => {
		window.innerWidth = 320;
		window.innerHeight = 240;
		const ctx = createMockContext();
		const canvas = createCanvas(ctx, { width: 0, height: 0 });
		const generator = new SineWaveGenerator({ el: canvas, autoResize: false });
		generator.resize();
		expect(generator.displayWidth).toBe(320);
		expect(generator.displayHeight).toBe(240);
	});

	it("draws waves with rotation and styles", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas });
		generator.resize();
		const wave = new Wave({
			amplitude: 10,
			wavelength: 80,
			segmentLength: 4,
			speed: 0.5,
			rotate: 45,
		});
		wave.easing = null;
		const startingPhase = wave.phase;
		generator.drawWave(wave);
		expect(ctx.translate).toHaveBeenCalled();
		expect(ctx.rotate).toHaveBeenCalled();
		expect(ctx.strokeStyle).toBe(generator.gradient);
		expect(wave.phase).toBeCloseTo(startingPhase + Math.PI, 6);
		const styledWave = new Wave({
			amplitude: 8,
			wavelength: 60,
			segmentLength: 5,
			strokeStyle: "rgba(0,0,0,0.5)",
		});
		generator.drawWave(styledWave);
		expect(ctx.strokeStyle).toBe("rgba(0,0,0,0.5)");
	});

	it("adds and removes waves", () => {
		const ctx = createMockContext();
		const canvas = createCanvas(ctx);
		const generator = new SineWaveGenerator({ el: canvas });
		expect(() => generator.addWave(null)).toThrow(
			"Invalid wave configuration provided.",
		);
		const wave = new Wave({ amplitude: 10, wavelength: 80, segmentLength: 10 });
		generator.addWave(wave);
		generator.addWave({ amplitude: 12, wavelength: 90, segmentLength: 10 });
		expect(generator.waves[generator.waves.length - 1]).toBeInstanceOf(Wave);
		expect(() => generator.removeWave(999)).toThrow("Wave index out of bounds.");
		const count = generator.waves.length;
		generator.removeWave(count - 1);
		expect(generator.waves.length).toBe(count - 1);
	});
});
