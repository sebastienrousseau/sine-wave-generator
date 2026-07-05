"use strict";

/**
 * Shared browser API mocks for testing examples/example.js and
 * examples/react-quickstart.js in jsdom, which implements neither
 * canvas 2D rendering nor most media/observer APIs.
 */

const createMockMediaQueryList = (matches) => ({
	matches,
	media: "",
	addEventListener: jest.fn(),
	removeEventListener: jest.fn(),
	addListener: jest.fn(),
	removeListener: jest.fn(),
});

// Plain no-op functions, not jest.fn(): Jest retains every jest.fn() ever
// created for the life of the test file (for restoreAllMocks/reporting).
// These mocks get instantiated once per observed/drawn element across
// dozens of pages and tests — jest.fn() here caused unbounded memory
// growth. No test in this suite asserts on individual observe/draw
// calls, only that demos boot and interact without throwing.
const noop = () => {};

class MockResizeObserver {
	constructor(callback) {
		this.callback = callback;
		this.observe = noop;
		this.disconnect = noop;
		this.unobserve = noop;
	}
}

class MockIntersectionObserver {
	constructor(callback) {
		this.callback = callback;
		this.observe = noop;
		this.disconnect = noop;
		this.unobserve = noop;
	}

	trigger(isIntersecting) {
		this.callback([{ isIntersecting, target: null }]);
	}
}
const createMockCanvasContext = () => {
	const gradient = { addColorStop: noop };
	const ctx = {
		save: noop,
		restore: noop,
		translate: noop,
		rotate: noop,
		scale: noop,
		beginPath: noop,
		closePath: noop,
		moveTo: noop,
		lineTo: noop,
		arc: noop,
		stroke: noop,
		fill: noop,
		fillRect: noop,
		strokeRect: noop,
		clearRect: noop,
		fillText: noop,
		setTransform: noop,
		setLineDash: noop,
		createLinearGradient: () => gradient,
		gradient,
	};
	[
		"strokeStyle",
		"fillStyle",
		"lineWidth",
		"font",
		"textAlign",
		"textBaseline",
		"globalAlpha",
		"globalCompositeOperation",
		"shadowBlur",
		"shadowColor",
	].forEach((prop) => {
		let value;
		Object.defineProperty(ctx, prop, {
			get: () => value,
			set: (next) => {
				value = next;
			},
			enumerable: true,
		});
	});
	return ctx;
};

const createMockCanvas = (context, rectOverride) => {
	const canvas = document.createElement("canvas");
	canvas.getContext = jest.fn(() => context || createMockCanvasContext());
	canvas.getBoundingClientRect = jest.fn(
		() =>
			rectOverride || {
				width: 300,
				height: 220,
				top: 0,
				left: 0,
				right: 300,
				bottom: 220,
			},
	);
	return canvas;
};

const createMockAnalyser = () => ({
	fftSize: 0,
	smoothingTimeConstant: 0,
	frequencyBinCount: 32,
	_data: new Uint8Array(32),
	getByteFrequencyData: jest.fn((array) => array.fill(128)),
});

const createMockAudioContext = (analyser) => {
	const sourceNode = { connect: jest.fn(), disconnect: jest.fn() };
	return {
		destination: {},
		createAnalyser: jest.fn(() => analyser || createMockAnalyser()),
		createMediaElementSource: jest.fn(() => sourceNode),
		createMediaStreamSource: jest.fn(() => sourceNode),
		close: jest.fn(),
		_sourceNode: sourceNode,
	};
};

class MockMediaStream {
	getTracks() {
		return [{ stop: jest.fn() }];
	}
}

class MockMediaRecorder {
	constructor(stream, options) {
		this.stream = stream;
		this.options = options;
		this.state = "inactive";
		this.mimeType = (options && options.mimeType) || "audio/webm";
		this.ondataavailable = null;
		this.onstop = null;
	}

	start() {
		this.state = "recording";
	}

	stop() {
		this.state = "inactive";
		if (this.ondataavailable) {
			this.ondataavailable({ data: new Blob(["x"]) });
		}
		if (this.onstop) {
			this.onstop();
		}
	}

	static isTypeSupported() {
		return true;
	}
}

/**
 * Installs every mock this suite needs onto window/navigator/global.
 * Returns { restore, flushRaf }: requestAnimationFrame is a manually
 * drainable queue (not a jest.fn(), and not auto-firing) so tests can
 * run exactly one — or a few — real animation frames per demo via
 * flushRaf(), exercising each demo's actual draw/update logic without
 * risking runaway recursion from callbacks that reschedule themselves.
 */
const installBrowserMocks = () => {
	const originals = {
		matchMedia: window.matchMedia,
		ResizeObserver: global.ResizeObserver,
		IntersectionObserver: global.IntersectionObserver,
		AudioContext: window.AudioContext,
		webkitAudioContext: window.webkitAudioContext,
		MediaStream: global.MediaStream,
		MediaRecorder: window.MediaRecorder,
		mediaDevices: navigator.mediaDevices,
		clipboard: navigator.clipboard,
		execCommand: document.execCommand,
		requestAnimationFrame: window.requestAnimationFrame,
		cancelAnimationFrame: window.cancelAnimationFrame,
		createObjectURL: global.URL.createObjectURL,
		revokeObjectURL: global.URL.revokeObjectURL,
	};

	window.matchMedia = jest.fn(() => createMockMediaQueryList(false));
	global.ResizeObserver = MockResizeObserver;
	global.IntersectionObserver = MockIntersectionObserver;
	global.MediaStream = MockMediaStream;
	window.AudioContext = jest.fn(() => createMockAudioContext());
	window.MediaRecorder = MockMediaRecorder;
	global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
	global.URL.revokeObjectURL = jest.fn();
	Object.defineProperty(navigator, "mediaDevices", {
		configurable: true,
		writable: true,
		value: {
			getUserMedia: jest.fn(() => Promise.resolve(new MockMediaStream())),
		},
	});
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		writable: true,
		value: { writeText: jest.fn(() => Promise.resolve()) },
	});
	document.execCommand = jest.fn(() => true);

	let rafQueue = [];
	let nextRafId = 1;
	const cancelled = new Set();
	window.requestAnimationFrame = (callback) => {
		const id = nextRafId++;
		rafQueue.push({ id, callback });
		return id;
	};
	window.cancelAnimationFrame = (id) => {
		cancelled.add(id);
	};
	const flushRaf = (rounds = 1) => {
		for (let round = 0; round < rounds; round += 1) {
			const queue = rafQueue;
			rafQueue = [];
			queue.forEach(({ id, callback }) => {
				if (!cancelled.has(id)) {
					callback(round * 16.6667);
				}
			});
		}
	};

	const restore = () => {
		window.matchMedia = originals.matchMedia;
		global.ResizeObserver = originals.ResizeObserver;
		global.IntersectionObserver = originals.IntersectionObserver;
		global.MediaStream = originals.MediaStream;
		window.AudioContext = originals.AudioContext;
		window.webkitAudioContext = originals.webkitAudioContext;
		window.MediaRecorder = originals.MediaRecorder;
		Object.defineProperty(navigator, "mediaDevices", {
			configurable: true,
			writable: true,
			value: originals.mediaDevices,
		});
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			writable: true,
			value: originals.clipboard,
		});
		document.execCommand = originals.execCommand;
		window.requestAnimationFrame = originals.requestAnimationFrame;
		window.cancelAnimationFrame = originals.cancelAnimationFrame;
		global.URL.createObjectURL = originals.createObjectURL;
		global.URL.revokeObjectURL = originals.revokeObjectURL;
	};

	return { restore, flushRaf };
};

module.exports = {
	createMockMediaQueryList,
	MockResizeObserver,
	MockIntersectionObserver,
	createMockCanvasContext,
	createMockCanvas,
	createMockAnalyser,
	createMockAudioContext,
	MockMediaStream,
	MockMediaRecorder,
	installBrowserMocks,
};
