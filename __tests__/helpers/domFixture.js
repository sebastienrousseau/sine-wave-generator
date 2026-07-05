"use strict";

/**
 * Builds one real page's <body> inner content at a time, matching how
 * the site actually loads: each page is its own document, and only one
 * page's set of data-example cards/canvases exists at once. Several
 * pages reuse the same data-example key for different purposes (e.g. a
 * homepage preview card vs. the full interactive card on the examples
 * page), so combining every page into one document would make
 * querySelector pick whichever happened to come first — not something
 * that can happen on the real site.
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../../src");

const MAIN_OPEN = '<main class="page">';
const MAIN_CLOSE = "</main>";
const BODY_OPEN = "<body>";

/** Returns one page's full <body> inner content (shared header chrome + that page's own <main>). */
const buildPageFixture = (file) => {
	const html = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
	const bodyStart = html.indexOf(BODY_OPEN) + BODY_OPEN.length;
	const mainStart = html.indexOf(MAIN_OPEN);
	const mainEnd = html.lastIndexOf(MAIN_CLOSE);
	if (mainStart === -1 || mainEnd === -1) {
		throw new Error(`Could not locate <main class="page"> in ${file}`);
	}
	return html.slice(bodyStart, mainEnd + MAIN_CLOSE.length);
};

/** Returns just the shared header chrome, with an empty <main> — every demo's target element is absent, so every init function's "not found" guard runs. */
const buildBareFixture = () => {
	const full = buildPageFixture("template.html");
	const mainStart = full.indexOf(MAIN_OPEN);
	return `${full.slice(0, mainStart)}${MAIN_OPEN}${MAIN_CLOSE}`;
};

module.exports = { buildPageFixture, buildBareFixture };
