"use strict";

const {
	installBrowserMocks,
	createMockCanvasContext,
} = require("./helpers/browserMocks");
const {
	PAGE_HTML,
	mockCanvasApis,
	bootExamplePage,
} = require("./helpers/bootPage");

describe("examples/example.js — Rhythm & signal (examples page)", () => {
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

	it("lets the search-mic-wave demo start and stop listening", async () => {
		bootExamplePage({ page: "examples" });
		const card = document.querySelector('[data-example="searchMicWave"]');
		const button = card.querySelector("[data-action=mic-start]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		await Promise.resolve();
		expect(button.textContent).toBe("Stop");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(button.textContent).toBe("Start listening");
	});

	it("reports 'Not supported' when AudioSync is unavailable", async () => {
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => delete window.AudioSync,
		});
		const card = document.querySelector('[data-example="searchMicWave"]');
		const button = card.querySelector("[data-action=mic-start]");
		const status = card.querySelector("[data-mic-status]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		expect(status.textContent).toBe("Not supported");
	});

	it("reports blocked microphone access on getUserMedia rejection", async () => {
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => {
				navigator.mediaDevices.getUserMedia = jest.fn(() =>
					Promise.reject(new Error("denied")),
				);
			},
		});
		const card = document.querySelector('[data-example="searchMicWave"]');
		const button = card.querySelector("[data-action=mic-start]");
		const status = card.querySelector("[data-mic-status]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		await Promise.resolve();
		expect(status.textContent).toBe("Microphone access blocked");
	});

	it("records, previews live, and plays back audio", async () => {
		bootExamplePage({ page: "examples" });
		const card = document.querySelector('[data-example="voiceRecorder"]');
		const button = card.querySelector("[data-action=record-toggle]");
		const status = card.querySelector("[data-record-status]");
		const playback = card.querySelector("[data-playback]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		await Promise.resolve();
		expect(status.textContent).toBe("Recording — speak now");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(status.textContent).toBe("Idle");
		expect(playback.hidden).toBe(false);
	});

	it("reports 'Not supported' for the recorder when MediaRecorder is missing", async () => {
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => delete window.MediaRecorder,
		});
		const card = document.querySelector('[data-example="voiceRecorder"]');
		const button = card.querySelector("[data-action=record-toggle]");
		const status = card.querySelector("[data-record-status]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		expect(status.textContent).toBe("Not supported");
	});

	it("reports blocked microphone access for the recorder on rejection", async () => {
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => {
				navigator.mediaDevices.getUserMedia = jest.fn(() =>
					Promise.reject(new Error("denied")),
				);
			},
		});
		const card = document.querySelector('[data-example="voiceRecorder"]');
		const button = card.querySelector("[data-action=record-toggle]");
		const status = card.querySelector("[data-record-status]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
		await Promise.resolve();
		expect(status.textContent).toBe("Microphone access blocked");
	});

	it("toggles reduced motion on demand", () => {
		bootExamplePage({ page: "examples" });
		const card = document.querySelector('[data-example="reducedMotionDemo"]');
		const button = card.querySelector("[data-action=toggle-reduced-motion]");
		const status = card.querySelector("[data-reduced-motion-status]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(status.textContent).toMatch(/Reduced motion ON/);
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(status.textContent).toMatch(/Reduced motion OFF/);
	});

	it("toggles the adaptive color scheme on demand", () => {
		bootExamplePage({ page: "examples" });
		const card = document.querySelector('[data-example="colorSchemeDemo"]');
		const button = card.querySelector("[data-action=toggle-color-scheme]");
		const status = card.querySelector("[data-color-scheme-status]");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(status.textContent).toBe("Palette: dark");
		button.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(status.textContent).toBe("Palette: light");
	});

	it("updates a data-control slider's value and label", () => {
		bootExamplePage({ page: "examples" });
		const card = document.querySelector('[data-example="pulseMatrix"]');
		const slider = card.querySelector('[data-control="bpm"]');
		slider.value = "140";
		slider.dispatchEvent(new window.Event("input", { bubbles: true }));
	});

	it("pauses and resumes a startExample demo via its motion toggle, using the custom startFn", () => {
		bootExamplePage({ page: "examples" });
		const card = document.querySelector('[data-example="pulseMatrix"]');
		const toggle = card.querySelector('[data-action="toggle-motion"]');
		expect(toggle).toBeTruthy();
		toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(toggle.getAttribute("aria-pressed")).toBe("true");
		toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		expect(toggle.getAttribute("aria-pressed")).toBe("false");
	});

	it("reports and stops a startExample demo whose draw callback throws mid-frame", () => {
		document.body.innerHTML = PAGE_HTML.examples;
		mockCanvasApis();
		const pulseCanvas = document
			.querySelector('[data-example="pulseMatrix"]')
			.querySelector("canvas");
		pulseCanvas.getContext = () => {
			const ctx = createMockCanvasContext();
			ctx.arc = () => {
				throw new Error("boom");
			};
			return ctx;
		};
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		jest.isolateModules(() => {
			require("../src/sine-wave-generator.js");
			require("../src/audio-sync.js");
			require("../examples/example.js");
		});
		document.dispatchEvent(new window.Event("DOMContentLoaded"));
		expect(() => flushRaf(1)).not.toThrow();
		expect(errorSpy).toHaveBeenCalledWith(
			expect.stringContaining("pulseMatrix"),
			expect.any(Error),
		);
		const card = document.querySelector('[data-example="pulseMatrix"]');
		expect(card.querySelector(".demo-error")).toBeTruthy();
		errorSpy.mockRestore();
	});

	it("shows a reduced-motion note on every demo card when the OS prefers it", () => {
		// prefersReducedMotion is read once at module top-level evaluation, so
		// the matchMedia mock must be in place before example.js is required.
		document.body.innerHTML = PAGE_HTML.examples;
		mockCanvasApis();
		window.matchMedia = jest.fn((query) => ({
			matches: query === "(prefers-reduced-motion: reduce)",
			media: query,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		}));
		jest.isolateModules(() => {
			require("../src/sine-wave-generator.js");
			require("../src/audio-sync.js");
			require("../examples/example.js");
		});
		document.dispatchEvent(new window.Event("DOMContentLoaded"));
		const card = document.querySelector('[data-example="pulseMatrix"]');
		expect(card.querySelector(".motion-note")).toBeTruthy();
	});

	it("doesn't duplicate the reduced-motion note if one already exists", () => {
		document.body.innerHTML = PAGE_HTML.examples;
		mockCanvasApis();
		const card = document.querySelector('[data-example="pulseMatrix"]');
		const existingNote = document.createElement("div");
		existingNote.className = "motion-note";
		card.appendChild(existingNote);
		window.matchMedia = jest.fn((query) => ({
			matches: query === "(prefers-reduced-motion: reduce)",
			media: query,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		}));
		jest.isolateModules(() => {
			require("../src/sine-wave-generator.js");
			require("../src/audio-sync.js");
			require("../examples/example.js");
		});
		document.dispatchEvent(new window.Event("DOMContentLoaded"));
		expect(card.querySelectorAll(".motion-note").length).toBe(1);
	});

	it("no-ops gracefully when an examples-page demo's card is present but incomplete", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					document
						.querySelector('[data-example="stringPhysics"]')
						.querySelector("canvas")
						?.remove();
					document
						.querySelector('[data-example="searchMicWave"]')
						.querySelector("[data-action=mic-start]")
						?.remove();
					document
						.querySelector('[data-example="reducedMotionDemo"]')
						.querySelector("[data-action=toggle-reduced-motion]")
						?.remove();
					document
						.querySelector('[data-example="colorSchemeDemo"]')
						.querySelector("[data-action=toggle-color-scheme]")
						?.remove();
					document
						.querySelector('[data-example="voiceRecorder"]')
						.querySelector("[data-playback]")
						?.remove();
					document.getElementById("heroBackgroundCanvas")?.remove();
				},
			}),
		).not.toThrow();
	});
});
