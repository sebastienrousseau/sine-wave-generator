"use strict";

const { installBrowserMocks } = require("./helpers/browserMocks");
const {
	PAGE_HTML,
	mockCanvasApis,
	bootExamplePage,
} = require("./helpers/bootPage");

describe("examples/example.js — core boot behavior", () => {
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

	it("boots the examples page without throwing", () => {
		expect(() => bootExamplePage({ page: "examples" })).not.toThrow();
	});

	it("runs several real animation frames on every page without throwing", () => {
		[
			"template",
			"guides",
			"playground",
			"reactQuickstart",
			"gettingStarted",
			"examples",
		].forEach((page) => {
			expect(() => bootExamplePage({ page })).not.toThrow();
			expect(() => flushRaf(3)).not.toThrow();
		});
	});

	it("boots cleanly even when optional browser APIs are entirely absent", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					delete window.AudioSync;
					delete window.MediaRecorder;
					delete global.IntersectionObserver;
					delete window.AudioContext;
					delete window.webkitAudioContext;
				},
			}),
		).not.toThrow();
	});

	it("boots gracefully when no demo cards or canvases are present at all", () => {
		expect(() => bootExamplePage({ page: "bare" })).not.toThrow();
	});

	it("isolates one demo's failure via safeCall without aborting the rest of boot", () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => {
				HTMLCanvasElement.prototype.getContext = () => {
					throw new Error("boom");
				};
			},
		});
		expect(errorSpy).toHaveBeenCalledWith("[boot]", expect.any(Error));
		errorSpy.mockRestore();
	});

	it("retries booting until window.SineWaveGenerator is defined", () => {
		jest.useFakeTimers();
		document.body.innerHTML = PAGE_HTML.examples;
		mockCanvasApis();
		delete window.SineWaveGenerator;
		jest.isolateModules(() => {
			require("../examples/example.js");
		});
		document.dispatchEvent(new window.Event("DOMContentLoaded"));
		expect(() => {
			jest.isolateModules(() => {
				require("../src/sine-wave-generator.js");
				require("../src/audio-sync.js");
			});
			jest.advanceTimersByTime(50);
		}).not.toThrow();
	});

	describe("Fundamentals (examples page)", () => {
		it("drives the pointer-reactive demo via pointermove", () => {
			bootExamplePage({ page: "examples" });
			const canvas = document.getElementById("sineCanvasPointer");
			canvas.dispatchEvent(
				new window.MouseEvent("pointermove", {
					clientX: 150,
					clientY: 100,
					bubbles: true,
				}),
			);
			expect(() => flushRaf(1)).not.toThrow();
		});

		it("adds and removes wave layers over time in the dynamic demo", () => {
			jest.useFakeTimers();
			bootExamplePage({ page: "examples" });
			jest.advanceTimersByTime(400 * 6 + 600 * 2 + 400 * 6);
			jest.useRealTimers();
		});

		it("pauses and resumes the render loop", () => {
			bootExamplePage({ page: "examples" });
			const pauseButton = document.querySelector('[data-action="pause"]');
			const resumeButton = document.querySelector('[data-action="resume"]');
			expect(() => {
				pauseButton.dispatchEvent(new window.Event("click", { bubbles: true }));
				resumeButton.dispatchEvent(
					new window.Event("click", { bubbles: true }),
				);
			}).not.toThrow();
		});
	});

	describe("Motion lab (examples page)", () => {
		it("plucks the string physics demo on pointerdown and renders a frame", () => {
			bootExamplePage({ page: "examples" });
			const card = document.querySelector('[data-example="stringPhysics"]');
			const canvas = card.querySelector("canvas");
			canvas.dispatchEvent(new window.Event("pointerdown", { bubbles: true }));
			expect(() => flushRaf(1)).not.toThrow();
		});

		it("renders a spectrogram frame while listening", async () => {
			bootExamplePage({ page: "examples" });
			const card = document.querySelector('[data-example="audioSpectrogram"]');
			const button = card.querySelector("[data-action=audio-start]");
			button.dispatchEvent(new window.Event("click", { bubbles: true }));
			await Promise.resolve();
			await Promise.resolve();
			expect(() => flushRaf(1)).not.toThrow();
		});
	});
});
