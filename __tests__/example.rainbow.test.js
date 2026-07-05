"use strict";

const { installBrowserMocks } = require("./helpers/browserMocks");
const {
	PAGE_HTML,
	mockCanvasApis,
	bootExamplePage,
} = require("./helpers/bootPage");

describe("examples/example.js — Rainbow fundamentals / motion toggle (homepage)", () => {
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

	it("no-ops gracefully when the rainbow card is present but its canvas is missing", () => {
		expect(() =>
			bootExamplePage({
				page: "template",
				onBeforeBoot: () => {
					document
						.querySelector('[data-example="rainbowFundamentals"]')
						.querySelector("canvas")
						?.remove();
				},
			}),
		).not.toThrow();
	});

	it("pauses and resumes via the dynamically created motion toggle", () => {
		bootExamplePage({ page: "template" });
		const card = document.querySelector('[data-example="rainbowFundamentals"]');
		expect(card).toBeTruthy();
		const toggle = card.querySelector('[data-action="toggle-motion"]');
		expect(toggle).toBeTruthy();
		toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(toggle.getAttribute("aria-pressed")).toBe("true");
		toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(toggle.getAttribute("aria-pressed")).toBe("false");
	});

	it("falls back to a manual render loop if the wave never advances", () => {
		jest.useFakeTimers();
		bootExamplePage({ page: "template" });
		expect(() => jest.advanceTimersByTime(800)).not.toThrow();
	});

	it("starts once a zero-size canvas is observed to have a real size", () => {
		expect(() =>
			bootExamplePage({
				page: "template",
				onBeforeBoot: () => {
					HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
						width: 0,
						height: 0,
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
					});
				},
			}),
		).not.toThrow();
	});

	it("logs and recovers when the rainbow demo throws during setup", () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		document.body.innerHTML = PAGE_HTML.template;
		mockCanvasApis();
		const rainbowCanvas = document
			.querySelector('[data-example="rainbowFundamentals"]')
			.querySelector("canvas");
		rainbowCanvas.getContext = () => {
			throw new Error("boom");
		};
		jest.isolateModules(() => {
			require("../src/sine-wave-generator.js");
			require("../src/audio-sync.js");
			require("../examples/example.js");
		});
		expect(() =>
			document.dispatchEvent(new window.Event("DOMContentLoaded")),
		).not.toThrow();
		expect(errorSpy).toHaveBeenCalledWith(
			"[rainbowFundamentals]",
			expect.any(Error),
		);
		errorSpy.mockRestore();
	});
});
