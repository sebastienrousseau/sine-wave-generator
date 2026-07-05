"use strict";

const { act } = require("react");
const { installBrowserMocks } = require("./helpers/browserMocks");

const createMockCanvasContext = () => {
	const gradient = { addColorStop: () => {} };
	const ctx = {
		save: () => {},
		restore: () => {},
		translate: () => {},
		rotate: () => {},
		beginPath: () => {},
		moveTo: () => {},
		lineTo: () => {},
		stroke: () => {},
		clearRect: () => {},
		setTransform: () => {},
		createLinearGradient: () => gradient,
		gradient,
	};
	["strokeStyle", "lineWidth"].forEach((prop) => {
		let value;
		Object.defineProperty(ctx, prop, {
			get: () => value,
			set: (next) => {
				value = next;
			},
		});
	});
	return ctx;
};

describe("examples/react-quickstart.js", () => {
	let restoreMocks;
	let originalGetContext;
	let originalGetBoundingClientRect;

	beforeEach(() => {
		restoreMocks = installBrowserMocks().restore;
		originalGetContext = HTMLCanvasElement.prototype.getContext;
		originalGetBoundingClientRect =
			HTMLCanvasElement.prototype.getBoundingClientRect;
		HTMLCanvasElement.prototype.getContext = () => createMockCanvasContext();
		HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
			width: 300,
			height: 220,
			top: 0,
			left: 0,
			right: 300,
			bottom: 220,
		});
	});

	afterEach(() => {
		document.body.innerHTML = "";
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.getBoundingClientRect =
			originalGetBoundingClientRect;
		restoreMocks();
	});

	it("mounts the demo canvas into #react-quickstart-root when present", async () => {
		document.body.innerHTML = '<div id="react-quickstart-root"></div>';
		await act(async () => {
			jest.isolateModules(() => {
				require("../examples/react-quickstart.js");
			});
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		const root = document.getElementById("react-quickstart-root");
		const canvas = root.querySelector("canvas");
		expect(canvas).toBeInstanceOf(HTMLCanvasElement);
		expect(canvas.getAttribute("aria-label")).toBe("React sine wave demo");
	});

	it("does nothing when none of the mount points are present", () => {
		document.body.innerHTML = "";
		expect(() => {
			jest.isolateModules(() => {
				require("../examples/react-quickstart.js");
			});
		}).not.toThrow();
		expect(document.querySelector("canvas")).toBeNull();
	});

	it("mounts the hero-background demo into #react-hero-root when present", async () => {
		document.body.innerHTML = '<div id="react-hero-root"></div>';
		await act(async () => {
			jest.isolateModules(() => {
				require("../examples/react-quickstart.js");
			});
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		const root = document.getElementById("react-hero-root");
		const canvas = root.querySelector("canvas");
		expect(canvas).toBeInstanceOf(HTMLCanvasElement);
		expect(canvas.getAttribute("aria-label")).toBe(
			"Hero background React demo",
		);
	});

	it("mounts the audio-reactive demo and starts/stops listening", async () => {
		document.body.innerHTML = '<div id="react-audio-root"></div>';
		await act(async () => {
			jest.isolateModules(() => {
				require("../examples/react-quickstart.js");
			});
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		const root = document.getElementById("react-audio-root");
		const canvas = root.querySelector("canvas");
		expect(canvas.getAttribute("aria-label")).toBe(
			"Audio-reactive React demo",
		);
		const button = root.querySelector("button");
		expect(button.textContent).toBe("Start listening");

		await act(async () => {
			button.click();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(root.querySelector("span").textContent).toMatch(/Listening/);
		expect(button.textContent).toBe("Stop");

		await act(async () => {
			button.click();
		});
		expect(root.querySelector("span").textContent).toBe("Idle");
		expect(button.textContent).toBe("Start listening");
	});

	it("reports blocked microphone access when getUserMedia rejects", async () => {
		navigator.mediaDevices.getUserMedia = jest.fn(() =>
			Promise.reject(new Error("denied")),
		);
		document.body.innerHTML = '<div id="react-audio-root"></div>';
		await act(async () => {
			jest.isolateModules(() => {
				require("../examples/react-quickstart.js");
			});
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		const root = document.getElementById("react-audio-root");
		const button = root.querySelector("button");
		await act(async () => {
			button.click();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(root.querySelector("span").textContent).toBe(
			"Microphone access blocked",
		);
	});
});
