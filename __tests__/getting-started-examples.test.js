"use strict";

const fs = require("fs");
const path = require("path");
const { extractHtmlCodeBlocks } = require("./helpers/extractCodeBlocks");
const { createMockCanvasContext } = require("./helpers/browserMocks");
const { packageRequire, PACKAGE_NAME } = require("./helpers/packageRequire");

const PAGE_PATH = path.resolve(__dirname, "../src/getting-started.html");
const PAGE_HTML = fs.readFileSync(PAGE_PATH, "utf8");
const PACKAGE_JSON = require("../package.json");
const BLOCKS = extractHtmlCodeBlocks(PAGE_HTML);

const extractInlineScript = (html) => {
	const scripts = [
		...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
	];
	const inline = scripts.find(
		(m) => !/<script[^>]*\ssrc=/.test(m[0]) && m[1].trim().length > 0,
	);
	return inline ? inline[1] : null;
};

describe("getting-started.html code examples", () => {
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

	it("has at least the expected number of code blocks (catches accidental markup breakage)", () => {
		expect(BLOCKS.length).toBeGreaterThanOrEqual(10);
	});

	it("every install/CDN snippet references the real, current package name", () => {
		const withPackageName = BLOCKS.filter((code) =>
			code.includes("sine-wave-generator"),
		);
		expect(withPackageName.length).toBeGreaterThan(3);
		withPackageName.forEach((code) => {
			expect(code).toContain(PACKAGE_JSON.name);
		});
	});

	it("runs the browser <script>-tag quick start example against the real library", () => {
		const block = BLOCKS.find(
			(code) => code.includes("<canvas") && code.includes("SineWaveGenerator"),
		);
		expect(block).toBeTruthy();
		const inlineScript = extractInlineScript(block);
		expect(inlineScript).toBeTruthy();

		document.body.innerHTML = '<canvas id="sine"></canvas>';
		window.SineWaveGenerator = packageRequire(PACKAGE_NAME).SineWaveGenerator;
		expect(() => new Function(inlineScript)()).not.toThrow();
		delete window.SineWaveGenerator;
	});

	it("runs the CommonJS/ESM quick start example", () => {
		const block = BLOCKS.find(
			(code) => code.includes("require(") && code.includes("getElementById"),
		);
		expect(block).toBeTruthy();

		document.body.innerHTML = '<canvas id="sine"></canvas>';
		const runRequire = (specifier) => packageRequire(specifier);
		expect(() => new Function("require", block)(runRequire)).not.toThrow();
	});

	it("runs the TypeScript quick start example (valid plain JS beyond the import line)", () => {
		const block = BLOCKS.find(
			(code) =>
				code.includes('from "@sebastienrousseau/sine-wave-generator"') &&
				code.includes('el: "#canvas"'),
		);
		expect(block).toBeTruthy();
		const body = block.replace(/^import[^\n]*\n/, "");
		document.body.innerHTML = '<canvas id="canvas"></canvas>';
		const { SineWaveGenerator, Wave, Ease } = packageRequire(PACKAGE_NAME);
		expect(() =>
			new Function("SineWaveGenerator", "Wave", "Ease", body)(
				SineWaveGenerator,
				Wave,
				Ease,
			),
		).not.toThrow();
	});

	it("runs the minimal-reproduction single-file example against the real library", () => {
		const block = BLOCKS.find((code) => code.includes("<!doctype html>"));
		expect(block).toBeTruthy();
		const inlineScript = extractInlineScript(block);
		expect(inlineScript).toBeTruthy();

		document.body.innerHTML =
			'<canvas id="sine" style="width: 100%; height: 300px"></canvas>';
		window.SineWaveGenerator = packageRequire(PACKAGE_NAME).SineWaveGenerator;
		expect(() => new Function(inlineScript)()).not.toThrow();
		delete window.SineWaveGenerator;
	});

	it("runs the hero-background common-pattern example", () => {
		document.body.innerHTML = '<canvas id="hero"></canvas>';
		const block = BLOCKS.find((code) => code.includes('el: "#hero"'));
		expect(block).toBeTruthy();
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		expect(() =>
			new Function("SineWaveGenerator", block)(SineWaveGenerator),
		).not.toThrow();
	});

	it("runs the responsive-container common-pattern example", () => {
		document.body.innerHTML = '<canvas id="c"></canvas>';
		const block = BLOCKS.find(
			(code) =>
				code.includes("autoResize: true") && code.includes("el: canvas"),
		);
		expect(block).toBeTruthy();
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		const canvas = document.getElementById("c");
		expect(() =>
			new Function("SineWaveGenerator", "canvas", block)(
				SineWaveGenerator,
				canvas,
			),
		).not.toThrow();
	});

	it("runs the pointer-interaction common-pattern example against a real generator", () => {
		document.body.innerHTML = '<canvas id="c"></canvas>';
		const block = BLOCKS.find((code) =>
			code.includes('addEventListener("pointermove"'),
		);
		expect(block).toBeTruthy();
		const { SineWaveGenerator } = packageRequire(PACKAGE_NAME);
		const canvas = document.getElementById("c");
		const gen = new SineWaveGenerator({
			el: canvas,
			waves: [{ amplitude: 10, wavelength: 100 }],
		});
		expect(() =>
			new Function("canvas", "gen", block)(canvas, gen),
		).not.toThrow();
		canvas.dispatchEvent(
			new window.MouseEvent("pointermove", { clientY: 50, bubbles: true }),
		);
		gen.stop();
	});
});
