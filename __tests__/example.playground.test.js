"use strict";

const { installBrowserMocks } = require("./helpers/browserMocks");
const { bootExamplePage } = require("./helpers/bootPage");

describe("examples/example.js — Playground", () => {
	let restoreMocks;
	let flushRaf;

	beforeEach(() => {
		const mocks = installBrowserMocks();
		restoreMocks = mocks.restore;
		flushRaf = mocks.flushRaf;
	});

	afterEach(() => {
		document.body.innerHTML = "";
		restoreMocks();
		jest.useRealTimers();
	});

	it("switches through every preset (all easings, add and remove waves), copies config, and toggles fullscreen", () => {
		const writeText = jest.fn(() => Promise.resolve());
		bootExamplePage({
			page: "playground",
			onBeforeBoot: () => {
				navigator.clipboard = { writeText };
			},
		});
		const preset = document.getElementById("playgroundPreset");
		["ocean", "heartbeat", "highfreq", "stormy", "custom"].forEach((value) => {
			preset.value = value;
			preset.dispatchEvent(new window.Event("change", { bubbles: true }));
			expect(() => flushRaf(1)).not.toThrow();
		});
		const copyButton = document.getElementById("playgroundCopyConfig");
		copyButton.dispatchEvent(new window.Event("click", { bubbles: true }));
		const fullscreenButton = document.getElementById("playgroundFullscreen");
		expect(() =>
			fullscreenButton.dispatchEvent(
				new window.Event("click", { bubbles: true }),
			),
		).not.toThrow();
	});

	it("no-ops gracefully when the playground canvas is missing", () => {
		expect(() =>
			bootExamplePage({
				page: "playground",
				onBeforeBoot: () => {
					document.getElementById("playgroundCanvas")?.remove();
				},
			}),
		).not.toThrow();
	});

	it("no-ops gracefully when the playground canvas isn't inside a .playground-card", () => {
		expect(() =>
			bootExamplePage({
				page: "playground",
				onBeforeBoot: () => {
					const canvas = document.getElementById("playgroundCanvas");
					document.body.appendChild(canvas);
				},
			}),
		).not.toThrow();
	});
});
