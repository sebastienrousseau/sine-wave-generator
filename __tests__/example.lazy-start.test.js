"use strict";

const { installBrowserMocks } = require("./helpers/browserMocks");
const { bootExamplePage } = require("./helpers/bootPage");

describe("examples/example.js — Lazy start via IntersectionObserver", () => {
	let restoreMocks;

	beforeEach(() => {
		const mocks = installBrowserMocks();
		restoreMocks = mocks.restore;
	});

	afterEach(() => {
		document.body.innerHTML = "";
		restoreMocks();
		jest.useRealTimers();
	});

	it("starts once the canvas intersects the viewport", () => {
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => {
				HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
					width: 300,
					height: 220,
					top: 5000,
					left: 0,
					right: 300,
					bottom: 5220,
				});
			},
		});
		expect(global.IntersectionObserver).toBeDefined();
	});

	it("starts immediately when IntersectionObserver is unsupported and off-screen", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
						width: 300,
						height: 220,
						top: 5000,
						left: 0,
						right: 300,
						bottom: 5220,
					});
					delete global.IntersectionObserver;
				},
			}),
		).not.toThrow();
	});
});
