"use strict";

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
		HTMLCanvasElement.prototype.getContext = () => createMockCanvasContext();
		HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
			width: 300,
			height: 220,
			top: 0,
			left: 0,
			right: 300,
			bottom: 220,
		});
		global.requestAnimationFrame = () => 1;
		global.cancelAnimationFrame = () => {};
	});

	afterEach(() => {
		document.body.innerHTML = "";
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.getBoundingClientRect =
			originalGetBoundingClientRect;
		global.requestAnimationFrame = originalRaf;
		global.cancelAnimationFrame = originalCancel;
	});

	it("mounts the demo canvas into #react-quickstart-root when present", async () => {
		const { act } = require("react");
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

	it("does nothing when #react-quickstart-root is absent", () => {
		document.body.innerHTML = "";
		expect(() => {
			jest.isolateModules(() => {
				require("../examples/react-quickstart.js");
			});
		}).not.toThrow();
		expect(document.querySelector("canvas")).toBeNull();
	});
});
