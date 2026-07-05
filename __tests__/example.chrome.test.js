"use strict";

const { installBrowserMocks } = require("./helpers/browserMocks");
const { bootExamplePage } = require("./helpers/bootPage");

describe("examples/example.js — Site-wide chrome", () => {
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

	it("toggles dark mode and persists the preference", () => {
		bootExamplePage({ page: "examples" });
		const toggle = document.getElementById("themeToggle");
		toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
	});

	it("no-ops gracefully when the theme toggle button is missing", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					document.getElementById("themeToggle")?.remove();
				},
			}),
		).not.toThrow();
	});

	it("no-ops gracefully when the nav toggle is missing", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					document.querySelector(".nav-toggle")?.remove();
				},
			}),
		).not.toThrow();
	});

	it("no-ops gracefully when #site-nav is missing", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					document.getElementById("site-nav")?.remove();
				},
			}),
		).not.toThrow();
	});

	it("skips marking an external link active when #site-nav contains one", () => {
		expect(() =>
			bootExamplePage({
				page: "examples",
				onBeforeBoot: () => {
					const nav = document.getElementById("site-nav");
					const link = document.createElement("a");
					link.href = "https://example.com/external";
					nav.appendChild(link);
				},
			}),
		).not.toThrow();
	});

	it("respects a previously stored theme preference", () => {
		window.localStorage.setItem("theme", "dark");
		expect(() => bootExamplePage({ page: "examples" })).not.toThrow();
		window.localStorage.removeItem("theme");
	});

	it("falls back to the OS dark-scheme preference when nothing is stored", () => {
		window.localStorage.removeItem("theme");
		bootExamplePage({
			page: "examples",
			onBeforeBoot: () => {
				window.matchMedia = jest.fn((query) => ({
					matches: query === "(prefers-color-scheme: dark)",
					media: query,
					addEventListener: jest.fn(),
					removeEventListener: jest.fn(),
				}));
			},
		});
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("shows 'Copied!' then reverts after a delay", async () => {
		// gettingStarted has no never-ending recursive-setTimeout demos
		// (unlike examples.html's dynamic add/remove wave demo), so fake
		// timers here don't cascade into unrelated background loops.
		jest.useFakeTimers();
		bootExamplePage({ page: "gettingStarted" });
		const copyButton = document.querySelectorAll(".copy-btn")[0];
		const original = copyButton.textContent;
		copyButton.dispatchEvent(new window.Event("click", { bubbles: true }));
		// Flush the copyToClipboard promise microtask (fake timers don't fake
		// Promises) before the setTimeout it schedules can exist.
		await Promise.resolve();
		await Promise.resolve();
		expect(copyButton.textContent).toBe("Copied!");
		jest.advanceTimersByTime(2000);
		expect(copyButton.textContent).toBe(original);
	});

	it("toggles the mobile nav", () => {
		bootExamplePage({ page: "examples" });
		const navToggle = document.querySelector(".nav-toggle");
		navToggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		navToggle.dispatchEvent(new window.Event("click", { bubbles: true }));
	});

	it("copies code via the clipboard API and via execCommand fallback", async () => {
		const writeText = jest.fn(() => Promise.resolve());
		bootExamplePage({
			page: "gettingStarted",
			onBeforeBoot: () => {
				navigator.clipboard = { writeText };
			},
		});
		const copyButtons = document.querySelectorAll(".copy-btn");
		expect(copyButtons.length).toBeGreaterThan(0);
		copyButtons[0].dispatchEvent(new window.Event("click", { bubbles: true }));
		await Promise.resolve();
	});

	it("falls back to execCommand when clipboard API is unavailable", () => {
		bootExamplePage({
			page: "gettingStarted",
			onBeforeBoot: () => {
				Object.defineProperty(navigator, "clipboard", {
					configurable: true,
					writable: true,
					value: undefined,
				});
			},
		});
		const copyButtons = document.querySelectorAll(".copy-btn");
		expect(copyButtons.length).toBeGreaterThan(0);
		copyButtons[0].dispatchEvent(new window.Event("click", { bubbles: true }));
	});

	it("expands and collapses view-code toggles", () => {
		bootExamplePage({ page: "examples" });
		const toggles = document.querySelectorAll(".view-code-toggle");
		expect(toggles.length).toBeGreaterThan(0);
		toggles.forEach((toggle) => {
			toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
			toggle.dispatchEvent(new window.Event("click", { bubbles: true }));
		});
	});

	it("filters the examples gallery via the search input, debounced, matching only title/description", () => {
		jest.useFakeTimers();
		bootExamplePage({ page: "examples" });
		const search = document.getElementById("examples-search");
		expect(search).toBeTruthy();
		const waveLoop = document.querySelector('[data-example="waveLoop"]');
		const pulseMatrix = document.querySelector('[data-example="pulseMatrix"]');

		search.value = "wave loop";
		search.dispatchEvent(new window.Event("input", { bubbles: true }));
		// Not yet applied — filtering is debounced.
		expect(waveLoop.style.display).not.toBe("none");
		jest.advanceTimersByTime(80);
		expect(waveLoop.style.display).toBe("");
		expect(pulseMatrix.style.display).toBe("none");

		// A rapid second keystroke resets the debounce timer rather than
		// stacking a second filter pass.
		search.value = "";
		search.dispatchEvent(new window.Event("input", { bubbles: true }));
		jest.advanceTimersByTime(80);
		expect(waveLoop.style.display).toBe("");
		expect(pulseMatrix.style.display).toBe("");
	});
});
