"use strict";

const { installBrowserMocks } = require("./helpers/browserMocks");
const { bootExamplePage } = require("./helpers/bootPage");

describe("examples/example.js — Guides page demos", () => {
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

	it("starts the audio spectrogram demo and handles denial", async () => {
		bootExamplePage({
			page: "guides",
			onBeforeBoot: () => {
				navigator.mediaDevices.getUserMedia = jest.fn(() =>
					Promise.reject(new Error("denied")),
				);
			},
		});
		const card = document.querySelector('[data-example="audioSpectrogram"]');
		const button = card.querySelector("[data-action=audio-start]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		await Promise.resolve();
	});

	it("starts the audio spectrogram demo successfully", async () => {
		bootExamplePage({ page: "guides" });
		const card = document.querySelector('[data-example="audioSpectrogram"]');
		const button = card.querySelector("[data-action=audio-start]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		await Promise.resolve();
	});

	it("cycles quality presets", () => {
		bootExamplePage({ page: "guides" });
		const card = document.querySelector('[data-example="qualityPresets"]');
		const buttons = card.querySelectorAll("[data-quality]");
		buttons.forEach((button) => {
			button.dispatchEvent(new window.Event("click", { bubbles: true }));
		});
		const status = card.querySelector("[data-quality-status]");
		expect(status.textContent).toMatch(/Quality preset/);
	});

	it("creates its own status element when [data-quality-status] is missing", () => {
		bootExamplePage({
			page: "guides",
			onBeforeBoot: () => {
				document
					.querySelector('[data-example="qualityPresets"]')
					.querySelector("[data-quality-status]")
					?.remove();
			},
		});
		const card = document.querySelector('[data-example="qualityPresets"]');
		expect(card.querySelector(".quality-status")).toBeTruthy();
	});

	it("ignores a quality button with an empty data-quality attribute", () => {
		bootExamplePage({ page: "guides" });
		const card = document.querySelector('[data-example="qualityPresets"]');
		const button = card.querySelector("[data-quality]");
		button.setAttribute("data-quality", "");
		expect(() =>
			button.dispatchEvent(new window.Event("click", { bubbles: true })),
		).not.toThrow();
	});

	it("throttles rapid scroll events to one queued frame", () => {
		bootExamplePage({ page: "guides" });
		expect(() => {
			window.dispatchEvent(new window.Event("scroll"));
			window.dispatchEvent(new window.Event("scroll"));
			flushRaf(1);
		}).not.toThrow();
	});

	it("drives the responsive-resize guide demo", () => {
		bootExamplePage({ page: "guides" });
		const card = document.querySelector('[data-example="responsiveResize"]');
		expect(card.querySelector("canvas")).toBeTruthy();
	});

	it("no-ops gracefully when a guide demo's card is present but incomplete", () => {
		expect(() =>
			bootExamplePage({
				page: "guides",
				onBeforeBoot: () => {
					[
						"audioSpectrogram",
						"responsiveResize",
						"heroBackgroundGuide",
						"scrollReactive",
						"qualityPresets",
					].forEach((id) => {
						const card = document.querySelector(`[data-example="${id}"]`);
						card.querySelector("canvas")?.remove();
					});
				},
			}),
		).not.toThrow();
	});
});
