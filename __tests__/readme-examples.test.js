"use strict";

const fs = require("fs");
const path = require("path");
const React = require("react");
const { render, cleanup } = require("@testing-library/react");
const { extractMarkdownCodeBlocks } = require("./helpers/extractCodeBlocks");
const { createMockCanvasContext } = require("./helpers/browserMocks");
const { packageRequire, PACKAGE_NAME } = require("./helpers/packageRequire");

const README_PATH = path.resolve(__dirname, "../README.md");
const README = fs.readFileSync(README_PATH, "utf8");
const PACKAGE_JSON = require("../package.json");
const BLOCKS = extractMarkdownCodeBlocks(README);

const extractInlineScript = (html) => {
	const scripts = [
		...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
	];
	const inline = scripts.find(
		(m) => !/<script[^>]*\ssrc=/.test(m[0]) && m[1].trim().length > 0,
	);
	return inline ? inline[1] : null;
};

describe("README.md code examples", () => {
	let originalGetContext;
	let originalGetBoundingClientRect;
	let originalRaf;
	let originalCancel;
	let originalMatchMedia;

	beforeEach(() => {
		originalGetContext = HTMLCanvasElement.prototype.getContext;
		originalGetBoundingClientRect =
			HTMLCanvasElement.prototype.getBoundingClientRect;
		originalRaf = global.requestAnimationFrame;
		originalCancel = global.cancelAnimationFrame;
		originalMatchMedia = window.matchMedia;
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
		window.matchMedia = () => ({
			matches: false,
			media: "",
			addEventListener: () => {},
			removeEventListener: () => {},
		});
		document.body.innerHTML = "";
	});

	afterEach(() => {
		HTMLCanvasElement.prototype.getContext = originalGetContext;
		HTMLCanvasElement.prototype.getBoundingClientRect =
			originalGetBoundingClientRect;
		global.requestAnimationFrame = originalRaf;
		global.cancelAnimationFrame = originalCancel;
		window.matchMedia = originalMatchMedia;
		document.body.innerHTML = "";
	});

	it("has at least the expected number of fenced code blocks (catches accidental fence removal)", () => {
		expect(BLOCKS.length).toBeGreaterThanOrEqual(12);
	});

	it("every bash install command references the real, current package name", () => {
		const bashBlocks = BLOCKS.filter((b) => b.lang === "bash");
		expect(bashBlocks.length).toBeGreaterThan(0);
		bashBlocks.forEach((block) => {
			expect(block.code).toContain(PACKAGE_JSON.name);
		});
		expect(PACKAGE_JSON.name).toBe(PACKAGE_NAME);
	});

	it("every js/jsx/ts code block is at least syntactically valid", () => {
		const codeBlocks = BLOCKS.filter((b) =>
			["js", "ts", "jsx"].includes(b.lang),
		);
		expect(codeBlocks.length).toBeGreaterThan(0);
		codeBlocks.forEach((block) => {
			// jsx/ts blocks may use import/type syntax the sloppy-mode Function
			// constructor can't parse; a parse-only babel pass (already a
			// project devDependency) still catches real typos/drift without
			// needing a full TS or JSX toolchain wired into this test.
			const babel = require("@babel/core");
			expect(() =>
				babel.parse(block.code, {
					presets: [],
					filename: `readme-block.${block.lang}`,
					sourceType: "unambiguous",
					parserOpts: {
						plugins: block.lang === "jsx" ? ["jsx"] : [],
						allowReturnOutsideFunction: true,
						errorRecovery: false,
					},
				}),
			).not.toThrow();
		});
	});

	it("runs the browser <script>-tag basic usage example against the real library", () => {
		const htmlBlock = BLOCKS.find(
			(b) => b.lang === "html" && b.code.includes("SineWaveGenerator"),
		);
		expect(htmlBlock).toBeTruthy();
		const inlineScript = extractInlineScript(htmlBlock.code);
		expect(inlineScript).toBeTruthy();

		document.body.innerHTML = '<canvas id="sine"></canvas>';
		window.SineWaveGenerator = packageRequire(PACKAGE_NAME).SineWaveGenerator;
		expect(() => new Function(inlineScript)()).not.toThrow();
		delete window.SineWaveGenerator;
	});

	it("runs the CommonJS module-usage example (require + construct + start)", () => {
		document.body.innerHTML = '<canvas id="sine"></canvas>';
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		const generator = new SineWaveGenerator({
			el: "#sine",
			maxPixelRatio: 2,
			waves: [{ amplitude: 26, wavelength: 120, speed: 0.8 }],
		});
		expect(() => generator.start()).not.toThrow();
		generator.stop();
	});

	it("runs the /audio-sync subpath require example", () => {
		const { AudioSync } = packageRequire(`${PACKAGE_NAME}/audio-sync`);
		expect(() => new AudioSync()).not.toThrow();
	});

	it("runs the BPM-reactive sync example end to end", () => {
		document.body.innerHTML = '<canvas id="sine"></canvas><audio></audio>';
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		const { AudioSync } = packageRequire(`${PACKAGE_NAME}/audio-sync`);

		const generator = new SineWaveGenerator({
			el: "#sine",
			waves: [{ amplitude: 20, wavelength: 120, speed: 0.5 }],
		});
		const audioSync = new AudioSync();
		const audioEl = document.querySelector("audio");
		// connect() needs a real Web Audio API; that's exercised separately
		// in audio-sync.test.js. Here we verify the documented wiring —
		// syncToAudio accepts the instance and doesn't throw — matches the
		// real API shape.
		expect(() => generator.syncToAudio(audioSync)).not.toThrow();
		expect(() => generator.start()).not.toThrow();
		expect(audioEl).toBeInstanceOf(window.HTMLAudioElement);
		generator.stop();
	});

	it("runs the custom audio mapping example", () => {
		document.body.innerHTML = '<canvas id="sine"></canvas>';
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		const { AudioSync } = packageRequire(`${PACKAGE_NAME}/audio-sync`);
		const generator = new SineWaveGenerator({ el: "#sine" });
		const audioSync = new AudioSync();
		expect(() =>
			generator.syncToAudio(audioSync, {
				amplitude: { source: "bass", intensity: 2 },
				speed: { source: "energy", intensity: 1 },
				rotate: { source: "treble", intensity: 0.5 },
			}),
		).not.toThrow();
		expect(() => generator.unsyncAudio()).not.toThrow();
	});

	it("runs the accessibility/responsiveness constructor example", () => {
		document.body.innerHTML = '<canvas id="sine"></canvas>';
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		const generator = new SineWaveGenerator({
			el: "#sine",
			ariaLabel: "Ambient background animation",
			reducedMotionScale: 0,
		});
		const canvas = document.getElementById("sine");
		expect(canvas.getAttribute("role")).toBe("img");
		expect(canvas.getAttribute("aria-label")).toBe(
			"Ambient background animation",
		);
		generator.stop();
	});

	it("throws a CanvasError (not a generic Error) for a missing canvas, matching the documented try/catch", () => {
		const { SineWaveGenerator, CanvasError } = packageRequire(PACKAGE_NAME);
		let caught = null;
		try {
			new SineWaveGenerator({ el: "#missing-canvas" });
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(CanvasError);
	});

	it("exports every name listed in the TypeScript import block from the module it claims", () => {
		const tsImportBlock = BLOCKS.find(
			(b) => b.lang === "ts" && b.code.includes("SineWaveGeneratorOptions"),
		);
		expect(tsImportBlock).toBeTruthy();

		const importStatements = [
			...tsImportBlock.code.matchAll(
				/import\s*\{([\s\S]*?)\}\s*from\s*"([^"]+)";/g,
			),
		];
		expect(importStatements.length).toBeGreaterThanOrEqual(2);

		const typesSource = fs.readFileSync(
			path.resolve(__dirname, "../index.d.ts"),
			"utf8",
		);
		let totalNamesChecked = 0;
		importStatements.forEach(([, namesBlock, specifier]) => {
			const runtimeExports = packageRequire(specifier);
			const names = namesBlock
				.split(",")
				.map((n) => n.trim())
				.filter(Boolean);
			expect(names.length).toBeGreaterThan(0);
			names.forEach((name) => {
				totalNamesChecked += 1;
				const isRuntimeValue = name in runtimeExports;
				const isTypeOnly = new RegExp(`\\b(interface|type)\\s+${name}\\b`).test(
					typesSource,
				);
				expect(isRuntimeValue || isTypeOnly).toBe(true);
			});
		});
		expect(totalNamesChecked).toBeGreaterThan(10);
	});

	it("renders the documented useSineWaveGenerator hook usage (React.createElement equivalent of the JSX example)", async () => {
		const { useSineWaveGenerator } = packageRequire(
			`${PACKAGE_NAME}/use-sine-wave-generator`,
		);

		const AmbientBackground = () => {
			const { canvasRef } = useSineWaveGenerator({
				waves: [{ amplitude: 20, wavelength: 120, speed: 0.5 }],
				ariaLabel: "Ambient background animation",
			});
			return React.createElement("canvas", {
				ref: canvasRef,
				style: { width: "100%", height: "100%" },
			});
		};

		const { container, unmount } = render(
			React.createElement(AmbientBackground),
		);
		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInstanceOf(HTMLCanvasElement);
		expect(canvas.getAttribute("role")).toBe("img");
		expect(canvas.getAttribute("aria-label")).toBe(
			"Ambient background animation",
		);
		unmount();
		cleanup();
	});
});
