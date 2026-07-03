"use strict";

const React = require("react");
const { render, cleanup } = require("@testing-library/react");
const { useSineWaveGenerator } = require("../src/use-sine-wave-generator.js");
const { SineWaveGenerator } = require("../src/sine-wave-generator.js");

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

const TestHarness = ({ options, capture }) => {
	const hookResult = useSineWaveGenerator(options);
	capture(hookResult);
	return React.createElement("canvas", { ref: hookResult.canvasRef });
};

const NoCanvasHarness = ({ options, capture }) => {
	const hookResult = useSineWaveGenerator(options);
	capture(hookResult);
	return null;
};

describe("useSineWaveGenerator", () => {
	let originalGetContext;
	let originalGetBoundingClientRect;
	let originalRaf;
	let originalCancel;

	beforeEach(() => {
		originalGetContext = HTMLCanvasElement.prototype.getContext;
		originalGetBoundingClientRect =
			HTMLCanvasElement.prototype.getBoundingClientRect;
		originalRaf = global.requestAnimationFrame;
		originalCancel = global.cancelAnimationFrame;
		HTMLCanvasElement.prototype.getContext = jest.fn(() => createMockContext());
		HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
			width: 200,
			height: 100,
			top: 0,
			left: 0,
			right: 200,
			bottom: 100,
		}));
		global.requestAnimationFrame = jest.fn(() => 1);
		global.cancelAnimationFrame = jest.fn();
	});

	afterEach(() => {
		cleanup();
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.getBoundingClientRect =
			originalGetBoundingClientRect;
		global.requestAnimationFrame = originalRaf;
		global.cancelAnimationFrame = originalCancel;
		jest.restoreAllMocks();
	});

	it("creates and starts a generator on mount, and destroys it on unmount", () => {
		let latest;
		const { unmount } = render(
			React.createElement(TestHarness, {
				options: {
					waves: [{ amplitude: 10, wavelength: 80, segmentLength: 10 }],
				},
				capture: (result) => {
					latest = result;
				},
			}),
		);

		expect(latest.canvasRef.current).toBeInstanceOf(HTMLCanvasElement);
		expect(latest.generatorRef.current).toBeInstanceOf(SineWaveGenerator);
		expect(latest.generatorRef.current.waves.length).toBe(1);
		expect(latest.generatorRef.current.animationFrameId).not.toBeNull();

		const generator = latest.generatorRef.current;
		const destroySpy = jest.spyOn(generator, "destroy");
		unmount();
		expect(destroySpy).toHaveBeenCalled();
		expect(latest.generatorRef.current).toBeNull();
	});

	it("defaults to an empty options object", () => {
		let latest;
		render(
			React.createElement(TestHarness, {
				options: undefined,
				capture: (result) => {
					latest = result;
				},
			}),
		);
		expect(latest.generatorRef.current).toBeInstanceOf(SineWaveGenerator);
		expect(latest.generatorRef.current.waves).toEqual([]);
	});

	it("replaces the wave stack via setWaves when the waves option changes", () => {
		let latest;
		const { rerender } = render(
			React.createElement(TestHarness, {
				options: {
					waves: [{ amplitude: 10, wavelength: 80, segmentLength: 10 }],
				},
				capture: (result) => {
					latest = result;
				},
			}),
		);
		const generator = latest.generatorRef.current;
		const setWavesSpy = jest.spyOn(generator, "setWaves");
		const nextWaves = [{ amplitude: 20, wavelength: 100, segmentLength: 10 }];

		rerender(
			React.createElement(TestHarness, {
				options: { waves: nextWaves },
				capture: (result) => {
					latest = result;
				},
			}),
		);

		expect(setWavesSpy).toHaveBeenCalledWith(nextWaves);
	});

	it("does not create a generator when no canvas element is mounted", () => {
		let latest;
		render(
			React.createElement(NoCanvasHarness, {
				options: {},
				capture: (result) => {
					latest = result;
				},
			}),
		);
		expect(latest.canvasRef.current).toBeNull();
		expect(latest.generatorRef.current).toBeNull();
	});

	it("does not call setWaves when the waves option is omitted", () => {
		let latest;
		const { rerender } = render(
			React.createElement(TestHarness, {
				options: {},
				capture: (result) => {
					latest = result;
				},
			}),
		);
		const generator = latest.generatorRef.current;
		const setWavesSpy = jest.spyOn(generator, "setWaves");

		rerender(
			React.createElement(TestHarness, {
				options: { autoResize: false },
				capture: (result) => {
					latest = result;
				},
			}),
		);

		expect(setWavesSpy).not.toHaveBeenCalled();
	});
});
