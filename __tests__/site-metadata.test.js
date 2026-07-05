"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PACKAGE_JSON = require("../package.json");

describe("llms.txt / llms-full.txt", () => {
	const llmsTxt = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");
	const llmsFullTxt = fs.readFileSync(path.join(ROOT, "llms-full.txt"), "utf8");

	it("llms.txt starts with a single H1 (mandatory per the llmstxt.org spec)", () => {
		const lines = llmsTxt.split("\n");
		expect(lines[0]).toMatch(/^# .+/);
		const h1Count = lines.filter((line) => /^# /.test(line)).length;
		expect(h1Count).toBe(1);
	});

	it("llms.txt has a blockquote summary and at least one H2-delimited section", () => {
		expect(llmsTxt).toMatch(/^> .+/m);
		const h2Count = (llmsTxt.match(/^## /gm) || []).length;
		expect(h2Count).toBeGreaterThanOrEqual(1);
	});

	it("llms.txt only links to real site sections and the full-reference file", () => {
		const links = [...llmsTxt.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(
			(m) => m[1],
		);
		expect(links.length).toBeGreaterThan(3);
		links.forEach((link) => {
			expect(link).toMatch(
				/^https:\/\/(sine-wave-generator\.com|github\.com\/sebastienrousseau\/sine-wave-generator|www\.npmjs\.com\/package\/@sebastienrousseau\/sine-wave-generator)/,
			);
		});
	});

	it("references the current package name and version", () => {
		expect(llmsTxt).toContain(PACKAGE_JSON.name);
		expect(llmsFullTxt).toContain(PACKAGE_JSON.name);
		expect(llmsFullTxt).toContain(PACKAGE_JSON.version);
	});

	// The curated public API — matching README.md's own "Instance methods"
	// tables — not every prototype method. SineWaveGenerator and AudioSync
	// both expose plenty of internal helpers (bindResizeObserver,
	// onPointerMove, captureAudioBase, ...) that are real methods but not
	// part of the documented consumer-facing surface.
	const SINE_WAVE_GENERATOR_PUBLIC_API = [
		"start",
		"stop",
		"resize",
		"addWave",
		"removeWave",
		"bindEvents",
		"unbindEvents",
		"syncToAudio",
		"unsyncAudio",
	];
	const AUDIO_SYNC_PUBLIC_API = [
		"connect",
		"disconnect",
		"update",
		"getMetrics",
	];

	it("llms-full.txt documents every method in SineWaveGenerator's public API table, and each one is real", () => {
		const { SineWaveGenerator } = require("../src/sine-wave-generator.js");
		SINE_WAVE_GENERATOR_PUBLIC_API.forEach((method) => {
			expect(typeof SineWaveGenerator.prototype[method]).toBe("function");
			expect(llmsFullTxt).toContain(`${method}(`);
		});
	});

	it("llms-full.txt documents every method in AudioSync's public API table, and each one is real", () => {
		const { AudioSync } = require("../src/audio-sync.js");
		AUDIO_SYNC_PUBLIC_API.forEach((method) => {
			expect(typeof AudioSync.prototype[method]).toBe("function");
			expect(llmsFullTxt).toContain(`${method}(`);
		});
	});
});

describe("schema.org SoftwareApplication structured data", () => {
	const templateHtml = fs.readFileSync(
		path.join(ROOT, "src/template.html"),
		"utf8",
	);
	const scriptMatch = templateHtml.match(
		/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
	);

	it("is present on the homepage exactly once (no duplicate/conflicting blocks)", () => {
		expect(scriptMatch).toBeTruthy();
		const allBlocks = [
			...templateHtml.matchAll(/<script type="application\/ld\+json">/g),
		];
		expect(allBlocks.length).toBe(1);
	});

	it("is valid, parseable JSON-LD for a SoftwareApplication", () => {
		const data = JSON.parse(scriptMatch[1]);
		expect(data["@context"]).toBe("https://schema.org");
		expect(data["@type"]).toBe("SoftwareApplication");
		expect(data.name).toBeTruthy();
		expect(data.applicationCategory).toBeTruthy();
	});

	it("references the current package name, version, and author, matching package.json", () => {
		const data = JSON.parse(scriptMatch[1]);
		expect(data.softwareVersion).toBe(PACKAGE_JSON.version);
		expect(data.author.name).toBe(PACKAGE_JSON.author.name);
		expect(data.downloadUrl).toContain(PACKAGE_JSON.name);
		expect(data.license).toMatch(/apache/i);
	});
});
